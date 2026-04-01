// We import the tools we need:
// - render: puts our component on a virtual screen
// - screen: lets us find elements on that screen
// - fireEvent: lets us simulate user actions (clicking, typing)
// - waitFor: waits for async operations to complete (like API calls)
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// CourseDetail uses useParams() to get the course ID from the URL,
// and useNavigate() to handle the back button. We need to mock these.
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// The component we're testing
import CourseDetail from '../pages/CourseDetail';

// We mock the API module so we don't make real HTTP requests.
// In tests, we control exactly what the API "returns".
jest.mock('../api/axiosConfig', () => {
  const mock = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  };
  mock.getResults = (data) => (Array.isArray(data) ? data : data?.results ?? data);
  return { __esModule: true, default: mock, getResults: mock.getResults };
});

// We mock AuthContext so we can pretend to be a logged-in student
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Import the mocked modules so we can configure them in each test
const api = require('../api/axiosConfig').default;
const { useAuth } = require('../contexts/AuthContext');

// This is a fake course object — same shape as what the real API returns
const mockCourse = {
  id: 1,
  title: 'Introduction to Python',
  description: 'Learn Python from scratch.',
  teacher_name: 'Dr. Smith',
  teacher: 10,
  enrollment_count: 25,
  created_at: '2026-01-15T10:00:00Z',
};

// Helper function to render CourseDetail inside a router.
// CourseDetail uses useParams() to read the ID from the URL,
// so we need MemoryRouter to simulate being at "/courses/1".
function renderCourseDetail() {
  return render(
    <MemoryRouter initialEntries={['/courses/1']}>
      <Routes>
        <Route path="/courses/:id" element={<CourseDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

// Before each test, reset all mocks and set up the default responses.
// This ensures each test starts from a clean state.
beforeEach(() => {
  jest.clearAllMocks();

  // Pretend we're logged in as a student
  useAuth.mockReturnValue({
    user: { id: 1, username: 'student1', role: 'student' },
  });

  // When CourseDetail loads, it makes two API calls:
  // 1. GET /courses/1/ — to fetch the course data
  // 2. GET /enrollments/ — to check if the student is already enrolled
  //
  // mockResolvedValueOnce means "the NEXT time api.get is called, return this"
  // We chain two of them because there are two GET calls.
  api.get
    .mockResolvedValueOnce({ data: mockCourse })       // first call: course data
    .mockResolvedValueOnce({ data: [] });               // second call: empty enrollments (not enrolled)
});

// ─── TEST 1: Does the course info render? ─────────────────────────
// This is a basic rendering test. It proves the component can fetch
// data from the API and display it correctly.

test('renders course title and teacher name', async () => {
  renderCourseDetail();

  // findByText waits for the element to appear (because data loads async)
  expect(await screen.findByText('Introduction to Python')).toBeInTheDocument();
  expect(screen.getByText(/Dr\. Smith/)).toBeInTheDocument();
});

// ─── TEST 2: Does clicking Enroll fire an API request? ────────────
// THIS IS THE TEST ANDY ASKED FOR.
// It proves that when a student clicks "Enroll", the frontend sends
// a POST request to the correct API endpoint.

test('clicking Enroll sends POST request to enroll endpoint', async () => {
  // Set up: when the student clicks Enroll, the API will return success
  api.post.mockResolvedValueOnce({ data: { detail: 'Enrolled' } });

  renderCourseDetail();

  // Wait for the page to load (the Enroll button won't appear until data loads)
  const enrollButton = await screen.findByText('Enroll');

  // Act: click the Enroll button
  fireEvent.click(enrollButton);

  // Assert: verify the API was called with the correct endpoint
  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('courses/1/enroll/');
  });
});

// ─── TEST 3: Does the button change after enrolling? ──────────────
// This tests the UI feedback — after enrolling, the "Enroll" button
// should disappear and "Unenroll" should appear instead.

test('shows Unenroll button after successful enrollment', async () => {
  api.post.mockResolvedValueOnce({ data: { detail: 'Enrolled' } });

  renderCourseDetail();

  const enrollButton = await screen.findByText('Enroll');
  fireEvent.click(enrollButton);

  // After enrolling, "Unenroll" should appear
  expect(await screen.findByText('Unenroll')).toBeInTheDocument();
  // And "Enroll" should be gone
  expect(screen.queryByText('Enroll')).not.toBeInTheDocument();
});

// ─── TEST 4: Does clicking Unenroll fire the correct API call? ────
// Same pattern as the enroll test, but for unenrolling.

test('clicking Unenroll sends DELETE request to unenroll endpoint', async () => {
  // This time, pretend the student IS already enrolled
  api.get
    .mockReset()
    .mockResolvedValueOnce({ data: mockCourse })
    .mockResolvedValueOnce({ data: [{ course: { id: 1 } }] }); // enrolled!

  api.delete.mockResolvedValueOnce({ data: { detail: 'Unenrolled' } });

  renderCourseDetail();

  const unenrollButton = await screen.findByText('Unenroll');
  fireEvent.click(unenrollButton);

  await waitFor(() => {
    expect(api.delete).toHaveBeenCalledWith('courses/1/unenroll/');
  });
});

// ─── TEST 5: Does an enrollment error show an error message? ──────
// Tests that if the API returns an error, the user sees feedback.

test('shows error message when enrollment fails', async () => {
  api.post.mockRejectedValueOnce({
    response: { data: { detail: 'Already enrolled in this course.' } },
  });

  renderCourseDetail();

  const enrollButton = await screen.findByText('Enroll');
  fireEvent.click(enrollButton);

  expect(await screen.findByText('Already enrolled in this course.')).toBeInTheDocument();
});
