import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../pages/AdminDashboard';

jest.mock('../api/axiosConfig', () => {
  const mock = { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() };
  mock.getResults = (data) => (Array.isArray(data) ? data : data?.results ?? data);
  return { __esModule: true, default: mock, getResults: mock.getResults };
});
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const api = require('../api/axiosConfig').default;
const { useAuth } = require('../contexts/AuthContext');

const mockCourses = [
  { id: 1, title: 'Python', description: 'Learn Python', teacher: 2, teacher_name: 'Prof A', enrollment_count: 10 },
  { id: 2, title: 'React', description: 'Learn React', teacher: 3, teacher_name: 'Prof B', enrollment_count: 15 },
];
const mockUsers = [
  { id: 1, username: 'admin', role: 'admin' },
  { id: 2, username: 'teacher1', role: 'teacher' },
  { id: 3, username: 'student1', role: 'student' },
];

function renderDashboard() {
  return render(<BrowserRouter><AdminDashboard /></BrowserRouter>);
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ user: { id: 1, username: 'admin', role: 'admin' } });
  // AdminDashboard makes TWO parallel API calls:
  // 1. GET courses/ — fetches all courses
  // 2. GET users/ — fetches all users (for count)
  // Since they use Promise.all, both get() calls happen together
  api.get
    .mockResolvedValueOnce({ data: mockCourses })
    .mockResolvedValueOnce({ data: mockUsers });
});

// CHECK: platform stats show correct numbers
test('displays total users, courses, and enrollments', async () => {
  renderDashboard();
  // 3 users, 2 courses, 25 total enrollments (10 + 15)
  expect(await screen.findByText('3')).toBeInTheDocument();
  expect(screen.getByText('2')).toBeInTheDocument();
  expect(screen.getByText('25')).toBeInTheDocument();
});

// CHECK: stat labels are present
test('shows stat labels', async () => {
  renderDashboard();
  expect(await screen.findByText('Total Users')).toBeInTheDocument();
  expect(screen.getByText('Total Courses')).toBeInTheDocument();
  expect(screen.getByText('Total Enrollments')).toBeInTheDocument();
});

// CHECK: course cards render
test('renders all course cards', async () => {
  renderDashboard();
  expect(await screen.findByText('Python')).toBeInTheDocument();
  expect(screen.getByText('React')).toBeInTheDocument();
});

// CHECK: admin-specific buttons are present
test('shows Manage Users and Create Course buttons', async () => {
  renderDashboard();
  expect(await screen.findByText('Manage Users')).toBeInTheDocument();
  expect(screen.getByText('Create Course')).toBeInTheDocument();
});
