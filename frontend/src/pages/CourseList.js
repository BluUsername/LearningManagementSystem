import { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, CircularProgress, Alert } from '@mui/material';
import { LibraryBooks as LibraryBooksIcon } from '@mui/icons-material';
import api from '../api/axiosConfig';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../contexts/AuthContext';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesRes = await api.get('courses/');
        setCourses(coursesRes.data);

        if (user.role === 'student') {
          const enrollRes = await api.get('enrollments/');
          setEnrolledIds(enrollRes.data.map((e) => e.course.id));
        }
      } catch {
        setError('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`courses/${courseId}/enroll/`);
      setEnrolledIds([...enrolledIds, courseId]);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to enroll.');
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <LibraryBooksIcon color="primary" fontSize="large" />
        <Typography variant="h4" component="h1">All Courses</Typography>
      </Box>

      {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}

      {courses.length === 0 ? (
        <Typography color="text.secondary">No courses available yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <CourseCard
                course={course}
                showEnroll={user.role === 'student' && !enrolledIds.includes(course.id)}
                onEnroll={() => handleEnroll(course.id)}
                enrolled={enrolledIds.includes(course.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default CourseList;
