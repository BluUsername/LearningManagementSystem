# Contributing to LearnHub LMS

Thank you for your interest in contributing to LearnHub! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature/fix: `git checkout -b feature/your-feature-name`
4. Follow the setup instructions in the [README](README.md)

## Development Workflow

1. Make your changes in a dedicated branch
2. Write tests for any new functionality
3. Ensure all existing tests pass:
   - Backend: `cd backend && python manage.py test`
   - Frontend: `cd frontend && npm test`
4. Commit your changes with a clear, descriptive message using conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for CSS/styling changes
   - `test:` for test additions/changes
   - `refactor:` for code refactoring

## Pull Request Process

1. Update the README.md if your changes affect setup or usage
2. Ensure your PR description clearly explains the changes and motivation
3. Link any related issues
4. Request a review from the maintainer

## Code Style

### Backend (Python/Django)
- Follow PEP 8 guidelines
- Use meaningful variable and function names
- Add docstrings to classes and complex functions
- Keep views focused and use serializers for validation

### Frontend (React/JavaScript)
- Use functional components with hooks
- Keep components focused and reusable
- Use Material UI components consistently
- Handle loading and error states in all data-fetching components

## Reporting Issues

- Use GitHub Issues to report bugs or suggest features
- Include steps to reproduce for bugs
- Include screenshots for UI-related issues

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
