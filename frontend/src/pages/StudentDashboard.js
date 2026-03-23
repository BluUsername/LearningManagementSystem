import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Grid, Box, CircularProgress, Alert, Button, Paper, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
  School as SchoolIcon, LibraryBooks as LibraryBooksIcon,
  TrendingUp as TrendingUpIcon, EmojiEvents as TrophyIcon,
  AutoStories as AutoStoriesIcon, AccessTime as AccessTimeIcon,
  SortByAlpha as SortByAlphaIcon,
} from '@mui/icons-material';
import api, { getResults } from '../api/axiosConfig';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../contexts/AuthContext';

function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
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
    <Container sx={{ mt: 4, mb: 6 }}>
      {/* Hero Banner */}
      <Paper elevation={0} sx={{
        p: 4, mb: 4, borderRadius: 3, position: 'relative', overflow: 'hidden',
        backgroundImage: `
          linear-gradient(135deg, rgba(26, 35, 126, 0.92) 0%, rgba(21, 101, 192, 0.85) 60%, rgba(123, 31, 162, 0.9) 100%),
          url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1400&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1.5 }}>
            <SchoolIcon sx={{ fontSize: 36 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>Student Dashboard</Typography>
          </Box>
          <Typography variant="subtitle1" component="p" sx={{ opacity: 0.85, mb: 3 }}>
            Welcome back, {user.username}! Keep up the great work on your learning journey.
          </Typography>

          {/* Stats Row */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 2, py: 1, backdropFilter: 'blur(8px)' }}>
              <AutoStoriesIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {enrollments.length} Course{enrollments.length !== 1 ? 's' : ''} Enrolled
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 2, py: 1, backdropFilter: 'blur(8px)' }}>
              <TrendingUpIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Active Learner</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 2, py: 1, backdropFilter: 'blur(8px)' }}>
              <TrophyIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Keep Going!</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" component="h2">
          My Enrolled Courses ({enrollments.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {enrollments.length > 1 && (
            <ToggleButtonGroup
              value={sortOrder}
              exclusive
              onChange={(e, value) => { if (value) setSortOrder(value); }}
              size="small"
            >
              <ToggleButton value="recent" aria-label="sort by most recent">
                <AccessTimeIcon sx={{ mr: 0.5, fontSize: 18 }} /> Recent
              </ToggleButton>
              <ToggleButton value="az" aria-label="sort alphabetically">
                <SortByAlphaIcon sx={{ mr: 0.5, fontSize: 18 }} /> A–Z
              </ToggleButton>
            </ToggleButtonGroup>
          )}
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
      </Box>

      {enrollments.length === 0 ? (
        <Paper elevation={0} sx={{
          p: 6, textAlign: 'center', borderRadius: 3,
          border: '1px dashed rgba(66, 165, 245, 0.3)',
          background: 'rgba(66, 165, 245, 0.03)',
        }}>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80"
            alt="Start learning"
            sx={{ width: { xs: 160, sm: 200 }, height: { xs: 110, sm: 140 }, objectFit: 'cover', borderRadius: 3, mb: 3, opacity: 0.85 }}
          />
          <Typography variant="h6" component="p" sx={{ mb: 1, fontWeight: 600 }}>
            Your learning adventure starts here!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            Browse our course catalogue and enrol in subjects that spark your curiosity. Every expert was once a beginner.
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
            Explore Courses
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {[...enrollments]
            .sort((a, b) => {
              if (sortOrder === 'az') {
                return a.course.title.localeCompare(b.course.title);
              }
              // 'recent' — most recently enrolled first
              return new Date(b.enrolled_at) - new Date(a.enrolled_at);
            })
            .map((enrollment) => (
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
