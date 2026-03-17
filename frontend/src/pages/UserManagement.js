import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, CircularProgress, Alert, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Select, MenuItem, IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, Delete as DeleteIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import api from '../api/axiosConfig';
import { useAuth } from '../contexts/AuthContext';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('users/');
        setUsers(res.data);
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
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin')} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <PeopleIcon color="primary" fontSize="large" />
        <Typography variant="h4" component="h1">User Management</Typography>
      </Box>

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
