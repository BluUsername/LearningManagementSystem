import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Mock the axios instance
jest.mock('../api/axiosConfig', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: { request: { use: jest.fn() } },
  },
}));

const api = require('../api/axiosConfig').default;

// Test component that exposes auth context values
function AuthConsumer() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (user) return <div>Logged in as {user.username}</div>;
  return <div>Not logged in</div>;
}

afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

test('shows not logged in when no token exists', async () => {
  render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
  await waitFor(() => {
    expect(screen.getByText('Not logged in')).toBeInTheDocument();
  });
});

test('fetches user when token exists in localStorage', async () => {
  localStorage.setItem('token', 'fake-token');
  api.get.mockResolvedValueOnce({
    data: { id: 1, username: 'testuser', role: 'student' },
  });

  render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Logged in as testuser')).toBeInTheDocument();
  });
  expect(api.get).toHaveBeenCalledWith('auth/me/');
});

test('clears token when auth/me fails', async () => {
  localStorage.setItem('token', 'invalid-token');
  api.get.mockRejectedValueOnce(new Error('Unauthorized'));

  render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Not logged in')).toBeInTheDocument();
  });
  expect(localStorage.getItem('token')).toBeNull();
});

test('throws error when useAuth is used outside AuthProvider', () => {
  // Suppress console.error for this test
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  expect(() => {
    render(<AuthConsumer />);
  }).toThrow('useAuth must be used within an AuthProvider');

  consoleSpy.mockRestore();
});
