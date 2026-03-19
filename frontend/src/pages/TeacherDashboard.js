import { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Box, CircularProgress, Alert, Button, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import {
  Add as AddIcon, School as SchoolIcon,
  Groups as GroupsIcon, AutoStories as AutoStoriesIcon,
} from '@mui/icons-material';
import api, { getResults } from '../api/axiosConfig';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../contexts/AuthContext';

function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const { user } = useAuth();

  const fetchCourses = async () => {
    try {
      const res = await api.get('courses/');
      setCourses(getResults(res.data).filter((c) => c.teacher === user.id));
    } catch {
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setFormData({ title: '', description: '' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setFormData({ title: course.title, description: course.description });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingCourse) {
        await api.put(`courses/${editingCourse.id}/`, formData);
      } else {
        await api.post('courses/', formData);
      }
      setDialogOpen(false);
      setLoading(true);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save course.');
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`courses/${courseId}/`);
      setCourses(courses.filter((c) => c.id !== courseId));
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

  return (
    <Container sx={{ mt: 4 }}>
      {/* Hero Banner */}
      <Paper elevation={0} sx={{
        p: 4, mb: 4, borderRadius: 3, position: 'relative', overflow: 'hidden',
        backgroundImage: `
          linear-gradient(135deg, rgba(26, 35, 126, 0.92) 0%, rgba(21, 101, 192, 0.85) 60%, rgba(123, 31, 162, 0.9) 100%),
          url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1400&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1.5 }}>
            <SchoolIcon sx={{ fontSize: 36 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>Teacher Dashboard</Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ opacity: 0.85, mb: 3 }}>
            Welcome back, {user.username}! Inspire minds and shape the future.
          </Typography>

          {/* Stats Row */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 2, py: 1, backdropFilter: 'blur(8px)' }}>
              <AutoStoriesIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {courses.length} Course{courses.length !== 1 ? 's' : ''} Created
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 2, py: 1, backdropFilter: 'blur(8px)' }}>
              <GroupsIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0)} Students Enrolled
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          My Courses ({courses.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            background: 'linear-gradient(135deg, #f57c00, #ff9800)',
            '&:hover': { background: 'linear-gradient(135deg, #e65100, #f57c00)' },
          }}
        >
          Create Course
        </Button>
      </Box>

      {courses.length === 0 ? (
        <Paper elevation={0} sx={{
          p: 6, textAlign: 'center', borderRadius: 3,
          border: '1px dashed rgba(171, 71, 188, 0.3)',
          background: 'rgba(171, 71, 188, 0.03)',
        }}>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=400&q=80"
            alt="Start teaching"
            sx={{ width: 200, height: 140, objectFit: 'cover', borderRadius: 3, mb: 3, opacity: 0.85 }}
          />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Ready to share your knowledge?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
            Create your first course and start making an impact. Great teachers change lives — yours will too.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              background: 'linear-gradient(135deg, #f57c00, #ff9800)',
              '&:hover': { background: 'linear-gradient(135deg, #e65100, #f57c00)' },
            }}
          >
            Create Your First Course
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <CourseCard
                course={course}
                showActions
                onEdit={() => handleOpenEdit(course)}
                onDelete={() => handleDelete(course.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Course Title"
            fullWidth
            required
            margin="normal"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            autoFocus
          />
          <TextField
            label="Description"
            fullWidth
            required
            margin="normal"
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingCourse ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TeacherDashboard;
