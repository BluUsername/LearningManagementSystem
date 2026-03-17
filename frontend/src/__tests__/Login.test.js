import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the axiosConfig
jest.mock('../api/axiosConfig', () => ({
  get: jest.fn(),
  post: jest.fn(),
  interceptors: { request: { use: jest.fn() } },
}));

function renderLogin() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
}

test('renders login form with username and password fields', () => {
  renderLogin();
  expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});

test('renders Log In heading', () => {
  renderLogin();
  expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
});

test('renders submit button', () => {
  renderLogin();
  expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
});

test('renders link to register page', () => {
  renderLogin();
  expect(screen.getByText(/register here/i)).toBeInTheDocument();
});

test('allows typing in form fields', () => {
  renderLogin();
  const usernameInput = screen.getByLabelText(/username/i);
  const passwordInput = screen.getByLabelText(/password/i);

  fireEvent.change(usernameInput, { target: { value: 'testuser' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });

  expect(usernameInput.value).toBe('testuser');
  expect(passwordInput.value).toBe('password123');
});
