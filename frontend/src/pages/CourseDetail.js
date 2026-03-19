import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Button, Box, CircularProgress, Alert, Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import api, { getResults } from '../api/axiosConfig';
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
          setEnrolled(getResults(enrollRes.data).some((e) => e.course.id === parseInt(id)));
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
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2, color: '#90caf9' }}>
        Back
      </Button>

      {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{
        p: 4, overflow: 'hidden', position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'linear-gradient(135deg, #42a5f5, #ab47bc, #f57c00)',
        }} />
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#e8eaf6', mt: 1 }}>
          {course.title}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Chip icon={<PersonIcon sx={{ color: '#42a5f5 !important' }} />} label={`Teacher: ${course.teacher_name}`}
            sx={{ backgroundColor: 'rgba(66, 165, 245, 0.1)', color: '#90caf9', border: '1px solid rgba(66, 165, 245, 0.2)' }} />
          <Chip icon={<CalendarIcon sx={{ color: '#ab47bc !important' }} />} label={`Created: ${new Date(course.created_at).toLocaleDateString()}`}
            sx={{ backgroundColor: 'rgba(171, 71, 188, 0.1)', color: '#ce93d8', border: '1px solid rgba(171, 71, 188, 0.2)' }} />
          <Chip label={`${course.enrollment_count} enrolled`}
            sx={{ backgroundColor: 'rgba(245, 124, 0, 0.1)', color: '#ffb74d', border: '1px solid rgba(245, 124, 0, 0.2)' }} />
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3, color: '#c5cae9' }}>
          {course.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {user.role === 'student' && !enrolled && (
            <Button variant="contained" onClick={handleEnroll} sx={{
              background: 'linear-gradient(135deg, #f57c00, #ff9800)',
              '&:hover': { background: 'linear-gradient(135deg, #e65100, #f57c00)' },
            }}>Enroll</Button>
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
