import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseCard from '../components/CourseCard';

const mockCourse = {
  id: 1,
  title: 'Introduction to Python',
  description: 'Learn the basics of Python programming language.',
  teacher_name: 'Dr. Smith',
  enrollment_count: 25,
};

function renderCourseCard(props = {}) {
  return render(
    <BrowserRouter>
      <CourseCard course={mockCourse} {...props} />
    </BrowserRouter>
  );
}

test('renders course title and description', () => {
  renderCourseCard();
  expect(screen.getByText('Introduction to Python')).toBeInTheDocument();
  expect(screen.getByText(/Learn the basics/)).toBeInTheDocument();
});

test('renders teacher name and enrollment count', () => {
  renderCourseCard();
  expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
  expect(screen.getByText('25 enrolled')).toBeInTheDocument();
});

test('renders View Details link', () => {
  renderCourseCard();
  expect(screen.getByText('View Details')).toBeInTheDocument();
});

test('renders Enroll button when showEnroll is true', () => {
  renderCourseCard({ showEnroll: true, onEnroll: jest.fn() });
  expect(screen.getByText('Enroll')).toBeInTheDocument();
});

test('renders Enrolled chip when enrolled is true', () => {
  renderCourseCard({ enrolled: true });
  expect(screen.getByText('Enrolled')).toBeInTheDocument();
});

test('does not render Enroll button by default', () => {
  renderCourseCard();
  expect(screen.queryByText('Enroll')).not.toBeInTheDocument();
});

test('truncates long descriptions', () => {
  const longDesc = 'A'.repeat(200);
  const course = { ...mockCourse, description: longDesc };
  render(
    <BrowserRouter>
      <CourseCard course={course} />
    </BrowserRouter>
  );
  expect(screen.getByText(/\.\.\.$/)).toBeInTheDocument();
});

// --- INTERACTION TEST ---
// This tests that clicking the Enroll button actually calls
// the onEnroll callback. We use jest.fn() to create a "spy"
// function that records whether it was called.

test('calls onEnroll when Enroll button is clicked', () => {
  const handleEnroll = jest.fn();
  render(
    <BrowserRouter>
      <CourseCard course={mockCourse} showEnroll={true} onEnroll={handleEnroll} />
    </BrowserRouter>
  );
  fireEvent.click(screen.getByText('Enroll'));
  expect(handleEnroll).toHaveBeenCalledTimes(1);
});
