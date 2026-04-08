import { useState, useEffect } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import {
  Container, Typography, Grid, Box, CircularProgress, Paper, Chip,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon, Star as StarIcon,
  School as SchoolIcon, AutoStories as AutoStoriesIcon,
  Rocket as RocketIcon, Favorite as FavoriteIcon,
  WorkspacePremium as BadgeIcon, LocalFireDepartment as FireIcon,
  Visibility as ViewIcon, ThumbUp as ThumbUpIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Grading as GradingIcon,
} from '@mui/icons-material';
import api, { getResults } from '../api/axiosConfig';
import { useAuth } from '../contexts/AuthContext';

// Map icon name strings from the API to actual MUI components
const ICON_MAP = {
  RocketIcon,
  BadgeIcon,
  SchoolIcon,
  AutoStoriesIcon,
  StarIcon,
  FavoriteIcon,
  FireIcon,
  ViewIcon,
  ThumbUpIcon,
  AssignmentTurnedInIcon,
  GradingIcon,
};

function Achievements() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allDefinitions, setAllDefinitions] = useState([]);
  const [earnedKeys, setEarnedKeys] = useState(new Set());

  useDocumentTitle('Achievements');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Trigger a check first so any new achievements get awarded
        await api.post('achievements/check/');

        // Then fetch all definitions and user's earned achievements
        const [defsRes, earnedRes] = await Promise.all([
          api.get('achievements/'),
          api.get('achievements/me/'),
        ]);

        const defs = getResults(defsRes.data);
        const earned = getResults(earnedRes.data);

        setAllDefinitions(defs);
        setEarnedKeys(new Set(earned.map((ua) => ua.achievement.key)));
      } catch {
        // Fallback: definitions remain empty
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter to role-appropriate achievements
  const applicableAchievements = allDefinitions.filter((a) => {
    if (a.category === 'student' && user.role !== 'student') return false;
    if (a.category === 'teacher' && user.role !== 'teacher') return false;
    return true;
  });

  const unlockedAchievements = applicableAchievements.filter((a) => earnedKeys.has(a.key));
  const lockedAchievements = applicableAchievements.filter((a) => !earnedKeys.has(a.key));
  const totalApplicable = applicableAchievements.length;
  const progressPercent = totalApplicable > 0
    ? Math.round((unlockedAchievements.length / totalApplicable) * 100) : 0;

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
          <Typography variant="subtitle1" component="p" sx={{ opacity: 0.85, mb: 2 }}>
            Track your milestones and celebrate your progress!
          </Typography>
          <Chip
            icon={<StarIcon sx={{ color: '#ffd54f !important' }} />}
            label={`${unlockedAchievements.length} / ${totalApplicable} Unlocked`}
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
            {progressPercent}%
          </Typography>
        </Box>
        <Box sx={{
          width: '100%', height: 10, borderRadius: 5,
          backgroundColor: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <Box sx={{
            width: `${progressPercent}%`,
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
          const Icon = ICON_MAP[achievement.icon] || TrophyIcon;
          return (
            <Grid item xs={12} sm={6} md={4} key={achievement.key}>
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
                    <Typography variant="subtitle1" component="p" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                      {achievement.name}
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
              const Icon = ICON_MAP[achievement.icon] || TrophyIcon;
              return (
                <Grid item xs={12} sm={6} md={4} key={achievement.key}>
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
                        <Typography variant="subtitle1" component="p" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          {achievement.name}
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
