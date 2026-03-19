# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-03-19

### Security
- Require SECRET_KEY via environment variable in production
- Add CSRF, HSTS, and SSL security settings for production
- Add rate limiting (100/hr anonymous, 1000/hr authenticated)
- Add input validation limits on course title and description

### Added
- Course search and filtering (by title, description, teacher)
- Search bar on Course List page with debounced queries
- API pagination (20 items per page)
- Structured logging for auth events and course operations
- Query optimisation with select_related
- `.env.example` for documenting required environment variables
- `CONTRIBUTING.md` with development guidelines
- `LICENSE` (MIT)
- This `CHANGELOG.md`

### Changed
- DEBUG now defaults to False for safety
- Explicit permission_classes on LogoutView
- Frontend uses getResults() helper for paginated API responses

## [1.0.0] - 2026-03-18

### Added
- Full-stack LMS with Django REST Framework backend and React frontend
- Custom User model with three roles: Student, Teacher, Admin
- Token-based authentication (register, login, logout)
- Course CRUD with role-based permissions
- Student enrollment and unenrollment system
- Three role-specific dashboards (Admin, Teacher, Student)
- Course browsing, detail view, and user management
- Responsive dark theme with blue/purple/orange colour palette
- Split-screen login and registration pages
- 25 backend tests and 21 frontend tests
- Comprehensive README with wireframes and API documentation
- Deployment to Heroku (backend) and Netlify (frontend)
- PostgreSQL database on Heroku for persistent data
