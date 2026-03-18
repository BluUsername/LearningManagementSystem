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
