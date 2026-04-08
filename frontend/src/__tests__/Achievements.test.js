import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Achievements from '../pages/Achievements';

jest.mock('../api/axiosConfig', () => {
  const mock = { get: jest.fn(), post: jest.fn() };
  mock.getResults = (data) => (Array.isArray(data) ? data : data?.results ?? data);
  return { __esModule: true, default: mock, getResults: mock.getResults };
});
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const api = require('../api/axiosConfig').default;
const { useAuth } = require('../contexts/AuthContext');

// Mock achievement definitions from the API
const mockDefinitions = [
  { id: 1, key: 'first_login', name: 'Welcome Aboard!', description: 'Logged into LearnHub for the first time', icon: 'RocketIcon', color: '#42a5f5', category: 'general', sort_order: 0 },
  { id: 2, key: 'profile_complete', name: 'Identity Established', description: 'Complete your profile with a bio', icon: 'BadgeIcon', color: '#ab47bc', category: 'general', sort_order: 1 },
  { id: 3, key: 'first_enrollment', name: 'First Steps', description: 'Enrol in your first course', icon: 'SchoolIcon', color: '#66bb6a', category: 'student', sort_order: 2 },
  { id: 4, key: 'three_courses', name: 'Knowledge Seeker', description: 'Enrol in 3 or more courses', icon: 'AutoStoriesIcon', color: '#f57c00', category: 'student', sort_order: 3 },
  { id: 5, key: 'explorer', name: 'Explorer', description: 'Browse the course catalogue', icon: 'ViewIcon', color: '#26c6da', category: 'general', sort_order: 8 },
];

// Mock earned achievements — user has earned first_login, explorer, and first_enrollment
const mockEarned = [
  { id: 1, achievement: mockDefinitions[0], earned_at: '2026-03-01T10:00:00Z' },
  { id: 2, achievement: mockDefinitions[4], earned_at: '2026-03-01T10:00:00Z' },
  { id: 3, achievement: mockDefinitions[2], earned_at: '2026-03-02T10:00:00Z' },
];

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({
    user: { id: 1, username: 'Tom', role: 'student', bio: 'I love coding' },
  });

  // POST achievements/check/ returns empty (already earned)
  api.post.mockResolvedValueOnce({ data: [] });
  // GET achievements/ returns all definitions
  api.get.mockResolvedValueOnce({ data: mockDefinitions });
  // GET achievements/me/ returns earned
  api.get.mockResolvedValueOnce({ data: mockEarned });
});

function renderPage() {
  return render(<BrowserRouter><Achievements /></BrowserRouter>);
}

// CHECK: page title renders
test('renders Achievements page title', async () => {
  renderPage();
  expect(await screen.findByText('Achievements')).toBeInTheDocument();
});

// CHECK: "Welcome Aboard" is shown as unlocked
test('shows Welcome Aboard achievement as unlocked', async () => {
  renderPage();
  expect(await screen.findByText('Welcome Aboard!')).toBeInTheDocument();
});

// CHECK: the Unlocked section heading is shown
test('shows Unlocked section', async () => {
  renderPage();
  await screen.findByText('Welcome Aboard!');
  expect(screen.getAllByText(/Unlocked/).length).toBeGreaterThan(0);
});

// CHECK: fetches definitions and earned achievements from API
test('fetches achievement data from API', async () => {
  renderPage();
  await screen.findByText('Welcome Aboard!');
  expect(api.get).toHaveBeenCalledWith('achievements/');
  expect(api.get).toHaveBeenCalledWith('achievements/me/');
});

// CHECK: shows locked achievements that haven't been earned
test('shows locked achievements', async () => {
  renderPage();
  await screen.findByText('Welcome Aboard!');
  // Knowledge Seeker should be locked (not in mockEarned)
  expect(screen.getByText('Knowledge Seeker')).toBeInTheDocument();
  expect(screen.getAllByText(/Locked/).length).toBeGreaterThan(0);
});
