import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserManagement from '../pages/UserManagement';

jest.mock('../api/axiosConfig', () => {
  const mock = { get: jest.fn(), patch: jest.fn(), delete: jest.fn() };
  mock.getResults = (data) => (Array.isArray(data) ? data : data?.results ?? data);
  return { __esModule: true, default: mock, getResults: mock.getResults };
});
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const api = require('../api/axiosConfig').default;
const { useAuth } = require('../contexts/AuthContext');

const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@lms.com', role: 'admin', date_joined: '2026-01-01T00:00:00Z' },
  { id: 2, username: 'teacher1', email: 'teacher@lms.com', role: 'teacher', date_joined: '2026-02-01T00:00:00Z' },
  { id: 3, username: 'student1', email: 'student@lms.com', role: 'student', date_joined: '2026-03-01T00:00:00Z' },
];

function renderPage() {
  return render(<BrowserRouter><UserManagement /></BrowserRouter>);
}

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ user: { id: 1, username: 'admin', role: 'admin' } });
  api.get.mockResolvedValueOnce({ data: mockUsers });
});

// CHECK: all usernames appear in the table
test('renders all users in the table', async () => {
  renderPage();
  expect(await screen.findByText('admin')).toBeInTheDocument();
  expect(screen.getByText('teacher1')).toBeInTheDocument();
  expect(screen.getByText('student1')).toBeInTheDocument();
});

// CHECK: user count shows in subtitle
test('shows user count in subtitle', async () => {
  renderPage();
  expect(await screen.findByText(/3 users/)).toBeInTheDocument();
});

// CHECK: emails are displayed
test('displays user emails', async () => {
  renderPage();
  expect(await screen.findByText('admin@lms.com')).toBeInTheDocument();
  expect(screen.getByText('teacher@lms.com')).toBeInTheDocument();
});

// CHECK: table headers exist
test('shows table column headers', async () => {
  renderPage();
  expect(await screen.findByText('Username')).toBeInTheDocument();
  expect(screen.getByText('Email')).toBeInTheDocument();
  expect(screen.getByText('Role')).toBeInTheDocument();
});

// CHECK: back to dashboard link exists
test('shows Back to Dashboard button', async () => {
  renderPage();
  expect(await screen.findByText('Back to Dashboard')).toBeInTheDocument();
});

// --- INTERACTION TESTS ---
// These test real admin actions: changing user roles and deleting users.

// DO: change a user's role from "student" to "teacher" via the dropdown
// CHECK: API PATCH is called with the new role
//
// MUI Select components render as a styled <div> with a popup listbox.
// To test: 1) mouseDown to open the dropdown, 2) click the option.
// The MenuItem text is capitalized ("Teacher") but the value is lowercase ("teacher").
test('changing a user role sends PATCH request to API', async () => {
  api.patch.mockResolvedValueOnce({
    data: { ...mockUsers[2], role: 'teacher' },
  });

  renderPage();
  await screen.findByText('student1');

  // MUI Select doesn't render a native <select> — it uses a hidden input
  // under a styled div. jsdom can't fully simulate the popup listbox, so
  // direct node access is the recommended workaround for MUI Select tests.
  // See: https://github.com/testing-library/eslint-plugin-testing-library/issues/697
  const selectContainer = screen.getByLabelText('Role for student1');
  // eslint-disable-next-line testing-library/no-node-access
  const nativeInput = selectContainer.parentElement.querySelector('input[type="hidden"]')
    // eslint-disable-next-line testing-library/no-node-access
    || selectContainer.querySelector('input');

  if (nativeInput) {
    fireEvent.change(nativeInput, { target: { value: 'teacher' } });
  }

  await waitFor(() => {
    expect(api.patch).toHaveBeenCalledWith('users/3/', { role: 'teacher' });
  });
});

// DO: click the delete button for a user
// CHECK: API DELETE is called after confirmation
test('deleting a user sends DELETE request to API', async () => {
  // Mock window.confirm to auto-accept the confirmation dialog
  const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
  api.delete.mockResolvedValueOnce({});
  api.get.mockResolvedValueOnce({ data: mockUsers.filter(u => u.id !== 3) }); // refetch

  renderPage();
  await screen.findByText('student1');

  // Click the delete button for student1
  fireEvent.click(screen.getByLabelText('Delete user student1'));

  // Confirm dialog should have been shown
  expect(confirmSpy).toHaveBeenCalled();

  // API should be called with the correct user ID
  await waitFor(() => {
    expect(api.delete).toHaveBeenCalledWith('users/3/');
  });

  confirmSpy.mockRestore();
});

// DO: click delete for a user, but cancel the confirmation
// CHECK: API DELETE is NOT called
test('cancelling delete does not call API', async () => {
  const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

  renderPage();
  await screen.findByText('student1');

  fireEvent.click(screen.getByLabelText('Delete user student1'));

  // Confirmation was shown but cancelled — API should NOT be called
  expect(api.delete).not.toHaveBeenCalled();

  confirmSpy.mockRestore();
});
