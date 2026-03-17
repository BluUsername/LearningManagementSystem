import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Paper, Typography, TextField, Button, Alert, Box, Link,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const user = await register(
        formData.username, formData.email,
        formData.password, formData.password2, formData.role,
      );
      switch (user.role) {
        case 'student': navigate('/student'); break;
        case 'teacher': navigate('/teacher'); break;
        default: navigate('/courses');
      }
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join(' ');
        setError(messages);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
          <PersonAddIcon color="primary" />
          <Typography variant="h5" component="h1">
            Register
          </Typography>
        </Box>

        {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Username"
            name="username"
            fullWidth
            required
            margin="normal"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            autoFocus
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            helperText="Must be at least 8 characters"
          />
          <TextField
            label="Confirm Password"
            name="password2"
            type="password"
            fullWidth
            required
            margin="normal"
            value={formData.password2}
            onChange={handleChange}
            autoComplete="new-password"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 2, mb: 2 }}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </Box>

        <Typography variant="body2" align="center">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login">Log in here</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default Register;
