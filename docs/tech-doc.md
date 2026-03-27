# Meeting Room Booking System Tech Doc

## Scope
Implement the requirements from `docs/prd.md` in the existing split repository:
- Nuxt frontend in `front-end`
- Spring Boot backend in `back-end`
- PostgreSQL as the system of record

This document describes what engineers need to build: architecture, modules, API contracts, data model, authorization rules, booking flow, and delivery plan.

## Target Architecture

### Frontend
- Nuxt 4 application for authenticated user flows and room booking UI
- Pinia for client state such as session, selected filters, room list cache, and booking list cache
- Server communication through typed API composables

### Backend
- Spring Boot API for authentication, room management, availability lookup, and booking commands
- Spring Security for authentication and authorization
- Service layer for booking rules and transaction boundaries
- JPA repositories for persistence

### Database
- PostgreSQL for users, rooms, and bookings
- Migration tool recommended: Flyway
- No business data stored in localStorage

## Recommended Backend Dependencies
Add these dependencies in `back-end/build.gradle`:
- `spring-boot-starter-security`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `org.postgresql:postgresql`
- `org.flywaydb:flyway-core`

## Recommended Frontend Dependencies
Add these dependencies in `front-end/package.json`:
- `@pinia/nuxt`

## Module Plan

### Backend package structure
Recommended structure under `back-end/src/main/java/com/fikryfahrezy/room`:
- `auth`
	login, logout, current-user endpoints, security configuration
- `user`
	user entity, repository, role model
- `room`
	room entity, room service, room admin endpoints
- `booking`
	booking entity, availability query, booking command handlers
- `common`
	error responses, exception handling, API response utilities

### Frontend structure
Recommended structure under `front-end/app`:
- `pages/login.vue`
- `pages/index.vue` — room list for members; admin sees additional management controls inline
- `pages/bookings.vue` — personal bookings for members; admin sees all bookings inline
- `components/rooms/RoomCard.vue`
- `components/rooms/AvailabilityBadge.vue`
- `components/rooms/RoomFormDialog.vue` — add/edit room form (admin only, rendered conditionally)
- `components/bookings/BookingDialog.vue`
- `components/bookings/BookingList.vue`
- `components/layout/AppHeader.vue`
- `stores/auth.ts`
- `stores/rooms.ts`
- `stores/bookings.ts`
- `composables/useApi.ts`
- `composables/useAuth.ts`

Note: there is no `/admin` route prefix. Admin controls are shown or hidden on shared pages based on `user.role`.

## Data Model

### Users
Fields:
- `id`
- `email`
- `password_hash`
- `full_name`
- `role` with values `MEMBER` or `ADMIN`
- `created_at`
- `updated_at`

Constraints:
- `email` must be unique

### Rooms
Fields:
- `id`
- `name`
- `capacity`
- `location`
- `is_active`
- `created_at`
- `updated_at`

### Bookings
Fields:
- `id`
- `room_id`
- `user_id`
- `start_at`
- `end_at`
- `status` with values `ACTIVE` or `CANCELED`
- `created_at`
- `updated_at`
- `canceled_at`

Constraints:
- `end_at` must be greater than `start_at`
- `status` must be a valid enum value
- `room_id` and `user_id` must reference existing records

## Booking Consistency Rules
1. A booking conflict exists when two active bookings for the same room overlap.
2. Overlap rule: `newStart < existingEnd && existingStart < newEnd`.
3. Members can only cancel their own active bookings.
4. Admins can cancel any active booking.
5. Canceled bookings remain in the database for auditability but do not block future bookings.

## Race Condition Strategy
Use both application validation and a database-level guarantee.

Recommended PostgreSQL strategy:
1. Store booking times in `start_at` and `end_at`.
2. Add an exclusion constraint on active bookings for the same room.
3. Wrap booking creation in a transaction.

Recommended database rule:
`EXCLUDE USING gist (room_id WITH =, tstzrange(start_at, end_at, '[)') WITH &&) WHERE (status = 'ACTIVE')`

This requires the `btree_gist` extension.

## Authorization Rules

### Guest
- Can access login page only

### Member
- Can view active rooms
- Can view availability
- Can create bookings
- Can view own bookings
- Can cancel own bookings

### Admin
- Can perform all member actions
- Can view all bookings
- Can create, update, activate, and deactivate rooms
- Can cancel any booking

## API Contract

### Authentication

#### POST `/api/v1/auth/login`
Request:
```json
{
	"email": "user@example.com",
	"password": "secret"
}
```

Response `200`:
```json
{
	"user": {
		"id": "usr_123",
		"email": "user@example.com",
		"fullName": "Jane Doe",
		"role": "MEMBER"
	}
}
```

#### POST `/api/v1/auth/logout`
Response `204`

#### GET `/api/v1/auth/me`
Response `200`:
```json
{
	"id": "usr_123",
	"email": "user@example.com",
	"fullName": "Jane Doe",
	"role": "MEMBER"
}
```

### Rooms

#### GET `/api/v1/rooms`
Query params:
- `date=YYYY-MM-DD`

Response `200`:
```json
[
	{
		"id": "room_1",
		"name": "Board Room",
		"capacity": 12,
		"location": "Floor 2",
		"isAvailable": false,
		"bookedRanges": [
			{
				"startAt": "2026-03-27T09:00:00Z",
				"endAt": "2026-03-27T10:00:00Z"
			}
		]
	}
]
```

