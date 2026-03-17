import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Grid, Box, CircularProgress, Alert, Button,
} from '@mui/material';
import { School as SchoolIcon, LibraryBooks as LibraryBooksIcon } from '@mui/icons-material';
import api from '../api/axiosConfig';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../contexts/AuthContext';

function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await api.get('enrollments/');
        setEnrollments(res.data);
      } catch {
        setError('Failed to load enrollments.');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
        <SchoolIcon color="primary" fontSize="large" />
        <Typography variant="h4" component="h1">Student Dashboard</Typography>
      </Box>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome back, {user.username}!
      </Typography>

      {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          My Enrolled Courses ({enrollments.length})
        </Typography>
        <Button
          variant="contained"
          component={RouterLink}
          to="/courses"
          startIcon={<LibraryBooksIcon />}
        >
          Browse Courses
        </Button>
      </Box>

      {enrollments.length === 0 ? (
        <Typography color="text.secondary">
          You are not enrolled in any courses yet. Browse courses to get started!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {enrollments.map((enrollment) => (
            <Grid item xs={12} sm={6} md={4} key={enrollment.id}>
              <CourseCard course={enrollment.course} enrolled />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default StudentDashboard;
