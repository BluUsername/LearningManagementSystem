import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Achievements from '../pages/Achievements';

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

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({
    user: { id: 1, username: 'Tom', role: 'student', bio: 'I love coding' },
  });
  // Achievements fetches enrollments to check which badges are unlocked
  api.get.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }, { id: 3 }] });
});

function renderPage() {
  return render(<BrowserRouter><Achievements /></BrowserRouter>);
}

// CHECK: page title renders
test('renders Achievements page title', async () => {
  renderPage();
  expect(await screen.findByText('Achievements')).toBeInTheDocument();
});

// CHECK: "Welcome Aboard" is always unlocked (everyone who's logged in has it)
test('shows Welcome Aboard achievement as unlocked', async () => {
  renderPage();
  expect(await screen.findByText('Welcome Aboard!')).toBeInTheDocument();
});

// CHECK: the Unlocked section heading is shown
test('shows Unlocked section', async () => {
  renderPage();
  // Wait for data to load, then check for the section
  await screen.findByText('Welcome Aboard!');
  expect(screen.getAllByText(/Unlocked/).length).toBeGreaterThan(0);
});

// CHECK: with bio set, "Identity Established" should be unlocked
test('shows Identity Established when user has bio', async () => {
  renderPage();
  expect(await screen.findByText('Identity Established')).toBeInTheDocument();
});

// CHECK: with 3 enrollments, "First Steps" and "Knowledge Seeker" should be unlocked
test('unlocks enrollment-based achievements', async () => {
  renderPage();
  expect(await screen.findByText('First Steps')).toBeInTheDocument();
  expect(screen.getByText('Knowledge Seeker')).toBeInTheDocument();
});
