import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
import { AuthProvider } from '../contexts/AuthContext';

jest.mock('../api/axiosConfig', () => ({
  get: jest.fn(),
  post: jest.fn(),
  interceptors: { request: { use: jest.fn() } },
}));

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

test('shows error when passwords do not match', async () => {
  renderRegister();
  const passwordField = screen.getByPlaceholderText(/minimum 8 characters/i);
  const confirmField = screen.getByPlaceholderText(/re-enter your password/i);
  fireEvent.change(passwordField, { target: { value: 'pass1234' } });
  fireEvent.change(confirmField, { target: { value: 'different' } });
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));

  expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
});
