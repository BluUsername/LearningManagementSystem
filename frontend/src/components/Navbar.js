import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Drawer,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Chip, useMediaQuery, useTheme, Badge, Tooltip, Divider,
} from '@mui/material';
import {
  Menu as MenuIcon, School as SchoolIcon, Dashboard as DashboardIcon,
  Login as LoginIcon, PersonAdd as PersonAddIcon, Logout as LogoutIcon,
  People as PeopleIcon, LibraryBooks as LibraryBooksIcon,
  Leaderboard as LeaderboardIcon, EmojiEvents as EmojiEventsIcon,
  Info as InfoIcon, HelpOutline as HelpOutlineIcon,
  Settings as SettingsIcon, Notifications as NotificationsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'student': return '/student';
      case 'teacher': return '/teacher';
      case 'admin': return '/admin';
      default: return '/login';
    }
  };

  const navItems = user ? [
    { label: 'Dashboard', path: getDashboardPath(), icon: <DashboardIcon /> },
    { label: 'All Courses', path: '/courses', icon: <LibraryBooksIcon /> },
    { label: 'Leaderboard', path: '/leaderboard', icon: <LeaderboardIcon /> },
    { label: 'Achievements', path: '/achievements', icon: <EmojiEventsIcon /> },
    ...(user.role === 'admin' ? [{ label: 'Users', path: '/admin/users', icon: <PeopleIcon /> }] : []),
  ] : [
    { label: 'Login', path: '/login', icon: <LoginIcon /> },
    { label: 'Register', path: '/register', icon: <PersonAddIcon /> },
    { label: 'About', path: '/about', icon: <InfoIcon /> },
  ];

  const drawer = (
    <Box sx={{ width: 270 }} role="navigation" onClick={() => setDrawerOpen(false)}>
      {/* Drawer Header */}
      <Box sx={{
        p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5,
        background: 'linear-gradient(135deg, rgba(21, 101, 192, 0.15), rgba(123, 31, 162, 0.1))',
      }}>
        <SchoolIcon sx={{ fontSize: 28, color: '#42a5f5' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>LearnHub</Typography>
      </Box>
      {user && (
        <Box sx={{ px: 2.5, py: 1.5 }}>
          <Chip
            label={`${user.username} (${user.role})`}
            size="small"
            sx={{
              backgroundColor: 'rgba(66, 165, 245, 0.15)',
              color: '#90caf9',
              fontWeight: 600,
              border: '1px solid rgba(66, 165, 245, 0.25)',
            }}
          />
        </Box>
      )}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Main Navigation */}
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={RouterLink} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {user && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <List>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/profile">
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="My Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/help">
                <ListItemIcon><HelpOutlineIcon /></ListItemIcon>
                <ListItemText primary="Help & FAQ" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/settings">
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/about">
                <ListItemIcon><InfoIcon /></ListItemIcon>
                <ListItemText primary="About" />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={0} sx={{ boxShadow: '0 2px 20px rgba(0, 0, 0, 0.4)' }}>
      <Toolbar sx={{ py: 0.5 }}>
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            aria-label="open navigation menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <SchoolIcon sx={{ mr: 1, fontSize: 28 }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to={user ? getDashboardPath() : '/login'}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 700,
            letterSpacing: '0.5px',
            mr: 1,
          }}
        >
          LearnHub
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {!isMobile && (
          <Box component="nav" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                component={RouterLink}
                to={item.path}
                startIcon={item.icon}
              >
                {item.label}
              </Button>
            ))}
            {user && (
              <>
                <Tooltip title="Notifications">
                  <IconButton color="inherit" sx={{ ml: 0.5 }}>
                    <Badge badgeContent={3} color="error" max={9}>
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Tooltip title="My Profile">
                  <IconButton color="inherit" component={RouterLink} to="/profile">
                    <PersonIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Help & FAQ">
                  <IconButton color="inherit" component={RouterLink} to="/help">
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Settings">
                  <IconButton color="inherit" component={RouterLink} to="/settings">
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
                <Chip
                  label={`${user.username} (${user.role})`}
                  size="small"
                  sx={{
                    ml: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    fontWeight: 600,
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                />
                <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                  Logout
                </Button>
              </>
            )}
          </Box>
        )}

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          {drawer}
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
