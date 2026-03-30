import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TeacherDashboard from '../pages/TeacherDashboard';

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
  { id: 1, title: 'Python Basics', description: 'Learn Python', teacher: 5, teacher_name: 'Tom', enrollment_count: 12 },
  { id: 2, title: 'Web Development', description: 'Build websites', teacher: 5, teacher_name: 'Tom', enrollment_count: 8 },
];

function renderDashboard() {
  return render(
    <BrowserRouter>
      <TeacherDashboard />
    </BrowserRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({
    user: { id: 5, username: 'Tom', role: 'teacher' },
  });
  api.get.mockResolvedValueOnce({ data: mockCourses });
});

// FAKE: logged in as teacher Tom, API returns 2 courses
// DO: render
// CHECK: welcome message appears
test('displays welcome message with teacher name', async () => {
  renderDashboard();
  expect(await screen.findByText(/Welcome back, Tom/)).toBeInTheDocument();
});

// CHECK: course count is shown
test('shows course count in stats', async () => {
  renderDashboard();
  expect(await screen.findByText(/2 Courses Created/)).toBeInTheDocument();
});

// CHECK: student enrollment total is calculated (12 + 8 = 20)
test('shows total student enrollment count', async () => {
  renderDashboard();
  expect(await screen.findByText(/20 Students Enrolled/)).toBeInTheDocument();
});

// CHECK: both course titles appear
test('renders teacher course cards', async () => {
  renderDashboard();
  expect(await screen.findByText('Python Basics')).toBeInTheDocument();
  expect(screen.getByText('Web Development')).toBeInTheDocument();
});

// DO: click "Create Course" button
// CHECK: dialog with "Create New Course" title appears
test('opens create course dialog when button clicked', async () => {
  renderDashboard();
  await screen.findByText('Python Basics');
  fireEvent.click(screen.getByText('Create Course'));
  expect(screen.getByText('Create New Course')).toBeInTheDocument();
});

// FAKE: API returns empty courses
// CHECK: empty state message shows
test('shows empty state when teacher has no courses', async () => {
  api.get.mockReset().mockResolvedValueOnce({ data: [] });
  renderDashboard();
  expect(await screen.findByText(/Ready to share your knowledge/)).toBeInTheDocument();
});

// DO: open dialog, type title + description, click Create
// CHECK: api.post was called with the form data
test('submits new course via API when form is filled and submitted', async () => {
  api.post.mockResolvedValueOnce({ data: { id: 3 } });
  api.get.mockResolvedValueOnce({ data: mockCourses }); // refetch after create

  renderDashboard();
  await screen.findByText('Python Basics');

  fireEvent.click(screen.getByText('Create Course'));
  fireEvent.change(screen.getByLabelText(/Course Title/), { target: { value: 'New Course' } });
  fireEvent.change(screen.getByLabelText(/Description/), { target: { value: 'A new course' } });
  fireEvent.click(screen.getByText('Create'));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('courses/', {
      title: 'New Course',
      description: 'A new course',
    });
  });
});
