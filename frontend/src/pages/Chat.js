import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, TextField, IconButton, List, ListItem,
  ListItemButton, ListItemText, Drawer, AppBar, Toolbar,
  CircularProgress, Divider, Paper, Tooltip, useMediaQuery,
  useTheme, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, ListItemSecondaryAction,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  Chat as ChatIcon,
  Delete as DeleteIcon,
  SmartToy as AssistantIcon,
  Person as PersonIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import api from '../api/axiosConfig';

const DRAWER_WIDTH = 280;

function ConversationList({ conversations, activeId, onSelect, onNew, onDelete, loading }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{
        p: 2,
        background: 'linear-gradient(135deg, rgba(21,101,192,0.15), rgba(123,31,162,0.1))',
        display: 'flex', alignItems: 'center', gap: 1,
      }}>
        <HistoryIcon sx={{ color: '#42a5f5' }} />
        <Typography variant="subtitle1" component="p" sx={{ fontWeight: 700, flexGrow: 1 }}>
          Chat History
        </Typography>
      </Box>

      <Box sx={{ p: 1.5 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={onNew}
          size="small"
          sx={{ borderRadius: 2 }}
        >
          New Chat
        </Button>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : conversations.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No conversations yet. Start a new chat!
          </Typography>
        </Box>
      ) : (
        <List dense sx={{ flexGrow: 1, overflowY: 'auto', py: 0 }}>
          {conversations.map((conv) => (
            <ListItem
              key={conv.id}
              disablePadding
              secondaryAction={
                <Tooltip title="Delete">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                    sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemButton
                selected={conv.id === activeId}
                onClick={() => onSelect(conv.id)}
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  pr: 5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(66,165,245,0.15)',
                    '&:hover': { backgroundColor: 'rgba(66,165,245,0.2)' },
                  },
                }}
              >
                <ListItemText
                  primary={conv.title}
                  secondary={
                    conv.last_message
                      ? conv.last_message.content
                      : 'No messages yet'
                  }
                  primaryTypographyProps={{
                    noWrap: true,
                    fontSize: '0.85rem',
                    fontWeight: conv.id === activeId ? 600 : 400,
                  }}
                  secondaryTypographyProps={{ noWrap: true, fontSize: '0.75rem' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      mb: 1.5,
      px: { xs: 1, sm: 2 },
    }}>
      {!isUser && (
        <Box sx={{
          width: 32, height: 32, borderRadius: '50%', mr: 1, mt: 0.5, flexShrink: 0,
          backgroundColor: 'rgba(66,165,245,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AssistantIcon sx={{ fontSize: 18, color: '#42a5f5' }} />
        </Box>
      )}
      <Paper elevation={0} sx={{
        px: 2, py: 1.5,
        maxWidth: { xs: '85%', sm: '70%' },
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        backgroundColor: isUser
          ? 'rgba(21,101,192,0.85)'
          : 'rgba(255,255,255,0.06)',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
      }}>
        <Typography variant="body2" component="div" sx={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: 1.6,
          '& strong': { fontWeight: 700, color: isUser ? '#fff' : '#90caf9' },
        }}
          dangerouslySetInnerHTML={{
            __html: message.content
              .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
          }}
        />
        <Typography variant="caption" sx={{
          display: 'block', mt: 0.5, opacity: 0.6, textAlign: 'right',
        }}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Paper>
      {isUser && (
        <Box sx={{
          width: 32, height: 32, borderRadius: '50%', ml: 1, mt: 0.5, flexShrink: 0,
          backgroundColor: 'rgba(21,101,192,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <PersonIcon sx={{ fontSize: 18, color: '#90caf9' }} />
        </Box>
      )}
    </Box>
  );
}

export default function Chat() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleteDialogId, setDeleteDialogId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('chat/conversations/');
      const list = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      setConversations(list);
    } catch {
      // silently handle — user sees empty state
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const openConversation = useCallback(async (id) => {
    setActiveConversation(id);
    setLoadingMessages(true);
    if (isMobile) setDrawerOpen(false);
    try {
      const res = await api.get(`chat/conversations/${id}/`);
      setMessages(res.data.messages ?? []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [isMobile]);

  const handleNewConversation = async () => {
    try {
      const res = await api.post('chat/conversations/', { title: 'New Conversation' });
      const conv = res.data;
      setConversations((prev) => [
        { id: conv.id, title: conv.title, message_count: conv.messages?.length ?? 0, last_message: null },
        ...prev,
      ]);
      setActiveConversation(conv.id);
      setMessages(conv.messages ?? []);
      if (isMobile) setDrawerOpen(false);
    } catch {
      // no-op
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !activeConversation || sending) return;

    setInput('');
    setSending(true);

    // Optimistically add the user message
    const optimistic = { id: `tmp-${Date.now()}`, role: 'user', content: text, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await api.post(`chat/conversations/${activeConversation}/messages/`, { content: text });
      const { user_message, assistant_message } = res.data;

      // Replace optimistic message with the real one, then add the bot reply
      setMessages((prev) => [
        ...prev.map((m) => m.id === optimistic.id ? user_message : m),
        assistant_message,
      ]);

      // Update conversation list (title may have changed, bump to top)
      fetchConversations();
    } catch {
      // Remove the optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const id = deleteDialogId;
    setDeleteDialogId(null);
    try {
      await api.delete(`chat/conversations/${id}/`);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversation === id) {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch {
      // no-op
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sidebarContent = (
    <ConversationList
      conversations={conversations}
      activeId={activeConversation}
      onSelect={openConversation}
      onNew={handleNewConversation}
      onDelete={(id) => setDeleteDialogId(id)}
      loading={loadingConversations}
    />
  );

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Box sx={{
          width: DRAWER_WIDTH, flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.08)',
          overflowY: 'auto',
        }}>
          {sidebarContent}
        </Box>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: DRAWER_WIDTH } }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Main chat area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Chat header */}
        <AppBar position="static" color="transparent" elevation={0} sx={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
        }}>
          <Toolbar variant="dense" sx={{ gap: 1 }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setDrawerOpen(true)} size="small">
                <MenuIcon />
              </IconButton>
            )}
            <ChatIcon sx={{ color: '#42a5f5', fontSize: 20 }} />
            <Typography variant="subtitle1" component="p" sx={{ fontWeight: 600, flexGrow: 1 }} noWrap>
              {activeConversation
                ? (conversations.find((c) => c.id === activeConversation)?.title ?? 'Chat')
                : 'LearnHub Assistant'}
            </Typography>
            <Chip
              label="History saved"
              size="small"
              sx={{
                fontSize: '0.7rem',
                backgroundColor: 'rgba(66,165,245,0.15)',
                color: '#90caf9',
                border: '1px solid rgba(66,165,245,0.25)',
              }}
            />
          </Toolbar>
        </AppBar>

        {/* Messages */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', py: 2 }}>
          {!activeConversation ? (
            <Box sx={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: 2, px: 3, textAlign: 'center',
            }}>
              <AssistantIcon sx={{ fontSize: 56, color: 'rgba(66,165,245,0.4)' }} />
              <Typography variant="h6" component="p" color="text.secondary">
                Your chat history is saved
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
                Start a new conversation or pick up where you left off — your messages
                are stored to your account and available on any device.
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleNewConversation}>
                Start a conversation
              </Button>
            </Box>
          ) : loadingMessages ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {sending && (
                <Box sx={{ display: 'flex', px: 3, mb: 1 }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">Sending…</Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>

        {/* Input */}
        {activeConversation && (
          <Box sx={{
            p: { xs: 1.5, sm: 2 },
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', gap: 1, alignItems: 'flex-end',
          }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              sx={{
                backgroundColor: 'rgba(21,101,192,0.8)',
                '&:hover': { backgroundColor: '#1565c0' },
                '&:disabled': { backgroundColor: 'rgba(255,255,255,0.05)' },
                borderRadius: 2,
                p: 1.2,
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteDialogId} onClose={() => setDeleteDialogId(null)}>
        <DialogTitle>Delete conversation?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This will permanently delete the conversation and all its messages.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogId(null)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
