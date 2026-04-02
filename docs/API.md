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

## Assignment Endpoints

### GET `/courses/:course_id/assignments/`

List all assignments for a course.

**Access:** Enrolled students or course staff (teacher/admin)

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "course": 1,
    "course_title": "Introduction to Python",
    "title": "Homework 1",
    "description": "Complete the exercises in chapter 3.",
    "due_date": "2026-12-31T23:59:00Z",
    "max_points": 100,
    "submission_count": 5,
    "created_at": "2026-03-20T10:00:00Z",
    "updated_at": "2026-03-20T10:00:00Z"
  }
]
```

---

### POST `/courses/:course_id/assignments/`

Create a new assignment for a course.

**Access:** Course owner (teacher) or Admin

**Request Body:**
```json
{
  "title": "Homework 1",
  "description": "Complete the exercises in chapter 3.",
  "due_date": "2026-12-31T23:59:00Z",
  "max_points": 100
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Max 200 characters |
| description | string | Yes | Assignment details |
| due_date | datetime | Yes | ISO 8601 format |
| max_points | integer | No | Default: 100 |

**Success Response (201 Created):** Returns the created assignment object.

---

### GET `/courses/:course_id/assignments/:id/`

Get details of a specific assignment.

**Access:** Enrolled students or course staff

**Success Response (200 OK):** Returns the assignment object.

### PATCH / PUT `/courses/:course_id/assignments/:id/`

Update an existing assignment. `PATCH` supports partial updates; `PUT` expects a full assignment payload.

**Access:** Course owner or admin

**Request Body (JSON):**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | No | Max 200 characters |
| description | string | No | Assignment details |
| due_date | datetime | No | ISO 8601 format |
| max_points | integer | No | Default: 100 |

**Success Response (200 OK):** Returns the updated assignment object.

### DELETE `/courses/:course_id/assignments/:id/`

Delete an existing assignment.

**Access:** Course owner or admin

**Success Response (204 No Content):** Assignment successfully deleted. No response body.

---

## Submission Endpoints

### POST `/assignments/:id/submit/`

Submit work for an assignment. Supports text content, file uploads, or both. Sent as `multipart/form-data`.

**Access:** Student (must be enrolled in the course)

**Request Body (FormData):**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| content | string | No* | Text content of the submission |
| file | file | No* | Uploaded file (max 10MB) |

*At least one of `content` or `file` must be provided.

**Success Response (201 Created):**
```json
{
  "id": 1,
  "assignment": 1,
  "assignment_title": "Homework 1",
  "student": 3,
  "student_name": "johndoe",
  "content": "My answer to the exercises.",
  "file": null,
  "file_url": null,
  "status": "submitted",
  "grade": null,
  "feedback": "",
  "submitted_at": "2026-03-25T14:30:00Z",
  "graded_at": null
}
```

**Error Responses:**
- `400 Bad Request` — Already submitted, or no content/file provided
- `403 Forbidden` — Not enrolled in the course
- `404 Not Found` — Assignment not found

---

### GET `/assignments/:id/submissions/`

List submissions for an assignment. Teachers see all submissions for their course. Students see only their own.

**Access:** Authenticated

**Success Response (200 OK):** Returns a list of submission objects.

---

### GET `/submissions/:id/`

View a single submission. Students can only view their own. Teachers can view submissions for their courses.

**Access:** Authenticated

**Success Response (200 OK):** Returns the submission object (including `file_url` if a file was uploaded).

---

### PATCH `/submissions/:id/grade/`

Grade a student's submission.

**Access:** Course teacher or Admin

**Request Body:**
```json
{
  "grade": 85,
  "feedback": "Good work! Consider adding more detail to question 3."
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| grade | integer | Yes | Must be 0 to max_points |
| feedback | string | No | Written feedback for the student |

**Success Response (200 OK):** Returns the updated submission with `status: "graded"` and `graded_at` timestamp.

**Error Responses:**
- `400 Bad Request` — Grade exceeds max points
- `403 Forbidden` — Not the course teacher or admin

---

### GET `/my-submissions/`

List all submissions by the current student across all courses.

**Access:** Student only

**Success Response (200 OK):** Returns a list of submission objects.

---

## Achievement Endpoints

### GET `/achievements/`

List all achievement definitions.

**Access:** Authenticated

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "key": "first_enrollment",
    "name": "First Steps",
    "description": "Enroll in your first course",
    "icon": "school",
    "color": "#4caf50",
    "category": "student",
    "sort_order": 3
  }
]
```

---

### GET `/achievements/me/`

List achievements earned by the current user.

**Access:** Authenticated

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "achievement": {
      "id": 1,
      "key": "first_enrollment",
      "name": "First Steps",
      "description": "Enroll in your first course",
      "icon": "school",
      "color": "#4caf50",
      "category": "student",
      "sort_order": 3
    },
    "earned_at": "2026-03-25T14:30:00Z"
  }
]
```

---

### POST `/achievements/check/`

Evaluate all achievement criteria for the current user and award any newly earned badges.

**Access:** Authenticated

**Success Response (200 OK):**
```json
[
  {
    "id": 5,
    "achievement": {
      "id": 2,
      "key": "first_submission",
      "name": "Hand It In",
      "description": "Submit your first assignment"
    },
    "earned_at": "2026-03-25T14:35:00Z"
  },
  {
    "id": 6,
    "achievement": {
      "id": 3,
      "key": "ten_submissions",
      "name": "On a Roll",
      "description": "Submit ten assignments"
    },
    "earned_at": "2026-03-30T09:12:00Z"
  }
]
```

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
