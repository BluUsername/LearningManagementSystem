import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserManagement from '../pages/UserManagement';

jest.mock('../api/axiosConfig', () => {
  const mock = { get: jest.fn(), patch: jest.fn(), delete: jest.fn() };
  mock.getResults = (data) => (Array.isArray(data) ? data : data?.results ?? data);
  return { __esModule: true, default: mock, getResults: mock.getResults };
});
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const api = require('../api/axiosConfig').default;
const { useAuth } = require('../contexts/AuthContext');

const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@lms.com', role: 'admin', date_joined: '2026-01-01T00:00:00Z' },
  { id: 2, username: 'teacher1', email: 'teacher@lms.com', role: 'teacher', date_joined: '2026-02-01T00:00:00Z' },
  { id: 3, username: 'student1', email: 'student@lms.com', role: 'student', date_joined: '2026-03-01T00:00:00Z' },
];

function renderPage() {
  return render(<BrowserRouter><UserManagement /></BrowserRouter>);
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ user: { id: 1, username: 'admin', role: 'admin' } });
  api.get.mockResolvedValueOnce({ data: mockUsers });
});

// CHECK: all usernames appear in the table
test('renders all users in the table', async () => {
  renderPage();
  expect(await screen.findByText('admin')).toBeInTheDocument();
  expect(screen.getByText('teacher1')).toBeInTheDocument();
  expect(screen.getByText('student1')).toBeInTheDocument();
});

// CHECK: user count shows in subtitle
test('shows user count in subtitle', async () => {
  renderPage();
  expect(await screen.findByText(/3 users/)).toBeInTheDocument();
});

// CHECK: emails are displayed
test('displays user emails', async () => {
  renderPage();
  expect(await screen.findByText('admin@lms.com')).toBeInTheDocument();
  expect(screen.getByText('teacher@lms.com')).toBeInTheDocument();
});

// CHECK: table headers exist
test('shows table column headers', async () => {
  renderPage();
  expect(await screen.findByText('Username')).toBeInTheDocument();
  expect(screen.getByText('Email')).toBeInTheDocument();
  expect(screen.getByText('Role')).toBeInTheDocument();
});

// CHECK: back to dashboard link exists
test('shows Back to Dashboard button', async () => {
  renderPage();
  expect(await screen.findByText('Back to Dashboard')).toBeInTheDocument();
});
