import { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

const ThemeContext = createContext(null);

// Shared theme settings
const sharedSettings = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
};

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 8,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        backgroundImage: 'none',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { fontWeight: 500 },
    },
  },
};

function createDarkTheme() {
  return createTheme({
    ...sharedSettings,
    palette: {
      mode: 'dark',
      primary: { main: '#42a5f5', dark: '#1565c0', light: '#90caf9' },
      secondary: { main: '#ab47bc', light: '#ce93d8', dark: '#7b1fa2' },
      warning: { main: '#f57c00', light: '#ffb74d' },
      background: { default: '#0a0e1a', paper: '#131829' },
      text: { primary: '#e8eaf6', secondary: '#9fa8da' },
    },
    components: {
      ...sharedComponents,
      MuiButton: {
        styleOverrides: {
          ...sharedComponents.MuiButton.styleOverrides,
          containedPrimary: {
            background: 'linear-gradient(135deg, #1565c0 0%, #7b1fa2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
            },
          },
          outlinedPrimary: {
            borderColor: 'rgba(66, 165, 245, 0.5)',
            '&:hover': {
              borderColor: '#42a5f5',
              backgroundColor: 'rgba(66, 165, 245, 0.08)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            ...sharedComponents.MuiCard.styleOverrides.root,
            backgroundColor: '#131829',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            '&:hover': {
              ...sharedComponents.MuiCard.styleOverrides.root['&:hover'],
              boxShadow: '0 8px 32px rgba(21, 101, 192, 0.2)',
              borderColor: 'rgba(66, 165, 245, 0.3)',
            },
          },
        },
      },
      MuiPaper: sharedComponents.MuiPaper,
      MuiChip: sharedComponents.MuiChip,
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(135deg, #0d1b3e 0%, #1a237e 50%, #4a148c 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: '#0d1b3e',
              color: '#90caf9',
              fontWeight: 700,
              borderBottom: '2px solid rgba(66, 165, 245, 0.3)',
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root:hover': {
              backgroundColor: 'rgba(66, 165, 245, 0.04)',
            },
            '& .MuiTableCell-root': {
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            },
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            backgroundColor: '#131829',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: '#1a2035',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
              '&:hover fieldset': { borderColor: 'rgba(66, 165, 245, 0.5)' },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.15)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(66, 165, 245, 0.5)' },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#131829',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
  });
}

function createLightTheme() {
  return createTheme({
    ...sharedSettings,
    palette: {
      mode: 'light',
      primary: { main: '#1565c0', dark: '#0d47a1', light: '#42a5f5' },
      secondary: { main: '#7b1fa2', light: '#ab47bc', dark: '#4a148c' },
      warning: { main: '#e65100', light: '#f57c00' },
      background: { default: '#f5f7fa', paper: '#ffffff' },
      text: { primary: '#1a237e', secondary: '#455a64' },
    },
    components: {
      ...sharedComponents,
      MuiButton: {
        styleOverrides: {
          ...sharedComponents.MuiButton.styleOverrides,
          containedPrimary: {
            background: 'linear-gradient(135deg, #1565c0 0%, #7b1fa2 100%)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            ...sharedComponents.MuiCard.styleOverrides.root,
            border: '1px solid rgba(0, 0, 0, 0.08)',
            '&:hover': {
              ...sharedComponents.MuiCard.styleOverrides.root['&:hover'],
              boxShadow: '0 8px 32px rgba(21, 101, 192, 0.12)',
              borderColor: 'rgba(21, 101, 192, 0.3)',
            },
          },
        },
      },
      MuiPaper: sharedComponents.MuiPaper,
      MuiChip: sharedComponents.MuiChip,
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(135deg, #1565c0 0%, #1a237e 50%, #7b1fa2 100%)',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: '#e8eaf6',
              color: '#1a237e',
              fontWeight: 700,
              borderBottom: '2px solid #1565c0',
            },
          },
        },
      },
    },
  });
}

export function ThemeContextProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'dark';
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };

  const theme = useMemo(
    () => (mode === 'dark' ? createDarkTheme() : createLightTheme()),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeContextProvider');
  }
  return context;
}
