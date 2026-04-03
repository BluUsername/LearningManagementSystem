import { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Box, CircularProgress, Alert, Paper, Avatar,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  MilitaryTech as MedalIcon,
  Star as StarIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  AutoStories as AutoStoriesIcon,
  WorkspacePremium as PremiumIcon,
} from '@mui/icons-material';
import api, { getResults } from '../api/axiosConfig';

// Medal colours for top 3 positions
const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']; // gold, silver, bronze

function Leaderboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'Leaderboard | LearnHub'; }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('courses/');
        setCourses(getResults(res.data));
      } catch {
        setError('Failed to load leaderboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Compute leaderboard data
  const topCourses = [...courses]
    .sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0))
    .slice(0, 5);

  const teacherMap = {};
  courses.forEach((course) => {
    const name = course.teacher_name || 'Unknown';
    if (!teacherMap[name]) {
      teacherMap[name] = { name, totalStudents: 0, courseCount: 0 };
    }
    teacherMap[name].totalStudents += course.enrollment_count || 0;
    teacherMap[name].courseCount += 1;
  });
  const topTeachers = Object.values(teacherMap)
    .sort((a, b) => b.totalStudents - a.totalStudents)
    .slice(0, 5);

  const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0);
  const totalCourses = courses.length;

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
          linear-gradient(135deg, rgba(26, 35, 126, 0.92) 0%, rgba(123, 31, 162, 0.88) 50%, rgba(245, 124, 0, 0.85) 100%),
          url('https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=1400&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <TrophyIcon sx={{ fontSize: 40, color: '#FFD700' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Leaderboard
            </Typography>
          </Box>
          <Typography variant="subtitle1" component="p" sx={{ opacity: 0.85, mb: 3 }}>
            See who is leading the way on LearnHub — top courses & top teachers!
          </Typography>

          {/* Fun Stats */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2,
              px: 2, py: 1, backdropFilter: 'blur(8px)',
            }}>
              <AutoStoriesIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {totalCourses} Course{totalCourses !== 1 ? 's' : ''} Available
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2,
              px: 2, py: 1, backdropFilter: 'blur(8px)',
            }}>
              <PeopleIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {totalEnrollments} Total Enrolment{totalEnrollments !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2,
              px: 2, py: 1, backdropFilter: 'blur(8px)',
            }}>
              <StarIcon sx={{ fontSize: 20, color: '#FFD700' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {Object.keys(teacherMap).length} Teacher{Object.keys(teacherMap).length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Most Popular Courses */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <TrophyIcon sx={{ fontSize: 28, color: '#FFD700' }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              Most Popular Courses
            </Typography>
          </Box>

          {topCourses.length === 0 ? (
            <Paper elevation={0} sx={{
              p: 4, textAlign: 'center', borderRadius: 3,
              border: '1px dashed rgba(66, 165, 245, 0.3)',
              background: 'rgba(66, 165, 245, 0.03)',
            }}>
              <Typography color="text.secondary">No courses yet. Check back soon!</Typography>
            </Paper>
          ) : (
            topCourses.map((course, index) => (
              <Paper key={course.id} elevation={0} sx={{
                p: 2.5, mb: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2,
                background: index < 3
                  ? `linear-gradient(135deg, rgba(${index === 0 ? '255,215,0' : index === 1 ? '192,192,192' : '205,127,50'},0.08) 0%, rgba(26,35,126,0.12) 100%)`
                  : 'rgba(255,255,255,0.04)',
                border: index < 3
                  ? `1px solid ${MEDAL_COLORS[index]}33`
                  : '1px solid rgba(255,255,255,0.08)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px rgba(0,0,0,0.3)`,
                },
              }}>
                {/* Rank Badge */}
                <Avatar sx={{
                  width: 48, height: 48,
                  bgcolor: index < 3 ? MEDAL_COLORS[index] : 'rgba(255,255,255,0.1)',
                  color: index < 3 ? '#1a1a2e' : 'rgba(255,255,255,0.7)',
                  fontWeight: 800, fontSize: 18,
                }}>
                  {index < 3 ? (
                    <MedalIcon sx={{ fontSize: 28 }} />
                  ) : (
                    `#${index + 1}`
                  )}
                </Avatar>

                {/* Course Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" component="p" sx={{
                    fontWeight: 700, lineHeight: 1.3,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {course.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                    by {course.teacher_name || 'Unknown'}
                  </Typography>
                </Box>

                {/* Enrollment Count */}
                <Box sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  backgroundColor: 'rgba(245,124,0,0.15)', borderRadius: 2,
                  px: 2, py: 1, minWidth: 70,
                }}>
                  <Typography variant="h6" component="p" sx={{
                    fontWeight: 800, color: '#ff9800', lineHeight: 1,
                  }}>
                    {course.enrollment_count || 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                    students
                  </Typography>
                </Box>
              </Paper>
            ))
          )}
        </Grid>

        {/* Top Teachers */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <SchoolIcon sx={{ fontSize: 28, color: '#ce93d8' }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              Top Teachers
            </Typography>
          </Box>

          {topTeachers.length === 0 ? (
            <Paper elevation={0} sx={{
              p: 4, textAlign: 'center', borderRadius: 3,
              border: '1px dashed rgba(66, 165, 245, 0.3)',
              background: 'rgba(66, 165, 245, 0.03)',
            }}>
              <Typography color="text.secondary">No teachers yet. Check back soon!</Typography>
            </Paper>
          ) : (
            topTeachers.map((teacher, index) => (
              <Paper key={teacher.name} elevation={0} sx={{
                p: 2.5, mb: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2,
                background: index < 3
                  ? `linear-gradient(135deg, rgba(${index === 0 ? '255,215,0' : index === 1 ? '192,192,192' : '205,127,50'},0.08) 0%, rgba(123,31,162,0.12) 100%)`
                  : 'rgba(255,255,255,0.04)',
                border: index < 3
                  ? `1px solid ${MEDAL_COLORS[index]}33`
                  : '1px solid rgba(255,255,255,0.08)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                },
              }}>
                {/* Rank Badge */}
                <Avatar sx={{
                  width: 48, height: 48,
                  bgcolor: index < 3 ? MEDAL_COLORS[index] : 'rgba(255,255,255,0.1)',
                  color: index < 3 ? '#1a1a2e' : 'rgba(255,255,255,0.7)',
                  fontWeight: 800, fontSize: 18,
                }}>
                  {index < 3 ? (
                    <PremiumIcon sx={{ fontSize: 28 }} />
                  ) : (
                    `#${index + 1}`
                  )}
                </Avatar>

                {/* Teacher Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" component="p" sx={{
                    fontWeight: 700, lineHeight: 1.3,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {teacher.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                    {teacher.courseCount} course{teacher.courseCount !== 1 ? 's' : ''} published
                  </Typography>
                </Box>

                {/* Student Count */}
                <Box sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  backgroundColor: 'rgba(156,39,176,0.15)', borderRadius: 2,
                  px: 2, py: 1, minWidth: 70,
                }}>
                  <Typography variant="h6" component="p" sx={{
                    fontWeight: 800, color: '#ce93d8', lineHeight: 1,
                  }}>
                    {teacher.totalStudents}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                    students
                  </Typography>
                </Box>
              </Paper>
            ))
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default Leaderboard;
