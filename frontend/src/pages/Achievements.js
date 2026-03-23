import { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Box, CircularProgress, Paper, Chip,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon, Star as StarIcon,
  School as SchoolIcon, AutoStories as AutoStoriesIcon,
  Rocket as RocketIcon, Favorite as FavoriteIcon,
  WorkspacePremium as BadgeIcon, LocalFireDepartment as FireIcon,
  Visibility as ViewIcon, ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import api, { getResults } from '../api/axiosConfig';
import { useAuth } from '../contexts/AuthContext';

// Achievement definitions
const achievementDefs = [
  {
    id: 'first_login',
    title: 'Welcome Aboard!',
    description: 'Logged into LearnHub for the first time',
    icon: RocketIcon,
    color: '#42a5f5',
    check: () => true, // Everyone who's logged in has this
  },
  {
    id: 'profile_complete',
    title: 'Identity Established',
    description: 'Complete your profile with a bio',
    icon: BadgeIcon,
    color: '#ab47bc',
    check: (_, user) => user?.bio && user.bio.trim().length > 0,
  },
  {
    id: 'first_enrollment',
    title: 'First Steps',
    description: 'Enrol in your first course',
    icon: SchoolIcon,
    color: '#66bb6a',
    check: (data) => data.enrollmentCount >= 1,
    studentOnly: true,
  },
  {
    id: 'three_courses',
    title: 'Knowledge Seeker',
    description: 'Enrol in 3 or more courses',
    icon: AutoStoriesIcon,
    color: '#f57c00',
    check: (data) => data.enrollmentCount >= 3,
    studentOnly: true,
  },
  {
    id: 'five_courses',
    title: 'Lifelong Learner',
    description: 'Enrol in 5 or more courses',
    icon: StarIcon,
    color: '#ffd54f',
    check: (data) => data.enrollmentCount >= 5,
    studentOnly: true,
  },
  {
    id: 'course_creator',
    title: 'Course Creator',
    description: 'Create your first course',
    icon: AutoStoriesIcon,
    color: '#66bb6a',
    check: (data) => data.courseCount >= 1,
    teacherOnly: true,
  },
  {
    id: 'popular_teacher',
    title: 'Popular Teacher',
    description: 'Have 5 or more students enrolled across your courses',
    icon: FavoriteIcon,
    color: '#ef5350',
    check: (data) => data.totalStudents >= 5,
    teacherOnly: true,
  },
  {
    id: 'prolific_teacher',
    title: 'Prolific Educator',
    description: 'Create 3 or more courses',
    icon: FireIcon,
    color: '#ff7043',
    check: (data) => data.courseCount >= 3,
    teacherOnly: true,
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Browse the course catalogue',
    icon: ViewIcon,
    color: '#26c6da',
    check: () => true, // Assume they've explored if they're here
  },
  {
    id: 'community_member',
    title: 'Community Member',
    description: 'Be part of the LearnHub community',
    icon: ThumbUpIcon,
    color: '#ab47bc',
    check: () => true,
  },
];

function Achievements() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ enrollmentCount: 0, courseCount: 0, totalStudents: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user.role === 'student') {
          const res = await api.get('enrollments/');
          const enrollments = getResults(res.data);
          setStats({ enrollmentCount: enrollments.length, courseCount: 0, totalStudents: 0 });
        } else if (user.role === 'teacher') {
          const res = await api.get('courses/');
          const courses = getResults(res.data).filter((c) => c.teacher === user.id);
          const totalStudents = courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0);
          setStats({ enrollmentCount: 0, courseCount: courses.length, totalStudents });
        }
      } catch {
        // Stats will remain at defaults
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.id, user.role]);

  const applicableAchievements = achievementDefs.filter((a) => {
    if (a.studentOnly && user.role !== 'student') return false;
    if (a.teacherOnly && user.role !== 'teacher') return false;
    return true;
  });

  const unlockedAchievements = applicableAchievements.filter((a) => a.check(stats, user));
  const lockedAchievements = applicableAchievements.filter((a) => !a.check(stats, user));

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
          linear-gradient(135deg, rgba(26, 35, 126, 0.92) 0%, rgba(245, 124, 0, 0.85) 100%),
          url('https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&w=1400&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1.5 }}>
            <TrophyIcon sx={{ fontSize: 36 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>Achievements</Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ opacity: 0.85, mb: 2 }}>
            Track your milestones and celebrate your progress!
          </Typography>
          <Chip
            icon={<StarIcon sx={{ color: '#ffd54f !important' }} />}
            label={`${unlockedAchievements.length} / ${applicableAchievements.length} Unlocked`}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(8px)',
            }}
          />
        </Box>
      </Paper>

      {/* Progress Bar */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Overall Progress</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#f57c00' }}>
            {Math.round((unlockedAchievements.length / applicableAchievements.length) * 100)}%
          </Typography>
        </Box>
        <Box sx={{
          width: '100%', height: 10, borderRadius: 5,
          backgroundColor: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <Box sx={{
            width: `${(unlockedAchievements.length / applicableAchievements.length) * 100}%`,
            height: '100%', borderRadius: 5,
            background: 'linear-gradient(135deg, #42a5f5, #ab47bc, #f57c00)',
            transition: 'width 0.8s ease-in-out',
          }} />
        </Box>
      </Paper>

      {/* Unlocked */}
      <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
        <StarIcon sx={{ verticalAlign: 'middle', mr: 1, color: '#ffd54f' }} />
        Unlocked
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {unlockedAchievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={achievement.id}>
              <Paper elevation={0} sx={{
                p: 3, borderRadius: 3, height: '100%',
                border: `1px solid ${achievement.color}40`,
                background: `linear-gradient(135deg, ${achievement.color}15, ${achievement.color}08)`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px ${achievement.color}30`,
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${achievement.color}, ${achievement.color}cc)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 12px ${achievement.color}40`,
                  }}>
                    <Icon sx={{ color: '#fff', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {achievement.title}
                    </Typography>
                    <Chip label="Unlocked" size="small" sx={{
                      backgroundColor: `${achievement.color}25`,
                      color: achievement.color,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 20,
                    }} />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {achievement.description}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Locked */}
      {lockedAchievements.length > 0 && (
        <>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600, opacity: 0.75 }}>
            <BadgeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Locked
          </Typography>
          <Grid container spacing={2}>
            {lockedAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                  <Paper elevation={0} sx={{
                    p: 3, borderRadius: 3, height: '100%',
                    border: '1px solid rgba(255,255,255,0.06)',
                    opacity: 0.65,
                    filter: 'grayscale(0.5)',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                      <Box sx={{
                        width: 48, height: 48, borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          {achievement.title}
                        </Typography>
                        <Chip label="Locked" size="small" sx={{
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          color: 'rgba(255,255,255,0.7)',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 20,
                        }} />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {achievement.description}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
    </Container>
  );
}

export default Achievements;
