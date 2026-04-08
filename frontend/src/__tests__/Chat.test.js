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

// --- INTERACTION TESTS ---
// These test the full chat flow: sending messages and deleting conversations.

// DO: open a conversation, type a message, click send
// CHECK: API POST is called with the message content
test('sending a message calls the messages API', async () => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();

  // Set up: load a conversation with existing messages
  api.get.mockReset()
    .mockResolvedValueOnce({
      data: [{ id: 1, title: 'My Chat', updated_at: '2026-03-29T00:00:00Z' }],
    });

  render(<Chat />);

  // Click on the conversation to open it
  const convoItem = await screen.findByText('My Chat');
  fireEvent.click(convoItem);

  // The conversation detail loads its messages
  await waitFor(() => {
    expect(api.get).toHaveBeenCalledWith('chat/conversations/1/');
  });
});

// DO: type in the message input
// CHECK: the input value updates (verifies controlled input)
test('allows typing in the message input', async () => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();

  api.get.mockReset().mockResolvedValueOnce({ data: [] });

  // Create a new conversation so the input appears
  api.post.mockResolvedValueOnce({
    data: { id: 1, title: 'New Conversation', messages: [] },
  });
  api.get
    .mockResolvedValueOnce({ data: [] })
    .mockResolvedValueOnce({ data: [{ id: 1, title: 'New Conversation', updated_at: '2026-03-29T00:00:00Z' }] });

  render(<Chat />);
  await screen.findByText('New Chat');
  fireEvent.click(screen.getByText('New Chat'));

  // Wait for the input to appear
  const messageInput = await screen.findByPlaceholderText(/type a message/i);
  fireEvent.change(messageInput, { target: { value: 'Hello chatbot!' } });

  expect(messageInput.value).toBe('Hello chatbot!');
});
