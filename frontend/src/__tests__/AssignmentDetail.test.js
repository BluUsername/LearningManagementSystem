import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AssignmentDetail from '../pages/AssignmentDetail';

jest.mock('../api/axiosConfig', () => {
  const mock = { get: jest.fn(), post: jest.fn(), patch: jest.fn() };
  mock.getResults = (data) => (Array.isArray(data) ? data : data?.results ?? data);
  return { __esModule: true, default: mock, getResults: mock.getResults };
});
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const api = require('../api/axiosConfig').default;
const { useAuth } = require('../contexts/AuthContext');

const mockAssignment = {
  id: 1,
  course: 1,
  course_title: 'Intro to Python',
  title: 'Homework 1',
  description: 'Complete the exercises in chapter 3.',
  due_date: '2026-12-31T23:59:00Z',
  max_points: 100,
  submission_count: 2,
  created_at: '2026-03-01T10:00:00Z',
};

const mockSubmissions = [
  {
    id: 1, assignment: 1, assignment_title: 'Homework 1',
    student: 1, student_name: 'student1', content: 'My answer',
    status: 'submitted', grade: null, feedback: '',
    submitted_at: '2026-03-15T10:00:00Z', graded_at: null,
  },
];

function renderPage(role = 'student') {
  useAuth.mockReturnValue({
    user: { id: 1, username: role === 'teacher' ? 'teacher1' : 'student1', role },
  });

  return render(
    <MemoryRouter initialEntries={['/courses/1/assignments/1']}>
      <Routes>
        <Route path="/courses/:courseId/assignments/:assignmentId" element={<AssignmentDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

// CHECK: renders assignment title and details
test('renders assignment title and points', async () => {
  api.get
    .mockResolvedValueOnce({ data: mockAssignment })
    .mockResolvedValueOnce({ data: [] });
  renderPage();
  expect(await screen.findByText('Homework 1')).toBeInTheDocument();
  expect(screen.getByText(/100 points/)).toBeInTheDocument();
});

// CHECK: student sees submission form when not submitted
test('student sees submission form', async () => {
  api.get
    .mockResolvedValueOnce({ data: mockAssignment })
    .mockResolvedValueOnce({ data: [] });
  renderPage('student');
  expect(await screen.findByText('Your Submission')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Write your answer here...')).toBeInTheDocument();
});

// CHECK: student sees submitted state when already submitted
test('student sees submitted state when already submitted', async () => {
  api.get
    .mockResolvedValueOnce({ data: mockAssignment })
    .mockResolvedValueOnce({ data: mockSubmissions });
  renderPage('student');
  expect(await screen.findByText(/Submitted - awaiting grade/)).toBeInTheDocument();
});

// CHECK: teacher sees submissions table
test('teacher sees submissions table', async () => {
  api.get
    .mockResolvedValueOnce({ data: mockAssignment })
    .mockResolvedValueOnce({ data: mockSubmissions });
  renderPage('teacher');
  expect(await screen.findByText('Student Submissions (1)')).toBeInTheDocument();
  expect(screen.getByText('student1')).toBeInTheDocument();
});

// CHECK: student can submit work with text
test('clicking Submit sends POST with FormData to submit endpoint', async () => {
  api.get
    .mockResolvedValueOnce({ data: mockAssignment })
    .mockResolvedValueOnce({ data: [] });
  api.post.mockResolvedValueOnce({
    data: { ...mockSubmissions[0], content: 'My answer here' },
  });

  renderPage('student');

  const textarea = await screen.findByPlaceholderText('Write your answer here...');
  fireEvent.change(textarea, { target: { value: 'My answer here' } });

  const submitBtn = screen.getByText('Submit');
  fireEvent.click(submitBtn);

  await waitFor(() => {
    expect(api.post).toHaveBeenCalled();
    const [url, formData, config] = api.post.mock.calls[0];
    expect(url).toBe('assignments/1/submit/');
    expect(formData instanceof FormData).toBe(true);
    expect(config.headers['Content-Type']).toBe('multipart/form-data');
  });
});

// CHECK: file upload button is visible
test('shows Attach File button for students', async () => {
  api.get
    .mockResolvedValueOnce({ data: mockAssignment })
    .mockResolvedValueOnce({ data: [] });
  renderPage('student');
  expect(await screen.findByText('Attach File')).toBeInTheDocument();
});

// CHECK: download button shown when submission has file
test('shows download button when submission has file', async () => {
  const subWithFile = [{
    ...mockSubmissions[0],
    file_url: 'http://localhost:8000/media/submissions/2026/03/homework.pdf',
  }];
  api.get
    .mockResolvedValueOnce({ data: mockAssignment })
    .mockResolvedValueOnce({ data: subWithFile });
  renderPage('student');
  expect(await screen.findByText('Download Attached File')).toBeInTheDocument();
});
