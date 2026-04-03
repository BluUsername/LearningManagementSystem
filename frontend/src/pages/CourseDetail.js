import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container, Typography, Paper, Button, Box, CircularProgress, Alert, Chip,
  List, ListItem, ListItemIcon, ListItemText, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, Person as PersonIcon,
  CalendarToday as CalendarIcon, Assignment as AssignmentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import api, { getResults } from '../api/axiosConfig';
import { useAuth } from '../contexts/AuthContext';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create assignment dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '', description: '', due_date: '', max_points: 100,
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => { document.title = 'Course Details | LearnHub'; }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await api.get(`courses/${id}/`);
        setCourse(courseRes.data);

        let isEnrolled = false;
        if (user.role === 'student') {
          const enrollRes = await api.get('enrollments/');
          isEnrolled = getResults(enrollRes.data).some((e) => e.course.id === parseInt(id));
          setEnrolled(isEnrolled);
        }

        // Load assignments if enrolled student, teacher, or admin
        const isOwnerOrAdmin = user.role === 'admin'
          || (user.role === 'teacher' && courseRes.data.teacher === user.id);
        if (isEnrolled || isOwnerOrAdmin) {
          try {
            const assignRes = await api.get(`courses/${id}/assignments/`);
            setAssignments(getResults(assignRes.data));
          } catch { /* assignments not accessible */ }
        }
      } catch {
        setError('Failed to load course.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user.role, user.id]);

  const handleEnroll = async () => {
    try {
      await api.post(`courses/${id}/enroll/`);
      setEnrolled(true);
      // Load assignments now that we're enrolled
      try {
        const assignRes = await api.get(`courses/${id}/assignments/`);
        setAssignments(getResults(assignRes.data));
      } catch { /* ok */ }
      // Trigger achievement check
      try { await api.post('achievements/check/'); } catch { /* non-critical */ }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to enroll.');
    }
  };

  const handleCreateAssignment = async () => {
    setCreating(true);
    setError('');
    try {
      const res = await api.post(`courses/${id}/assignments/`, newAssignment);
      setAssignments((prev) => [res.data, ...prev]);
      setDialogOpen(false);
      setNewAssignment({ title: '', description: '', due_date: '', max_points: 100 });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create assignment.');
    } finally {
      setCreating(false);
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

      {/* Assignments Section */}
      {(enrolled || isOwner || isAdmin) && (
        <Paper elevation={0} sx={{
          mt: 3, p: 3, borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIcon sx={{ color: '#f57c00' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Assignments ({assignments.length})
              </Typography>
            </Box>
            {(isOwner || isAdmin) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setDialogOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #f57c00, #ff9800)',
                  '&:hover': { background: 'linear-gradient(135deg, #e65100, #f57c00)' },
                }}
              >
                New Assignment
              </Button>
            )}
          </Box>

          {assignments.length === 0 ? (
            <Typography color="text.secondary">
              No assignments yet.
            </Typography>
          ) : (
            <List>
              {assignments.map((a, index) => {
                const isPastDue = new Date(a.due_date) < new Date();
                return (
                  <Box key={a.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      component={RouterLink}
                      to={`/courses/${id}/assignments/${a.id}`}
                      sx={{
                        borderRadius: 2, py: 1.5,
                        textDecoration: 'none', color: 'inherit',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
                      }}
                    >
                      <ListItemIcon>
                        <AssignmentIcon sx={{ color: isPastDue ? '#ef5350' : '#66bb6a' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={a.title}
                        secondary={`Due: ${new Date(a.due_date).toLocaleString()} | ${a.max_points} pts`}
                      />
                      <Chip
                        size="small"
                        label={isPastDue ? 'Past due' : 'Open'}
                        sx={{
                          backgroundColor: isPastDue
                            ? 'rgba(239, 83, 80, 0.1)' : 'rgba(102, 187, 106, 0.1)',
                          color: isPastDue ? '#ef9a9a' : '#a5d6a7',
                        }}
                      />
                    </ListItem>
                  </Box>
                );
              })}
            </List>
          )}
        </Paper>
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Assignment</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="Title"
            fullWidth
            value={newAssignment.title}
            onChange={(e) => setNewAssignment((p) => ({ ...p, title: e.target.value }))}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newAssignment.description}
            onChange={(e) => setNewAssignment((p) => ({ ...p, description: e.target.value }))}
          />
          <TextField
            label="Due Date"
            type="datetime-local"
            fullWidth
            value={newAssignment.due_date}
            onChange={(e) => setNewAssignment((p) => ({ ...p, due_date: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Max Points"
            type="number"
            fullWidth
            value={newAssignment.max_points}
            onChange={(e) => setNewAssignment((p) => ({ ...p, max_points: parseInt(e.target.value, 10) || 0 }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateAssignment}
            disabled={creating || !newAssignment.title || !newAssignment.description || !newAssignment.due_date}
            sx={{
              background: 'linear-gradient(135deg, #f57c00, #ff9800)',
              '&:hover': { background: 'linear-gradient(135deg, #e65100, #f57c00)' },
            }}
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CourseDetail;
