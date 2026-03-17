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

test('renders Register heading', () => {
  renderRegister();
  expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
});

test('renders submit button', () => {
  renderRegister();
  expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
});

test('renders link to login page', () => {
  renderRegister();
  expect(screen.getByText(/log in here/i)).toBeInTheDocument();
});

test('renders all form fields', () => {
  renderRegister();
  expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  // Password fields - use getAllByLabelText since there are two
  const passwordFields = screen.getAllByLabelText(/password/i);
  expect(passwordFields.length).toBeGreaterThanOrEqual(2);
});

test('shows error when passwords do not match', async () => {
  renderRegister();
  const passwordFields = screen.getAllByLabelText(/password/i);
  fireEvent.change(passwordFields[0], { target: { value: 'pass1234' } });
  fireEvent.change(passwordFields[1], { target: { value: 'different' } });
  fireEvent.click(screen.getByRole('button', { name: /register/i }));

  expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
});
