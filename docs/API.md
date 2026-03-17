# API Documentation

Base URL: `http://localhost:8000/api/`

All endpoints (except Register and Login) require authentication via a token in the `Authorization` header:

```
Authorization: Token <your-token-here>
```

---

## Authentication Endpoints

### POST `/auth/register/`

Register a new user account.

**Access:** Public

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123",
  "password2": "securepass123",
  "role": "student"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| username | string | Yes | Must be unique |
| email | string | Yes | Must be unique, valid email |
| password | string | Yes | Minimum 8 characters |
| password2 | string | Yes | Must match password |
| role | string | Yes | `"student"` or `"teacher"` |

**Success Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "student",
    "date_joined": "2026-03-17T10:00:00Z"
  },
  "token": "abc123def456..."
}
```

**Error Response (400 Bad Request):**
```json
{
  "password2": ["Passwords do not match."],
  "username": ["A user with that username already exists."]
}
```

---

### POST `/auth/login/`

Log in with existing credentials.

**Access:** Public

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepass123"
}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "student",
    "date_joined": "2026-03-17T10:00:00Z"
  },
  "token": "abc123def456..."
}
```

**Error Response (400 Bad Request):**
```json
{
  "non_field_errors": ["Invalid username or password."]
}
```

---

### POST `/auth/logout/`

Log out the current user (deletes their auth token).

**Access:** Authenticated

**Success Response:** `204 No Content`

---

### GET `/auth/me/`

Get the currently authenticated user's information.

**Access:** Authenticated

**Success Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "student",
  "date_joined": "2026-03-17T10:00:00Z"
}
```

---

## Course Endpoints

### GET `/courses/`

List all courses.

**Access:** Authenticated (any role)

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Introduction to Python",
    "description": "Learn Python programming from scratch.",
    "teacher": 2,
    "teacher_name": "drsmith",
    "enrollment_count": 15,
    "created_at": "2026-03-17T10:00:00Z",
    "updated_at": "2026-03-17T10:00:00Z"
  }
]
```

---

### POST `/courses/`

Create a new course. The authenticated user is automatically set as the teacher.

**Access:** Teacher, Admin

**Request Body:**
```json
{
  "title": "Introduction to Python",
  "description": "Learn Python programming from scratch."
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Max 200 characters |
| description | string | Yes | Course description |

**Success Response (201 Created):**
```json
{
  "id": 1,
  "title": "Introduction to Python",
  "description": "Learn Python programming from scratch.",
  "teacher": 2,
  "teacher_name": "drsmith",
  "enrollment_count": 0,
  "created_at": "2026-03-17T10:00:00Z",
  "updated_at": "2026-03-17T10:00:00Z"
}
```

**Error Response (403 Forbidden):** Returned if a student tries to create a course.

---

### GET `/courses/:id/`

Get details of a specific course.

**Access:** Authenticated (any role)

**Success Response (200 OK):**
```json
{
  "id": 1,
  "title": "Introduction to Python",
  "description": "Learn Python programming from scratch.",
  "teacher": 2,
  "teacher_name": "drsmith",
  "enrollment_count": 15,
  "created_at": "2026-03-17T10:00:00Z",
  "updated_at": "2026-03-17T10:00:00Z"
}
```

---

### PUT `/courses/:id/`

Update a course.

**Access:** Course owner (teacher who created it) or Admin

**Request Body:**
```json
{
  "title": "Updated Course Title",
  "description": "Updated description."
}
```

**Success Response (200 OK):** Returns the updated course object.

**Error Response (403 Forbidden):** Returned if a non-owner teacher or student tries to update.

---

### DELETE `/courses/:id/`

Delete a course.

**Access:** Course owner (teacher who created it) or Admin

**Success Response:** `204 No Content`

**Error Response (403 Forbidden):** Returned if a non-owner teacher or student tries to delete.

---

## Enrollment Endpoints

### POST `/courses/:id/enroll/`

Enroll the current user in a course.

**Access:** Student only

**Success Response (201 Created):**
```json
{
  "id": 1,
  "course": {
    "id": 1,
    "title": "Introduction to Python",
    "description": "Learn Python programming from scratch.",
    "teacher": 2,
    "teacher_name": "drsmith",
    "enrollment_count": 16,
    "created_at": "2026-03-17T10:00:00Z",
    "updated_at": "2026-03-17T10:00:00Z"
  },
  "enrolled_at": "2026-03-17T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` — Already enrolled in this course
- `403 Forbidden` — User is not a student
- `404 Not Found` — Course does not exist

---

### DELETE `/courses/:id/unenroll/`

Unenroll the current user from a course.

**Access:** Student only

**Success Response:** `204 No Content`

**Error Responses:**
- `403 Forbidden` — User is not a student
- `404 Not Found` — Not enrolled in this course

---

### GET `/enrollments/`

List all courses the current user is enrolled in.

**Access:** Student only

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "course": {
      "id": 1,
      "title": "Introduction to Python",
      "description": "Learn Python programming from scratch.",
      "teacher": 2,
      "teacher_name": "drsmith",
      "enrollment_count": 15,
      "created_at": "2026-03-17T10:00:00Z",
      "updated_at": "2026-03-17T10:00:00Z"
    },
    "enrolled_at": "2026-03-17T12:00:00Z"
  }
]
```

---

## User Management Endpoints

### GET `/users/`

List all users.

**Access:** Admin only

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "date_joined": "2026-03-17T10:00:00Z"
  },
  {
    "id": 2,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "student",
    "date_joined": "2026-03-17T11:00:00Z"
  }
]
```

---

### PATCH `/users/:id/`

Update a user's details (typically used to change roles).

**Access:** Admin only

**Request Body:**
```json
{
  "role": "teacher"
}
```

**Success Response (200 OK):** Returns the updated user object.

---

### DELETE `/users/:id/`

Delete a user account.

**Access:** Admin only

**Success Response:** `204 No Content`

---

## Error Responses

All endpoints may return the following error responses:

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request — Invalid input data |
| 401 | Unauthorized — Missing or invalid token |
| 403 | Forbidden — Insufficient permissions for this action |
| 404 | Not Found — Resource does not exist |
| 500 | Internal Server Error |
