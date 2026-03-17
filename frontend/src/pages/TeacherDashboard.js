import { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Box, CircularProgress, Alert, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import { Add as AddIcon, School as SchoolIcon } from '@mui/icons-material';
import api from '../api/axiosConfig';
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
      setCourses(res.data.filter((c) => c.teacher === user.id));
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
        <SchoolIcon color="primary" fontSize="large" />
        <Typography variant="h4" component="h1">Teacher Dashboard</Typography>
      </Box>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome back, {user.username}!
      </Typography>

      {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          My Courses ({courses.length})
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Create Course
        </Button>
      </Box>

      {courses.length === 0 ? (
        <Typography color="text.secondary">
          You haven't created any courses yet. Click "Create Course" to get started!
        </Typography>
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
