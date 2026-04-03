import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import {
  Container, Typography, Box, CircularProgress, Alert, Button, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, Delete as DeleteIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import api, { getResults } from '../api/axiosConfig';
import { useAuth } from '../contexts/AuthContext';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useDocumentTitle('User Management');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('users/');
        setUsers(getResults(res.data));
      } catch {
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`users/${userId}/`, { role: newRole });
      setUsers(users.map((u) =>
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch {
      setError('Failed to update user role.');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`users/${userId}/`);
      setUsers(users.filter((u) => u.id !== userId));
    } catch {
      setError('Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin')} sx={{ mb: 2, color: '#90caf9' }}>
        Back to Dashboard
      </Button>

      {/* Hero Banner */}
      <Paper elevation={0} sx={{
        p: 4, mb: 4, borderRadius: 3, position: 'relative', overflow: 'hidden',
        backgroundImage: `
          linear-gradient(135deg, rgba(26, 35, 126, 0.92) 0%, rgba(21, 101, 192, 0.85) 60%, rgba(123, 31, 162, 0.9) 100%),
          url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PeopleIcon sx={{ fontSize: 36 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>User Management</Typography>
          </Box>
          <Typography variant="subtitle1" component="p" sx={{ opacity: 0.85, mt: 1 }}>
            Manage roles and permissions for {users.length} user{users.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Date Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Select
                    value={u.role}
                    size="small"
                    aria-label={`Role for ${u.username}`}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={u.id === currentUser.id}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="teacher">Teacher</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>{new Date(u.date_joined).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(u.id)}
                    disabled={u.id === currentUser.id}
                    aria-label={`Delete user ${u.username}`}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default UserManagement;
