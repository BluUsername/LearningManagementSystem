import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Button, Box, CircularProgress, Alert,
  Chip, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Grade as GradeIcon,
  Send as SendIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import api, { getResults } from '../api/axiosConfig';
import { useAuth } from '../contexts/AuthContext';

function AssignmentDetail() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Student submission state
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [mySubmission, setMySubmission] = useState(null);

  // Teacher grading state
  const [grading, setGrading] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assignmentRes = await api.get(
          `courses/${courseId}/assignments/${assignmentId}/`
        );
        setAssignment(assignmentRes.data);

        const subRes = await api.get(
          `assignments/${assignmentId}/submissions/`
        );
        const subs = getResults(subRes.data);
        setSubmissions(subs);

        // Check if student already submitted
        if (user.role === 'student' && subs.length > 0) {
          setHasSubmitted(true);
          setMySubmission(subs[0]);
        }
      } catch {
        setError('Failed to load assignment.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, assignmentId, user.role]);

  const handleSubmit = async () => {
    if (!content.trim() && !file) return;
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      if (content.trim()) formData.append('content', content);
      if (file) formData.append('file', file);

      const res = await api.post(`assignments/${assignmentId}/submit/`, formData);
      setHasSubmitted(true);
      setMySubmission(res.data);
      setSuccess('Assignment submitted successfully!');

      // Trigger achievement check
      try { await api.post('achievements/check/'); } catch { /* non-critical */ }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrade = async (submissionId) => {
    const gradeData = grading[submissionId];
    if (!gradeData?.grade && gradeData?.grade !== 0) return;
    setError('');
    try {
      const res = await api.patch(`submissions/${submissionId}/grade/`, {
        grade: parseInt(gradeData.grade, 10),
        feedback: gradeData.feedback || '',
      });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? res.data : s))
      );
      setSuccess(`Graded ${res.data.student_name} successfully!`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to grade submission.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Assignment not found.</Alert>
      </Container>
    );
  }

  const isPastDue = new Date(assignment.due_date) < new Date();
  const isTeacher = user.role === 'teacher' || user.role === 'admin';

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/courses/${courseId}`)}
        sx={{ mb: 2, color: '#90caf9' }}
      >
        Back to Course
      </Button>

      {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" role="alert" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Assignment Header */}
      <Paper elevation={0} sx={{
        overflow: 'hidden', position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.06)', mb: 3,
      }}>
        <Box sx={{
          height: { xs: 120, sm: 150 },
          backgroundImage: `
            linear-gradient(135deg, rgba(26, 35, 126, 0.85) 0%, rgba(245, 124, 0, 0.75) 100%),
            url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=80')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
          p: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AssignmentIcon sx={{ fontSize: 32, color: '#fff' }} />
            <Typography variant="h4" component="h1" sx={{
              color: '#fff', fontWeight: 700,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}>
              {assignment.title}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<CalendarIcon sx={{ color: isPastDue ? '#ef5350 !important' : '#66bb6a !important' }} />}
              label={`Due: ${new Date(assignment.due_date).toLocaleString()}`}
              sx={{
                backgroundColor: isPastDue ? 'rgba(239, 83, 80, 0.1)' : 'rgba(102, 187, 106, 0.1)',
                color: isPastDue ? '#ef9a9a' : '#a5d6a7',
                border: `1px solid ${isPastDue ? 'rgba(239, 83, 80, 0.2)' : 'rgba(102, 187, 106, 0.2)'}`,
              }}
            />
            <Chip
              icon={<GradeIcon sx={{ color: '#f57c00 !important' }} />}
              label={`${assignment.max_points} points`}
              sx={{
                backgroundColor: 'rgba(245, 124, 0, 0.1)',
                color: '#ffb74d',
                border: '1px solid rgba(245, 124, 0, 0.2)',
              }}
            />
            {isTeacher && (
              <Chip
                label={`${assignment.submission_count} submission${assignment.submission_count !== 1 ? 's' : ''}`}
                sx={{
                  backgroundColor: 'rgba(171, 71, 188, 0.1)',
                  color: '#ce93d8',
                  border: '1px solid rgba(171, 71, 188, 0.2)',
                }}
              />
            )}
          </Box>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#c5cae9' }}>
            {assignment.description}
          </Typography>
        </Box>
      </Paper>

      {/* Student: Submission Form or Submitted State */}
      {user.role === 'student' && (
        <Paper elevation={0} sx={{
          p: 3, borderRadius: 3, mb: 3,
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
            Your Submission
          </Typography>

          {hasSubmitted ? (
            <Box>
              <Alert
                severity={mySubmission?.status === 'graded' ? 'success' : 'info'}
                icon={mySubmission?.status === 'graded' ? <CheckIcon /> : <PendingIcon />}
                sx={{ mb: 2 }}
              >
                {mySubmission?.status === 'graded'
                  ? `Graded: ${mySubmission.grade}/${assignment.max_points} points`
                  : 'Submitted - awaiting grade'}
              </Alert>
              {mySubmission?.content && (
                <>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Your answer:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.03)', mb: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {mySubmission.content}
                    </Typography>
                  </Paper>
                </>
              )}
              {mySubmission?.file_url && (
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  href={mySubmission.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mb: 2 }}
                >
                  Download Attached File
                </Button>
              )}
              {mySubmission?.feedback && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Teacher feedback:
                  </Typography>
                  <Paper variant="outlined" sx={{
                    p: 2,
                    backgroundColor: 'rgba(102, 187, 106, 0.05)',
                    borderColor: 'rgba(102, 187, 106, 0.2)',
                  }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {mySubmission.feedback}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              <TextField
                multiline
                rows={6}
                fullWidth
                placeholder="Write your answer here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  sx={{ color: '#90caf9', borderColor: 'rgba(144, 202, 249, 0.3)' }}
                >
                  {file ? file.name : 'Attach File'}
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setFile(e.target.files[0] || null)}
                  />
                </Button>
                {file && (
                  <Chip
                    label={`${(file.size / 1024).toFixed(0)} KB`}
                    size="small"
                    onDelete={() => setFile(null)}
                    sx={{ color: '#a5d6a7' }}
                  />
                )}
              </Box>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleSubmit}
                disabled={submitting || (!content.trim() && !file)}
                sx={{
                  background: 'linear-gradient(135deg, #f57c00, #ff9800)',
                  '&:hover': { background: 'linear-gradient(135deg, #e65100, #f57c00)' },
                }}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Teacher: Submissions Table with Grading */}
      {isTeacher && (
        <Paper elevation={0} sx={{
          p: 3, borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
            Student Submissions ({submissions.length})
          </Typography>

          {submissions.length === 0 ? (
            <Typography color="text.secondary">No submissions yet.</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Content</TableCell>
                    <TableCell>File</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.student_name}</TableCell>
                      <TableCell>
                        {new Date(sub.submitted_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={sub.status}
                          color={sub.status === 'graded' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" noWrap>
                          {sub.content || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {sub.file_url ? (
                          <Button
                            size="small"
                            startIcon={<DownloadIcon />}
                            href={sub.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download
                          </Button>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        {sub.status === 'graded' ? (
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {sub.grade}/{assignment.max_points}
                          </Typography>
                        ) : (
                          <TextField
                            type="number"
                            size="small"
                            placeholder="0"
                            inputProps={{ min: 0, max: assignment.max_points }}
                            value={grading[sub.id]?.grade ?? ''}
                            onChange={(e) => setGrading((prev) => ({
                              ...prev,
                              [sub.id]: { ...prev[sub.id], grade: e.target.value },
                            }))}
                            sx={{ width: 80 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {sub.status !== 'graded' && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <TextField
                              size="small"
                              placeholder="Feedback (optional)"
                              value={grading[sub.id]?.feedback ?? ''}
                              onChange={(e) => setGrading((prev) => ({
                                ...prev,
                                [sub.id]: { ...prev[sub.id], feedback: e.target.value },
                              }))}
                              sx={{ minWidth: 150 }}
                            />
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleGrade(sub.id)}
                              disabled={!grading[sub.id]?.grade && grading[sub.id]?.grade !== 0}
                              sx={{
                                background: 'linear-gradient(135deg, #66bb6a, #43a047)',
                                '&:hover': { background: 'linear-gradient(135deg, #43a047, #2e7d32)' },
                              }}
                            >
                              Grade
                            </Button>
                          </Box>
                        )}
                        {sub.status === 'graded' && sub.feedback && (
                          <Typography variant="caption" color="text.secondary">
                            {sub.feedback}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Container>
  );
}

export default AssignmentDetail;
