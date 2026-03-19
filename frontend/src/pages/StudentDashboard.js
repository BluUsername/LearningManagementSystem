import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Grid, Box, CircularProgress, Alert, Button, Paper,
} from '@mui/material';
import { School as SchoolIcon, LibraryBooks as LibraryBooksIcon } from '@mui/icons-material';
import api, { getResults } from '../api/axiosConfig';
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
        setEnrollments(getResults(res.data));
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
      <Paper elevation={0} sx={{
        p: 4, mb: 4, borderRadius: 3,
        background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 60%, #7b1fa2 100%)',
        color: 'white',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1.5 }}>
          <SchoolIcon sx={{ fontSize: 36 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>Student Dashboard</Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ opacity: 0.85 }}>
          Welcome back, {user.username}! You are enrolled in {enrollments.length} course{enrollments.length !== 1 ? 's' : ''}.
        </Typography>
      </Paper>

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
          sx={{
            background: 'linear-gradient(135deg, #f57c00, #ff9800)',
            '&:hover': { background: 'linear-gradient(135deg, #e65100, #f57c00)' },
          }}
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
