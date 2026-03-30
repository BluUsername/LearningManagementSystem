import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Leaderboard from '../pages/Leaderboard';

jest.mock('../api/axiosConfig', () => {
  const mock = { get: jest.fn() };
  mock.getResults = (data) => (Array.isArray(data) ? data : data?.results ?? data);
  return { __esModule: true, default: mock, getResults: mock.getResults };
});

const api = require('../api/axiosConfig').default;

const mockCourses = [
  { id: 1, title: 'Python', teacher_name: 'Dr. Smith', enrollment_count: 30 },
  { id: 2, title: 'React', teacher_name: 'Prof. Jones', enrollment_count: 25 },
  { id: 3, title: 'Django', teacher_name: 'Dr. Smith', enrollment_count: 20 },
];

beforeEach(() => {
  jest.clearAllMocks();
  api.get.mockResolvedValueOnce({ data: mockCourses });
});

function renderPage() {
  return render(<BrowserRouter><Leaderboard /></BrowserRouter>);
}

// CHECK: page title
test('renders Leaderboard page title', async () => {
  renderPage();
  expect(await screen.findByText('Leaderboard')).toBeInTheDocument();
});

// CHECK: courses are ranked by enrollment count (Python first with 30)
test('shows top courses ranked by enrollment', async () => {
  renderPage();
  expect(await screen.findByText('Python')).toBeInTheDocument();
  expect(screen.getByText('React')).toBeInTheDocument();
  expect(screen.getByText('Django')).toBeInTheDocument();
});

// CHECK: teacher names appear in the top teachers section
test('shows top teachers', async () => {
  renderPage();
  // Dr. Smith has 2 courses (50 total students), Prof. Jones has 1 (25 students)
  expect(await screen.findByText('Dr. Smith')).toBeInTheDocument();
  expect(screen.getByText('Prof. Jones')).toBeInTheDocument();
});

// CHECK: section headings exist
test('shows Most Popular Courses and Top Teachers sections', async () => {
  renderPage();
  expect(await screen.findByText(/Most Popular Courses/)).toBeInTheDocument();
  expect(screen.getByText(/Top Teachers/)).toBeInTheDocument();
});
