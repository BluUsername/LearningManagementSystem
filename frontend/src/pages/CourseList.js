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
      {/* Hero Banner */}
      <Paper elevation={0} sx={{
        p: 4, mb: 4, borderRadius: 3, position: 'relative', overflow: 'hidden',
        backgroundImage: `
          linear-gradient(135deg, rgba(26, 35, 126, 0.92) 0%, rgba(21, 101, 192, 0.85) 60%, rgba(123, 31, 162, 0.9) 100%),
          url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LibraryBooksIcon sx={{ fontSize: 36 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>All Courses</Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ opacity: 0.85, mt: 1 }}>
            Browse and enrol in {courses.length} available course{courses.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
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
        <Paper elevation={0} sx={{
          p: 6, textAlign: 'center', borderRadius: 3,
          border: '1px dashed rgba(66, 165, 245, 0.3)',
          background: 'rgba(66, 165, 245, 0.03)',
        }}>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80"
            alt="No courses yet"
            sx={{ width: 200, height: 140, objectFit: 'cover', borderRadius: 3, mb: 3, opacity: 0.85 }}
          />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No courses available yet
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
            Check back soon — new courses are added regularly by our amazing teachers!
          </Typography>
        </Paper>
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
