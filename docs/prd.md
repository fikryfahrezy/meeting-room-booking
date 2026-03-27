# Meeting Room Booking System PRD

## Objective
Build a meeting room booking application that allows authenticated users to see room availability, create bookings, and manage their own reservations. The system must use a centralized database so availability and bookings are shared across all users in real time.

## Users
- Member: authenticated employee who can browse rooms, check availability, create bookings, and manage their own bookings.
- Admin: authenticated user with elevated access to manage rooms and oversee all bookings.

## In Scope
- User authentication
- Role-based authorization
- Shared room catalog
- Availability lookup by date
- Booking creation with conflict prevention
- Booking history per user
- Booking cancellation
- Centralized persistence for users, rooms, and bookings
- Admin visibility into rooms and bookings

## Out of Scope
- Calendar integrations
- Notifications by email, SMS, or chat
- Recurring bookings
- Visitor management
- Floor map visualization
- Approval workflows

## Core User Journeys
1. A member signs in, selects a date, reviews room availability, and books an available room.
2. A member opens their bookings and cancels one of their future reservations.
3. A second member sees the updated availability and cannot book the same room for an overlapping time slot.
4. An admin reviews room usage and booking activity across all users.

## Functional Requirements

### FR-001: MUST - User authentication
The system must allow users to sign in and sign out with individual credentials.

Acceptance Criteria:
- Unauthenticated users cannot access booking features.
- Invalid credentials are rejected with a clear error message.
- Authenticated users remain signed in until they sign out or their session expires.

### FR-002: MUST - Role-based authorization
The system must enforce permissions based on the authenticated user. Admin controls are shown inline on shared pages — there are no separate admin-only routes.

Acceptance Criteria:
- Members can create and cancel only their own bookings.
- Members cannot cancel or edit bookings created by other members.
- Admins see additional controls (add, edit, deactivate rooms; cancel any booking) on the same pages members use.
- Admin-only actions are rejected on the server side for non-admin users regardless of UI visibility.

### FR-003: MUST - Room directory
The system must display a list of meeting rooms with the information needed to choose a room.

Acceptance Criteria:
- Each room shows at least name, capacity, and location.
- Only active rooms are shown to members.
- Admins also see inactive rooms and room management controls (add, edit, activate/deactivate) on the same page.
- Admin changes to rooms are reflected to all users.

### FR-004: MUST - Availability by date
The system must let users check room availability for a selected date.

Acceptance Criteria:
- Users can select a date before booking.
- The system shows whether each room is available or booked for the selected date.
- Users can see enough detail to understand which time ranges are already booked.

### FR-005: MUST - Booking creation
The system must let an authenticated member create a booking for an available room.

Acceptance Criteria:
- A booking requires room, date, start time, and end time.
- The booking is associated with the authenticated user.
- A successful booking is immediately visible in room availability and booking history.

### FR-006: MUST - Conflict prevention
The system must prevent overlapping active bookings for the same room.

Acceptance Criteria:
- A booking request is rejected if it overlaps an existing active booking for the same room.
- Two different users cannot successfully reserve the same room for overlapping times.
- The user receives a clear conflict message when a booking is rejected.

### FR-007: MUST - My bookings
The system must provide each member with a view of their bookings.

Acceptance Criteria:
- Members can see their upcoming and past bookings.
- Each booking shows room, date, start time, end time, and status.
- Members do not see other members' bookings in the personal bookings view.

### FR-008: MUST - Booking cancellation
The system must let users cancel eligible bookings.

Acceptance Criteria:
- Members can cancel their own active bookings.
- Admins can cancel any active booking.
- A canceled booking no longer blocks the room for future bookings.

### FR-009: MUST - Shared persistence
The system must persist users, rooms, and bookings in a centralized database.

Acceptance Criteria:
- Booking data remains available after page refresh and server restart.
- Availability is consistent across different user accounts.
- The system does not rely on browser localStorage for business data.

### FR-010: SHOULD - Room administration
The system should allow admins to manage room records inline on the shared rooms page.

Acceptance Criteria:
- Admins can create, update, activate, and deactivate rooms from the same page members use to browse rooms.
- Room management controls are hidden from members via RBAC.
- Room changes affect future booking availability without corrupting booking history.

## Non-Functional Requirements

### NFR-001: MUST - Security
- Passwords must be stored securely using one-way hashing.
- Protected operations require an authenticated session.
- Authorization checks must be enforced on the server side.

### NFR-002: MUST - Data integrity
- The system must guarantee that overlapping bookings for the same room cannot be created, including concurrent requests.
- Booking and cancellation actions must be durable after success is returned.

### NFR-003: SHOULD - Performance
- Availability queries and booking submission should return quickly enough for normal interactive use.
- Common room and booking pages should load without noticeable delay for typical office-scale data.

### NFR-004: SHOULD - Auditability
- The system should retain booking ownership, status, and timestamps for operational traceability.

### NFR-005: SHOULD - Usability
- The interface should work on desktop and mobile widths.
- Validation and conflict errors should be understandable without technical language.

## Release Acceptance
- Authenticated members can book rooms without seeing or changing other users' bookings.
- Different users cannot double-book the same room for overlapping times.
- Members can cancel their own bookings.
- Admins can view all bookings, manage rooms, and cancel any booking — all from shared pages, not separate routes.
- Admin controls are hidden from members via RBAC and rejected server-side when called without admin role.
- Room availability is shared consistently across multiple accounts.
- Business data is stored in the database, not in browser localStorage.
