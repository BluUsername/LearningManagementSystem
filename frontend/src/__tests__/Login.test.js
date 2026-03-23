import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the axiosConfig — replaces the real API module with a fake one.
// This means our tests never make real HTTP requests.
jest.mock('../api/axiosConfig', () => ({
  get: jest.fn(),
  post: jest.fn(),
  interceptors: { request: { use: jest.fn() } },
}));

const api = require('../api/axiosConfig');

afterEach(() => {
  jest.clearAllMocks();
});

function renderLogin() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
}

test('renders Welcome back heading', () => {
  renderLogin();
  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
});

test('renders sign in button', () => {
  renderLogin();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});

test('renders link to register page', () => {
  renderLogin();
  expect(screen.getByText(/register/i)).toBeInTheDocument();
});

test('renders username and password inputs', () => {
  renderLogin();
  expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
});

test('allows typing in form fields', () => {
  renderLogin();
  const usernameInput = screen.getByPlaceholderText(/enter your username/i);
  const passwordInput = screen.getByPlaceholderText(/enter your password/i);

  fireEvent.change(usernameInput, { target: { value: 'testuser' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });

  expect(usernameInput.value).toBe('testuser');
  expect(passwordInput.value).toBe('password123');
});

// --- INTERACTION TESTS ---
// These test real user flows: filling in forms, clicking buttons,
// and verifying the outcome (success or error messages).

test('shows error message when login fails', async () => {
  // Arrange: make the API return an error when login is attempted
  api.post.mockRejectedValueOnce({
    response: { data: { non_field_errors: ['Invalid username or password.'] } },
  });

  // Act: render the form, fill in fields, click submit
  renderLogin();
  fireEvent.change(screen.getByPlaceholderText(/enter your username/i), {
    target: { value: 'wronguser' },
  });
  fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
    target: { value: 'wrongpass' },
  });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

  // Assert: the error message should appear on screen
  expect(await screen.findByText(/invalid username or password/i)).toBeInTheDocument();
});

test('calls login API with entered credentials', async () => {
  // Arrange: make the API return a successful response
  api.post.mockResolvedValueOnce({
    data: {
      token: 'fake-token-123',
      user: { id: 1, username: 'testuser', role: 'student' },
    },
  });

  // Act: fill in the form and submit
  renderLogin();
  fireEvent.change(screen.getByPlaceholderText(/enter your username/i), {
    target: { value: 'testuser' },
  });
  fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
    target: { value: 'password123' },
  });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

  // Assert: verify the API was called with the right data
  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('auth/login/', {
      username: 'testuser',
      password: 'password123',
    });
  });
});
