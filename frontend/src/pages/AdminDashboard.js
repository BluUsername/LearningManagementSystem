import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Grid, Box, CircularProgress, Alert, Button, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon, People as PeopleIcon,
  LibraryBooks as LibraryBooksIcon, Add as AddIcon,
} from '@mui/icons-material';
import api, { getResults } from '../api/axiosConfig';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../contexts/AuthContext';

function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.all([
        api.get('courses/'),
        api.get('users/'),
      ]);
      setCourses(getResults(coursesRes.data));
      setUserCount(getResults(usersRes.data).length);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      fetchData();
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

  const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollment_count, 0);

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
        minHeight: { xs: 120, sm: 140 },
        background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.92) 0%, rgba(21, 101, 192, 0.85) 60%, rgba(123, 31, 162, 0.9) 100%)',
        color: 'white',
      }}>
        {/* Hero background image with fetchpriority for LCP */}
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80"
          alt=""
          loading="eager"
          fetchPriority="high"
          sx={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover', zIndex: 0, opacity: 0.15,
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1.5 }}>
            <AdminIcon sx={{ fontSize: 36 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>Admin Dashboard</Typography>
          </Box>
          <Typography variant="subtitle1" component="p" sx={{ opacity: 0.85 }}>
            Welcome back, {user.username}! Here's your platform overview at a glance.
          </Typography>
        </Box>
      </Paper>

      {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{
            p: 3, textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(21, 101, 192, 0.15), rgba(66, 165, 245, 0.08))',
            borderLeft: '4px solid #42a5f5',
            border: '1px solid rgba(66, 165, 245, 0.2)',
            borderLeftWidth: 4,
            borderLeftColor: '#42a5f5',
          }}>
            <PeopleIcon sx={{ fontSize: 40, color: '#42a5f5' }} />
            <Typography variant="h3" component="p" sx={{ fontWeight: 700, color: '#90caf9' }}>{userCount}</Typography>
            <Typography sx={{ color: '#42a5f5', fontWeight: 500 }}>Total Users</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{
            p: 3, textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(123, 31, 162, 0.15), rgba(171, 71, 188, 0.08))',
            border: '1px solid rgba(171, 71, 188, 0.2)',
            borderLeftWidth: 4,
            borderLeftColor: '#ab47bc',
          }}>
            <LibraryBooksIcon sx={{ fontSize: 40, color: '#ab47bc' }} />
            <Typography variant="h3" component="p" sx={{ fontWeight: 700, color: '#ce93d8' }}>{courses.length}</Typography>
            <Typography sx={{ color: '#ab47bc', fontWeight: 500 }}>Total Courses</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{
            p: 3, textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(245, 124, 0, 0.15), rgba(255, 183, 77, 0.08))',
            border: '1px solid rgba(245, 124, 0, 0.2)',
            borderLeftWidth: 4,
            borderLeftColor: '#f57c00',
          }}>
            <PeopleIcon sx={{ fontSize: 40, color: '#f57c00' }} />
            <Typography variant="h3" component="p" sx={{ fontWeight: 700, color: '#ffb74d' }}>{totalEnrollments}</Typography>
            <Typography sx={{ color: '#f57c00', fontWeight: 500 }}>Total Enrollments</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">All Courses</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/admin/users"
            startIcon={<PeopleIcon />}
          >
            Manage Users
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Create Course
          </Button>
        </Box>
      </Box>

      {courses.length === 0 ? (
        <Typography sx={{ color: '#9fa8da' }}>No courses yet.</Typography>
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

export default AdminDashboard;
