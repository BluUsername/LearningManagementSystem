import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
import { AuthProvider } from '../contexts/AuthContext';

jest.mock('../api/axiosConfig', () => ({
  get: jest.fn(),
  post: jest.fn(),
  interceptors: { request: { use: jest.fn() } },
}));

const api = require('../api/axiosConfig');

afterEach(() => {
  jest.clearAllMocks();
});

function renderRegister() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </BrowserRouter>
  );
}

test('renders Get started heading', () => {
  renderRegister();
  expect(screen.getByText(/get started/i)).toBeInTheDocument();
});

test('renders create account button', () => {
  renderRegister();
  expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
});

test('renders link to login page', () => {
  renderRegister();
  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
});

test('renders all form fields', () => {
  renderRegister();
  expect(screen.getByPlaceholderText(/choose a username/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/minimum 8 characters/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/re-enter your password/i)).toBeInTheDocument();
});

// --- INTERACTION TESTS ---

test('shows error when passwords do not match', async () => {
  // This tests CLIENT-SIDE validation — the form catches mismatched
  // passwords BEFORE sending anything to the API.
  renderRegister();
  fireEvent.change(screen.getByPlaceholderText(/minimum 8 characters/i), {
    target: { value: 'pass1234' },
  });
  fireEvent.change(screen.getByPlaceholderText(/re-enter your password/i), {
    target: { value: 'different' },
  });
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));

  expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  // The API should NOT have been called — validation stopped it
  expect(api.post).not.toHaveBeenCalled();
});

test('shows API error when registration fails', async () => {
  // This tests SERVER-SIDE validation — the API rejects the request
  // (e.g. duplicate username) and we display the error.
  api.post.mockRejectedValueOnce({
    response: { data: { username: ['A user with that username already exists.'] } },
  });

  renderRegister();
  fireEvent.change(screen.getByPlaceholderText(/choose a username/i), {
    target: { value: 'existing' },
  });
  fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
    target: { value: 'test@example.com' },
  });
  fireEvent.change(screen.getByPlaceholderText(/minimum 8 characters/i), {
    target: { value: 'pass1234' },
  });
  fireEvent.change(screen.getByPlaceholderText(/re-enter your password/i), {
    target: { value: 'pass1234' },
  });
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));

  expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
});

test('calls register API with all form data', async () => {
  // This tests the HAPPY PATH — a successful registration.
  // We verify the API was called with exactly the right data.
  api.post.mockResolvedValueOnce({
    data: {
      token: 'new-token-123',
      user: { id: 5, username: 'newuser', role: 'student' },
    },
  });

  renderRegister();
  fireEvent.change(screen.getByPlaceholderText(/choose a username/i), {
    target: { value: 'newuser' },
  });
  fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
    target: { value: 'new@example.com' },
  });
  fireEvent.change(screen.getByPlaceholderText(/minimum 8 characters/i), {
    target: { value: 'securepass' },
  });
  fireEvent.change(screen.getByPlaceholderText(/re-enter your password/i), {
    target: { value: 'securepass' },
  });
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('auth/register/', {
      username: 'newuser',
      email: 'new@example.com',
      password: 'securepass',
      password2: 'securepass',
      role: 'student',
    });
  });
});
