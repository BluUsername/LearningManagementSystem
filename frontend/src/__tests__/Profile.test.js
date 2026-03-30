import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../pages/Profile';

jest.mock('../api/axiosConfig', () => {
  const mock = { get: jest.fn(), patch: jest.fn() };
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
    user: {
      id: 1, username: 'Tom', role: 'student',
      first_name: 'Tom', last_name: 'Herman', bio: 'I love coding',
      email: 'tom@email.com', date_joined: '2026-01-15T00:00:00Z',
    },
    updateUser: jest.fn(),
  });
  // Profile fetches enrollments for stats
  api.get.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] });
});

function renderProfile() {
  return render(<BrowserRouter><Profile /></BrowserRouter>);
}

// CHECK: username is displayed
test('displays username', async () => {
  renderProfile();
  expect(await screen.findByText(/@Tom/)).toBeInTheDocument();
});

// CHECK: user's name appears
test('displays user full name', async () => {
  renderProfile();
  expect(await screen.findByText(/Tom Herman/)).toBeInTheDocument();
});

// CHECK: role is shown (use getAllByText since "Student" may appear multiple times)
test('displays user role', async () => {
  renderProfile();
  await screen.findByText(/@Tom/);
  expect(screen.getAllByText(/Student/).length).toBeGreaterThan(0);
});

// CHECK: course stats load and display
test('shows course count from API', async () => {
  renderProfile();
  expect(await screen.findByText('2')).toBeInTheDocument();
});

// DO: change bio, click Save Changes
// CHECK: API is called with updated data
test('saves profile changes via API', async () => {
  api.patch.mockResolvedValueOnce({
    data: { first_name: 'Tom', last_name: 'Herman', bio: 'Updated bio' },
  });

  renderProfile();
  await screen.findByText(/@Tom/);

  // Change the bio field
  const bioField = screen.getByLabelText(/Bio/);
  fireEvent.change(bioField, { target: { value: 'Updated bio' } });

  // Click Save Changes button
  fireEvent.click(screen.getByText('Save Changes'));

  await waitFor(() => {
    expect(api.patch).toHaveBeenCalledWith('auth/me/', expect.objectContaining({
      bio: 'Updated bio',
    }));
  });
});
