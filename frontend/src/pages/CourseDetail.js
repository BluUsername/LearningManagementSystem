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
        overflow: 'hidden', position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        {/* Course Hero Image */}
        <Box sx={{
          height: { xs: 150, sm: 175, md: 200 },
          backgroundImage: `
            linear-gradient(135deg, rgba(26, 35, 126, 0.85) 0%, rgba(21, 101, 192, 0.7) 50%, rgba(123, 31, 162, 0.8) 100%),
            url('https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1400&q=80')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
          p: 4,
        }}>
          <Typography variant="h4" component="h1" sx={{ color: '#fff', fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            {course.title}
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>

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
        </Box>
      </Paper>
    </Container>
  );
}

export default CourseDetail;
