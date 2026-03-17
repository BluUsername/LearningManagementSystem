import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Button, Box, CircularProgress, Alert, Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import api from '../api/axiosConfig';
import { useAuth } from '../contexts/AuthContext';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await api.get(`courses/${id}/`);
        setCourse(courseRes.data);

        if (user.role === 'student') {
          const enrollRes = await api.get('enrollments/');
          setEnrolled(enrollRes.data.some((e) => e.course.id === parseInt(id)));
        }
      } catch {
        setError('Failed to load course.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user.role]);

  const handleEnroll = async () => {
    try {
      await api.post(`courses/${id}/enroll/`);
      setEnrolled(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to enroll.');
    }
  };

  const handleUnenroll = async () => {
    try {
      await api.delete(`courses/${id}/unenroll/`);
      setEnrolled(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to unenroll.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`courses/${id}/`);
      navigate('/courses');
    } catch {
      setError('Failed to delete course.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!course) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Course not found.</Alert>
      </Container>
    );
  }

  const isOwner = user.role === 'teacher' && course.teacher === user.id;
  const isAdmin = user.role === 'admin';

  return (
    <Container sx={{ mt: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {course.title}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip icon={<PersonIcon />} label={`Teacher: ${course.teacher_name}`} />
          <Chip icon={<CalendarIcon />} label={`Created: ${new Date(course.created_at).toLocaleDateString()}`} />
          <Chip label={`${course.enrollment_count} enrolled`} color="secondary" />
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
          {course.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {user.role === 'student' && !enrolled && (
            <Button variant="contained" onClick={handleEnroll}>Enroll</Button>
          )}
          {user.role === 'student' && enrolled && (
            <Button variant="outlined" color="warning" onClick={handleUnenroll}>Unenroll</Button>
          )}
          {(isOwner || isAdmin) && (
            <Button variant="outlined" color="error" onClick={handleDelete}>Delete Course</Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default CourseDetail;
