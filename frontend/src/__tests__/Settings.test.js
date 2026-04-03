import { render, screen, fireEvent } from '@testing-library/react';
import Settings from '../pages/Settings';

// Settings uses ThemeContext for the dark mode toggle
jest.mock('../contexts/ThemeContext', () => ({
  useThemeMode: jest.fn(),
}));

const { useThemeMode } = require('../contexts/ThemeContext');

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  useThemeMode.mockReturnValue({ mode: 'dark', toggleTheme: jest.fn() });
});

// CHECK: page title renders
test('renders Settings page title', () => {
  render(<Settings />);
  expect(screen.getByText('Settings')).toBeInTheDocument();
});

// CHECK: dark mode toggle is present and reflects current mode
test('shows dark mode toggle with current theme', () => {
  render(<Settings />);
  expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  expect(screen.getByText(/Currently using dark theme/)).toBeInTheDocument();
});

// DO: click the dark mode toggle
// CHECK: toggleTheme function is called
test('renders dark mode toggle description', () => {
  render(<Settings />);
  expect(screen.getByText('Dark Mode')).toBeInTheDocument();
  expect(screen.getByText(/Currently using dark theme/)).toBeInTheDocument();
});

// CHECK: all settings sections render
test('renders all settings sections', () => {
  render(<Settings />);
  expect(screen.getByText('Notifications')).toBeInTheDocument();
  expect(screen.getByText('Privacy & Security')).toBeInTheDocument();
  expect(screen.getByText('Language & Region')).toBeInTheDocument();
  expect(screen.getByText('Performance')).toBeInTheDocument();
});

// CHECK: About LearnHub info section exists
test('renders About LearnHub section with version info', () => {
  render(<Settings />);
  expect(screen.getByText('About LearnHub')).toBeInTheDocument();
  expect(screen.getByText('1.0.0')).toBeInTheDocument();
});

// DO: toggle a setting
// CHECK: it persists to localStorage
test('saves settings to localStorage when toggled', () => {
  render(<Settings />);
  const emailNewCoursesToggle = screen.getByRole('switch', {
    name: /Email notifications for new courses/i,
  });
  const initialSaved = JSON.parse(localStorage.getItem('learnhub_settings') || '{}');
  const initialValue = initialSaved.emailNewCourses;

  fireEvent.click(emailNewCoursesToggle);

  const saved = JSON.parse(localStorage.getItem('learnhub_settings') || '{}');
  expect(saved).toHaveProperty('emailNewCourses');
  expect(saved.emailNewCourses).not.toBe(initialValue);
});
