import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chat from '../pages/Chat';

jest.mock('../api/axiosConfig', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const api = require('../api/axiosConfig').default;

beforeEach(() => {
  jest.clearAllMocks();
  // Chat loads conversation list on mount
  api.get.mockResolvedValueOnce({ data: [] });
});

// CHECK: page renders with key elements
test('renders Chat interface with New Chat button', async () => {
  render(<Chat />);
  expect(await screen.findByText('New Chat')).toBeInTheDocument();
});

// CHECK: empty state shows when no conversations
test('shows empty state when no conversations exist', async () => {
  render(<Chat />);
  expect(await screen.findByText(/Start a conversation/)).toBeInTheDocument();
});

// DO: click New Chat
// CHECK: API is called to create a conversation
test('creates new conversation when New Chat is clicked', async () => {
  // Mock scrollIntoView since jsdom doesn't support it
  window.HTMLElement.prototype.scrollIntoView = jest.fn();

  api.post.mockResolvedValueOnce({
    data: { id: 1, title: 'New Conversation', messages: [] },
  });
  api.get
    .mockResolvedValueOnce({ data: [] }) // messages for new conversation
    .mockResolvedValueOnce({ data: [{ id: 1, title: 'New Conversation', updated_at: '2026-03-29T00:00:00Z' }] });

  render(<Chat />);
  await screen.findByText('New Chat');

  fireEvent.click(screen.getByText('New Chat'));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith('chat/conversations/', expect.any(Object));
  });
});

// CHECK: existing conversations appear in the sidebar
test('displays existing conversations in sidebar', async () => {
  api.get.mockReset().mockResolvedValueOnce({
    data: [
      { id: 1, title: 'My First Chat', updated_at: '2026-03-28T10:00:00Z' },
      { id: 2, title: 'Help with Python', updated_at: '2026-03-29T10:00:00Z' },
    ],
  });

  render(<Chat />);
  expect(await screen.findByText('My First Chat')).toBeInTheDocument();
  expect(screen.getByText('Help with Python')).toBeInTheDocument();
});
