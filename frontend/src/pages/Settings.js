import { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Paper, Switch, Divider, Snackbar, Alert,
  FormControlLabel, Grid,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Speed as PerformanceIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../contexts/ThemeContext';

const SETTINGS_KEY = 'learnhub_settings';

const defaultSettings = {
  emailNewCourses: true,
  enrolmentConfirmation: true,
  weeklyDigest: false,
  showOnLeaderboard: true,
  teacherSeeEnrolment: true,
  use24Hour: false,
  ddmmyyyy: true,
  animations: true,
  lazyLoading: true,
};

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function Settings() {
  const { mode, toggleTheme } = useThemeMode();
  const [settings, setSettings] = useState(loadSettings);
  const [toast, setToast] = useState('');

  useEffect(() => { document.title = 'Settings | LearnHub'; }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleToggle = useCallback((key, label) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setToast(`${label} ${settings[key] ? 'disabled' : 'enabled'}`);
  }, [settings]);

  const settingsSections = [
    {
      title: 'Notifications',
      icon: NotificationsIcon,
      color: '#f57c00',
      settings: [
        { key: 'emailNewCourses', label: 'Email notifications for new courses' },
        { key: 'enrolmentConfirmation', label: 'Enrolment confirmation emails' },
        { key: 'weeklyDigest', label: 'Weekly learning digest' },
      ],
    },
    {
      title: 'Privacy & Security',
      icon: SecurityIcon,
      color: '#66bb6a',
      settings: [
        { key: 'showOnLeaderboard', label: 'Show my profile on the leaderboard' },
        { key: 'teacherSeeEnrolment', label: 'Allow teachers to see my enrolment status' },
      ],
    },
    {
      title: 'Language & Region',
      icon: LanguageIcon,
      color: '#ab47bc',
      settings: [
        { key: 'use24Hour', label: 'Use 24-hour time format' },
        { key: 'ddmmyyyy', label: 'Show dates in DD/MM/YYYY format' },
      ],
    },
    {
      title: 'Performance',
      icon: PerformanceIcon,
      color: '#42a5f5',
      settings: [
        { key: 'animations', label: 'Enable animations and transitions' },
        { key: 'lazyLoading', label: 'Load images on scroll (lazy loading)' },
      ],
    },
  ];

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      {/* Hero Banner */}
      <Paper elevation={0} sx={{
        p: 4, mb: 4, borderRadius: 3, position: 'relative', overflow: 'hidden',
        backgroundImage: `
          linear-gradient(135deg, rgba(26, 35, 126, 0.92) 0%, rgba(21, 101, 192, 0.85) 50%, rgba(171, 71, 188, 0.8) 100%),
          url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
      }}>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1.5 }}>
            <SettingsIcon sx={{ fontSize: 36 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Settings
            </Typography>
          </Box>
          <Typography variant="subtitle1" component="p" sx={{ opacity: 0.85 }}>
            Customise your LearnHub experience.
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Appearance — functional toggle */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{
            p: 3, borderRadius: 3, height: '100%',
            background: 'linear-gradient(135deg, rgba(21, 101, 192, 0.08) 0%, rgba(123, 31, 162, 0.06) 100%)',
            border: '1px solid rgba(66, 165, 245, 0.15)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <PaletteIcon sx={{ color: '#42a5f5' }} />
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>Appearance</Typography>
            </Box>
            <Divider sx={{ mb: 2.5, borderColor: 'rgba(66, 165, 245, 0.12)' }} />

            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              p: 2, borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              mb: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {mode === 'dark' ? (
                  <DarkModeIcon sx={{ color: '#ab47bc' }} />
                ) : (
                  <LightModeIcon sx={{ color: '#f57c00' }} />
                )}
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Dark Mode
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Currently using {mode} theme
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={mode === 'dark'}
                onChange={toggleTheme}
                inputProps={{ 'aria-label': 'Toggle dark mode' }}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#ab47bc' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#ab47bc' },
                }}
              />
            </Box>

            <Box sx={{
              p: 2, borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                Your theme preference is saved automatically and will be remembered next time you visit LearnHub.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Other settings sections */}
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Grid item xs={12} md={6} key={section.title}>
              <Paper elevation={0} sx={{
                p: 3, borderRadius: 3, height: '100%',
                background: `linear-gradient(135deg, ${section.color}12, ${section.color}06)`,
                border: `1px solid ${section.color}20`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Icon sx={{ color: section.color }} />
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>{section.title}</Typography>
                </Box>
                <Divider sx={{ mb: 2.5, borderColor: `${section.color}15` }} />

                {section.settings.map((setting) => (
                  <Box key={setting.key} sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    p: 1.5, borderRadius: 2, mb: 1,
                    backgroundColor: 'rgba(255,255,255,0.02)',
                  }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings[setting.key]}
                          onChange={() => handleToggle(setting.key, setting.label)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {setting.label}
                        </Typography>
                      }
                    />
                  </Box>
                ))}
              </Paper>
            </Grid>
          );
        })}

        {/* App Info */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{
            p: 3, borderRadius: 3, height: '100%',
            background: 'linear-gradient(135deg, rgba(245, 124, 0, 0.08) 0%, rgba(255, 152, 0, 0.04) 100%)',
            border: '1px solid rgba(245, 124, 0, 0.15)',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <InfoIcon sx={{ color: '#ff9800' }} />
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>About LearnHub</Typography>
            </Box>
            <Divider sx={{ mb: 2.5, borderColor: 'rgba(245, 124, 0, 0.12)' }} />

            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Frontend', value: 'React 19 + Material UI' },
              { label: 'Backend', value: 'Django + Django REST Framework' },
              { label: 'Authentication', value: 'Token-based (DRF)' },
            ].map((info) => (
              <Box key={info.label} sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                p: 1.5, borderRadius: 2, mb: 1,
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {info.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffb74d' }}>
                  {info.value}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={!!toast}
        autoHideDuration={2000}
        onClose={() => setToast('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast('')} severity="success" variant="filled" sx={{ width: '100%' }}>
          {toast}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Settings;