#### GET `/api/v1/admin/rooms`
Admin only. Returns all rooms including inactive ones.

#### POST `/api/v1/admin/rooms`
Admin only.

#### PUT `/api/v1/admin/rooms/{roomId}`
Admin only.

#### PATCH `/api/v1/admin/rooms/{roomId}`
Admin only. Partial update, used for toggling `isActive`.

### Bookings

#### GET `/api/v1/bookings/me`
Response `200`:
```json
[
	{
		"id": "bk_123",
		"room": {
			"id": "room_1",
			"name": "Board Room"
		},
		"startAt": "2026-03-27T09:00:00Z",
		"endAt": "2026-03-27T10:00:00Z",
		"status": "ACTIVE"
	}
]
```

#### GET `/api/v1/admin/bookings`
Admin only.

#### POST `/api/v1/bookings`
Request:
```json
{
	"roomId": "room_1",
	"startAt": "2026-03-27T09:00:00Z",
	"endAt": "2026-03-27T10:00:00Z"
}
```

Response `201`:
```json
{
	"id": "bk_123",
	"roomId": "room_1",
	"userId": "usr_123",
	"startAt": "2026-03-27T09:00:00Z",
	"endAt": "2026-03-27T10:00:00Z",
	"status": "ACTIVE"
}
```

Response `409` on conflict:
```json
{
	"code": "BOOKING_CONFLICT",
	"message": "The selected room is already booked for the requested time range."
}
```

#### POST `/api/v1/bookings/{bookingId}/cancel`
Allowed for booking owner or admin.

Response `200`:
```json
{
	"id": "bk_123",
	"status": "CANCELED"
}
```

## Authentication Approach
Use server-side authentication enforced by Spring Security.

Recommended approach:
1. User signs in with email and password.
2. Backend creates an authenticated session.
3. Frontend sends credentialed API requests for protected endpoints.
4. `GET /api/v1/auth/me` is used during app bootstrap to restore session state.

## Frontend Responsibilities

### Pages
- `login.vue`: sign-in form and auth errors
- `index.vue`: date filter, room list, room availability, open booking dialog; admins additionally see add/edit/deactivate controls inline
- `bookings.vue`: current user's bookings and cancellation; admins see all users' bookings inline

There is no `/admin` route. Role-based visibility is handled in each page via `user.role`.

### Components
- `AppHeader`: navigation, user identity, logout action
- `RoomCard`: room summary and current availability
- `AvailabilityBadge`: availability state and booked time hints
- `BookingDialog`: booking form and validation messages
- `BookingList`: list rendering for bookings and cancellation actions

### Stores
- `auth.ts`: current user, auth bootstrap, login/logout state
- `rooms.ts`: room list, selected date, availability loading; admin actions (create/update/toggle) also live here, guarded by role on the server
- `bookings.ts`: booking creation, booking cancellation, personal booking history; admin fetch-all action also lives here

## Backend Responsibilities

### Controllers
- `AuthController`
- `RoomController`
- `AdminRoomController`
- `BookingController`
- `AdminBookingController`

### Services
- `AuthService`
- `RoomService`
- `BookingService`
- `AvailabilityService`

### Repositories
- `UserRepository`
- `RoomRepository`
- `BookingRepository`

## Key Flows

### Login flow
1. User submits email and password.
2. Backend authenticates credentials.
3. Backend returns authenticated session.
4. Frontend fetches current user and routes to the dashboard.

### Availability flow
1. User selects a date.
2. Frontend requests `GET /api/v1/rooms?date=...`.
3. Backend returns rooms with availability summary for that date.
4. Frontend renders room state and booked ranges.

### Booking flow
1. User opens booking dialog from a room.
2. User submits date and time range.
3. Backend validates authorization, room status, time ordering, and booking conflicts.
4. Backend commits booking transaction.
5. Frontend refreshes rooms and personal bookings.

### Cancellation flow
1. User opens booking history.
2. User clicks cancel on an eligible booking.
3. Backend verifies ownership or admin access.
4. Backend updates booking status to `CANCELED`.
5. Frontend refreshes booking history and availability.

## Delivery Plan
1. Add backend persistence, security, validation, and migration dependencies.
2. Create user, room, and booking schema with migrations.
3. Implement authentication and session bootstrap endpoint.
4. Implement room and availability APIs.
5. Implement booking create and cancel APIs with transactional conflict protection.
6. Add frontend auth flow and protected routing.
7. Build dashboard with inline admin controls (RBAC), booking dialog, booking history.
8. Wire frontend stores to API contracts.
9. Add Docker Compose support for frontend, backend, and PostgreSQL together.

## Testing Plan

### Backend
- Unit tests for overlap logic and authorization checks
- Integration tests for booking creation conflict handling
- Integration tests for cancel permissions
- Repository or migration tests for database constraints

### Frontend
- Component tests for booking form validation and error states
- Store tests for auth and booking actions
- End-to-end tests for login, availability lookup, booking creation, and cancellation

### Acceptance verification
- Different users cannot book overlapping time slots for the same room.
- Members cannot cancel other members' bookings.
- Admin can manage rooms and oversee all bookings.
- Data survives refresh and restart because it is stored in PostgreSQL.