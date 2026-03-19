import { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Grid, Box, CircularProgress, Alert, Paper, TextField, InputAdornment } from '@mui/material';
import { LibraryBooks as LibraryBooksIcon, Search as SearchIcon } from '@mui/icons-material';
import api, { getResults } from '../api/axiosConfig';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../contexts/AuthContext';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const fetchData = useCallback(async (search = '') => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const coursesRes = await api.get('courses/', { params });
      setCourses(getResults(coursesRes.data));

      if (user?.role === 'student') {
        const enrollRes = await api.get('enrollments/');
        setEnrolledIds(getResults(enrollRes.data).map((e) => e.course.id));
        }
      } catch {
        setError('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    }, [user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchData]);

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
      <Paper elevation={0} sx={{
        p: 4, mb: 4, borderRadius: 3,
        background: 'linear-gradient(135deg, #1a237e 0%, #1565c0 60%, #7b1fa2 100%)',
        color: 'white',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LibraryBooksIcon sx={{ fontSize: 36 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>All Courses</Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ opacity: 0.85, mt: 1 }}>
          Browse and enroll in {courses.length} available course{courses.length !== 1 ? 's' : ''}
        </Typography>
      </Paper>

      <TextField
        fullWidth
        placeholder="Search courses by title, description, or teacher..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderRadius: 2,
            color: '#fff',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
            '&.Mui-focused fieldset': { borderColor: '#42a5f5' },
          },
          '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.4)' },
        }}
      />

      {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}

      {courses.length === 0 ? (
        <Typography color="text.secondary">No courses available yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <CourseCard
                course={course}
                showEnroll={user?.role === 'student' && !enrolledIds.includes(course.id)}
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
