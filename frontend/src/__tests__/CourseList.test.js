import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseList from '../pages/CourseList';

// Mock useAuth to return a student user
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'student1', role: 'student' },
    loading: false,
  }),
}));

// Mock axios with plain functions (not jest.fn) so implementations persist
jest.mock('../api/axiosConfig', () => {
  const courses = [
    {
      id: 1,
      title: 'Introduction to Python',
      description: 'Learn Python programming from scratch.',
      teacher_name: 'Dr. Smith',
      enrollment_count: 15,
    },
    {
      id: 2,
      title: 'Web Development 101',
      description: 'Build modern web applications with React.',
      teacher_name: 'Prof. Johnson',
      enrollment_count: 30,
    },
  ];

  return {
    __esModule: true,
    default: {
      get: (url) => {
        if (url === 'courses/') {
          return Promise.resolve({ data: { results: courses } });
        }
        if (url === 'enrollments/') {
          return Promise.resolve({ data: { results: [] } });
        }
        return Promise.resolve({ data: [] });
      },
      post: () => Promise.resolve({ data: {} }),
      interceptors: { request: { use: () => {} } },
    },
    getResults: (data) => {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    },
  };
});

function renderCourseList() {
  return render(
    <BrowserRouter>
      <CourseList />
    </BrowserRouter>
  );
}

test('renders page heading', async () => {
  renderCourseList();
  await waitFor(() => {
    expect(screen.getByText('All Courses')).toBeInTheDocument();
  });
});

test('displays courses from API', async () => {
  renderCourseList();
  await waitFor(() => {
    expect(screen.getByText('Introduction to Python')).toBeInTheDocument();
  });
  expect(screen.getByText('Web Development 101')).toBeInTheDocument();
});

test('shows search input', async () => {
  renderCourseList();
  await waitFor(() => {
    expect(
      screen.getByPlaceholderText(/search courses/i)
    ).toBeInTheDocument();
  });
});

test('renders enroll buttons for student user', async () => {
  renderCourseList();
  await waitFor(() => {
    const enrollButtons = screen.getAllByText('Enroll');
    expect(enrollButtons.length).toBe(2);
  });
});
