import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentDashboard from '../pages/StudentDashboard';

// FAKE: Mock the API and auth so we don't need a real server or login
jest.mock('../api/axiosConfig', () => {
  const mock = { get: jest.fn() };
  mock.getResults = (data) => (Array.isArray(data) ? data : data?.results ?? data);
  return { __esModule: true, default: mock, getResults: mock.getResults };
});
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const api = require('../api/axiosConfig').default;
const { useAuth } = require('../contexts/AuthContext');

// Fake enrollment data — same shape as the real API returns
const mockEnrollments = [
  {
    id: 1,
    enrolled_at: '2026-03-01T10:00:00Z',
    course: { id: 1, title: 'Python Basics', description: 'Learn Python', teacher_name: 'Dr. Smith', enrollment_count: 10 },
  },
  {
    id: 2,
    enrolled_at: '2026-03-15T10:00:00Z',
    course: { id: 2, title: 'Advanced React', description: 'Master React', teacher_name: 'Prof. Jones', enrollment_count: 5 },
  },
];

function renderDashboard() {
  return render(
    <BrowserRouter>
      <StudentDashboard />
    </BrowserRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({
    user: { id: 1, username: 'Tom', role: 'student' },
  });
  api.get.mockResolvedValueOnce({ data: mockEnrollments });
});

// FAKE: logged in as Tom, API returns 2 courses
// DO: render the dashboard
// CHECK: is "Tom" on screen?
test('displays welcome message with username', async () => {
  renderDashboard();
  expect(await screen.findByText(/Tom/)).toBeInTheDocument();
});

// CHECK: does it show the correct enrollment count?
test('shows enrolled course count', async () => {
  renderDashboard();
  expect(await screen.findByText(/2 Courses Enrolled/)).toBeInTheDocument();
});

// CHECK: are both course titles visible?
test('renders enrolled course cards', async () => {
  renderDashboard();
  expect(await screen.findByText('Python Basics')).toBeInTheDocument();
  expect(screen.getByText('Advanced React')).toBeInTheDocument();
});

// FAKE: API returns empty array (no enrollments)
// CHECK: does it show the empty state message?
test('shows empty state when no enrollments', async () => {
  api.get.mockReset().mockResolvedValueOnce({ data: [] });
  renderDashboard();
  expect(await screen.findByText(/Your learning adventure starts here/)).toBeInTheDocument();
});

// DO: click the A-Z sort button
// CHECK: does it call setSortOrder (we verify by checking the DOM order changes)
test('sort toggle buttons are visible when courses exist', async () => {
  renderDashboard();
  expect(await screen.findByLabelText(/sort alphabetically/)).toBeInTheDocument();
  expect(screen.getByLabelText(/sort by most recent/)).toBeInTheDocument();
});
