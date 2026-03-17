import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Drawer,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Chip, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon, School as SchoolIcon, Dashboard as DashboardIcon,
  Login as LoginIcon, PersonAdd as PersonAddIcon, Logout as LogoutIcon,
  People as PeopleIcon, LibraryBooks as LibraryBooksIcon,
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
    { label: 'Courses', path: '/courses', icon: <LibraryBooksIcon /> },
    ...(user.role === 'admin' ? [{ label: 'Users', path: '/admin/users', icon: <PeopleIcon /> }] : []),
  ] : [
    { label: 'Login', path: '/login', icon: <LoginIcon /> },
    { label: 'Register', path: '/register', icon: <PersonAddIcon /> },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="navigation" onClick={() => setDrawerOpen(false)}>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={RouterLink} to={item.path}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {user && (
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="static">
      <Toolbar>
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

        <SchoolIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to={user ? getDashboardPath() : '/login'}
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          LMS
        </Typography>

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
                <Chip
                  label={`${user.username} (${user.role})`}
                  color="secondary"
                  size="small"
                  sx={{ ml: 1 }}
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
