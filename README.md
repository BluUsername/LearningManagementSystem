# Learning Management System (LMS)

A full-stack Learning Management System built with Django, Django Rest Framework, React, and SQLite. The platform supports three user roles — **Students**, **Teachers**, and **Admins** — each with tailored dashboards and functionality.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Wireframes](#wireframes)
- [How It Works](#how-it-works)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [API Reference](#api-reference)
- [Deployment](#deployment)

---

## Features

### Student
- Browse all available courses
- Enroll and unenroll from courses
- View a personal dashboard showing enrolled courses

### Teacher
- Create new courses with a title and description
- Edit and delete their own courses
- View a dashboard showing only their courses

### Admin
- Create, edit, and delete any course
- View summary statistics (total users, courses, enrollments)
- Manage all users — change roles or delete accounts

### General
- User registration with role selection (Student or Teacher)
- Secure token-based authentication
- Responsive design that works on mobile, tablet, and desktop
- Role-based access control on both frontend and backend

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Python, Django 6, Django REST Framework |
| Frontend   | JavaScript, React 19, Material UI |
| Database   | SQLite                            |
| Auth       | Token Authentication (DRF)        |
| Testing    | Django TestCase, React Testing Library |
| HTTP Client| Axios                             |
| Routing    | React Router v6                   |

---

## Project Structure

```
LearningManagementSystem/
├── README.md
├── docs/
│   └── API.md                    # Full API endpoint documentation
│
├── backend/
│   ├── requirements.txt          # Python dependencies
│   ├── manage.py                 # Django management script
│   ├── lms_project/
│   │   ├── settings.py           # Django configuration
│   │   ├── urls.py               # Root URL routing
│   │   └── wsgi.py               # WSGI entry point
│   ├── accounts/
│   │   ├── models.py             # Custom User model with roles
│   │   ├── serializers.py        # User/Auth serializers
│   │   ├── views.py              # Auth & user management views
│   │   ├── permissions.py        # IsAdmin permission class
│   │   ├── urls.py               # Auth & user URL routes
│   │   └── tests.py              # Auth API tests (12 tests)
│   └── courses/
│       ├── models.py             # Course & Enrollment models
│       ├── serializers.py        # Course/Enrollment serializers
│       ├── views.py              # Course CRUD & enrollment views
│       ├── permissions.py        # Role-based permission classes
│       ├── urls.py               # Course URL routes
│       └── tests.py              # Course API tests (13 tests)
│
└── frontend/
    ├── package.json              # Node dependencies
    └── src/
        ├── App.js                # Root component with routing & theme
        ├── api/
        │   └── axiosConfig.js    # Axios instance with auth interceptor
        ├── contexts/
        │   └── AuthContext.js    # Global authentication state
        ├── components/
        │   ├── Navbar.js         # Responsive navigation bar
        │   ├── ProtectedRoute.js # Route guard with role checking
        │   └── CourseCard.js     # Reusable course display card
        ├── pages/
        │   ├── Login.js          # Login form
        │   ├── Register.js       # Registration form with role selector
        │   ├── CourseList.js     # Browse all courses
        │   ├── CourseDetail.js   # Single course view
        │   ├── StudentDashboard.js
        │   ├── TeacherDashboard.js
        │   ├── AdminDashboard.js
        │   └── UserManagement.js # Admin user table
        └── __tests__/            # React component tests (21 tests)
```

---

## Wireframes

### Login Page
A centered card containing username and password fields, a "Log In" button, and a link to the registration page. Error messages appear at the top of the card when authentication fails.

![Login Wireframe](docs/wireframes/login.png)

### Registration Page
Similar layout to login, with additional fields: email, confirm password, and a role dropdown (Student or Teacher). Client-side validation checks that passwords match before submitting.

![Register Wireframe](docs/wireframes/register.png)

### Student Dashboard
Header with welcome message and enrolled course count. A grid of course cards showing the student's enrolled courses. A prominent "Browse Courses" button links to the full course listing.

![Student Dashboard Wireframe](docs/wireframes/student-dashboard.png)

### Teacher Dashboard
Header with welcome message and course count. A "Create Course" button opens a dialog with title and description fields. Course cards display with Edit and Delete action buttons.

![Teacher Dashboard Wireframe](docs/wireframes/teacher-dashboard.png)

### Admin Dashboard
Three summary stat cards at the top (Total Users, Total Courses, Total Enrollments). Below, a course grid with management actions. Navigation links to User Management page.

![Admin Dashboard Wireframe](docs/wireframes/admin-dashboard.png)

### Course List Page
A responsive grid of course cards. Each card shows the title, truncated description, teacher name, and enrollment count. Students see an "Enroll" button on courses they haven't joined.

![Course List Wireframe](docs/wireframes/course-list.png)

### Course Detail Page
Full course information displayed in a paper card: title, teacher name, creation date, enrollment count, and full description. Action buttons vary by role (Enroll/Unenroll for students, Delete for owners/admins).

![Course Detail Wireframe](docs/wireframes/course-detail.png)

### User Management Page (Admin)
A data table listing all users with columns: Username, Email, Role (editable dropdown), Date Joined, and a Delete button. Admins cannot modify or delete their own account.

![User Management Wireframe](docs/wireframes/user-management.png)

> **Note:** Wireframe images can be found in the `docs/wireframes/` directory. If images are not yet generated, the descriptions above serve as the design specification.

---

## How It Works

### Architecture Overview

The application follows a **client-server architecture** with a clear separation between the frontend and backend:

1. **React Frontend** (port 3000) sends HTTP requests to the Django API
2. **Django Backend** (port 8000) processes requests, enforces permissions, and interacts with the SQLite database
3. **Token Authentication** secures the API — the frontend stores the token in `localStorage` and attaches it to every request via an Axios interceptor

### Authentication Flow

1. User submits credentials on the Login/Register page
2. Django validates and returns a **Token** + user data
3. React stores the token in `localStorage` and the user object in `AuthContext`
4. All subsequent API requests include the token in the `Authorization` header
5. On page refresh, the app calls `/api/auth/me/` to rehydrate the user from the stored token

### Role-Based Access Control

**Backend:** Custom DRF permission classes (`IsAdmin`, `IsTeacherOrAdmin`, `IsCourseOwnerOrAdmin`, `IsStudent`) enforce access rules at the API level. Even if the frontend is bypassed, the backend will reject unauthorized requests.

**Frontend:** The `ProtectedRoute` component checks the user's role before rendering a page. The `Navbar` dynamically shows different links based on the user's role.

### Data Models

- **User** — extends Django's `AbstractUser` with a `role` field (student, teacher, or admin)
- **Course** — has a title, description, and a foreign key to the teacher who created it
- **Enrollment** — a join table linking students to courses (unique together constraint prevents duplicate enrollments)

---

## Setup & Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm 9+
- Git

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/BluUsername/LearningManagementSystem.git
cd LearningManagementSystem

# Create and activate virtual environment
cd backend
python -m venv venv

# Windows
source venv/Scripts/activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create a superuser (admin account)
python manage.py createsuperuser
```

### Frontend Setup

```bash
# From the project root
cd frontend

# Install dependencies
npm install
```

---

## Running the Application

You need **two terminal windows** — one for the backend and one for the frontend.

### Terminal 1 — Backend (Django)

```bash
cd backend
source venv/Scripts/activate  # or source venv/bin/activate on macOS/Linux
python manage.py runserver
```

The API will be available at `http://localhost:8000`.

### Terminal 2 — Frontend (React)

```bash
cd frontend
npm start
```

The app will open at `http://localhost:3000`.

### Quick Start

1. Start both servers as described above
2. Open `http://localhost:3000` in your browser
3. Register a new account (choose Student or Teacher role)
4. Log in and explore your role-specific dashboard
5. To access the admin dashboard, log in with the superuser account you created and change its role to "admin" via the Django admin panel at `http://localhost:8000/admin/`

---

## Running Tests

### Backend Tests (Django)

```bash
cd backend
source venv/Scripts/activate
python manage.py test --verbosity=2
```

**25 tests** covering:
- User registration (valid, password mismatch, duplicate username)
- Login (valid and invalid credentials)
- Current user endpoint and unauthenticated access
- Admin user management permissions
- Course CRUD with role-based permissions
- Student enrollment and unenrollment
- Duplicate enrollment prevention

### Frontend Tests (React)

```bash
cd frontend
npm test
```

**21 tests** covering:
- CourseCard rendering and truncation
- Login form rendering and interaction
- Register form rendering and password validation
- Navbar logged-in vs logged-out states
- ProtectedRoute authentication redirect

---

## API Reference

Full API documentation is available in [docs/API.md](docs/API.md).

### Quick Reference

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register/` | Register a new user | Public |
| POST | `/api/auth/login/` | Log in and get token | Public |
| POST | `/api/auth/logout/` | Log out (delete token) | Authenticated |
| GET | `/api/auth/me/` | Get current user info | Authenticated |
| GET | `/api/courses/` | List all courses | Authenticated |
| POST | `/api/courses/` | Create a course | Teacher, Admin |
| GET | `/api/courses/:id/` | Get course details | Authenticated |
| PUT | `/api/courses/:id/` | Update a course | Course owner, Admin |
| DELETE | `/api/courses/:id/` | Delete a course | Course owner, Admin |
| POST | `/api/courses/:id/enroll/` | Enroll in a course | Student |
| DELETE | `/api/courses/:id/unenroll/` | Unenroll from a course | Student |
| GET | `/api/enrollments/` | List my enrollments | Student |
| GET | `/api/users/` | List all users | Admin |
| PATCH | `/api/users/:id/` | Update a user | Admin |
| DELETE | `/api/users/:id/` | Delete a user | Admin |

---

## Deployment

The application can be deployed with the backend on **Heroku** and the frontend on **Netlify**, or both together on Heroku.

See the deployment configuration files in the repository root for details.

---

## Technologies & Libraries

### Backend
- [Django](https://www.djangoproject.com/) — Web framework
- [Django REST Framework](https://www.django-rest-framework.org/) — REST API toolkit
- [django-cors-headers](https://github.com/adamchainz/django-cors-headers) — Cross-origin request handling

### Frontend
- [React](https://react.dev/) — UI library
- [Material UI](https://mui.com/) — Component library
- [Axios](https://axios-http.com/) — HTTP client
- [React Router](https://reactrouter.com/) — Client-side routing
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) — Component testing
