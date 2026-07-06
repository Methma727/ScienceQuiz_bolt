import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a1a2e',
      light: '#16213e',
      dark: '#0f0f1a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e94560',
      light: '#ff6b6b',
      dark: '#c73e54',
      contrastText: '#ffffff',
    },
    success: {
      main: '#00d9a5',
      light: '#33e8b7',
      dark: '#00ad84',
    },
    error: {
      main: '#e94560',
      light: '#ff6b80',
      dark: '#c73e54',
    },
    warning: {
      main: '#ffc107',
      light: '#ffcd38',
      dark: '#cc9a06',
    },
    info: {
      main: '#4a90a4',
      light: '#6db3c7',
      dark: '#3a7289',
    },
    background: {
      default: '#0f0f23',
      paper: '#1a1a2e',
    },
    text: {
      primary: '#eaeaea',
      secondary: '#a0a0a0',
      disabled: '#666666',
    },
    grey: {
      50: '#2a2a3e',
      100: '#252538',
      200: '#1f1f30',
      300: '#191928',
      400: '#14141f',
      500: '#0f0f18',
      600: '#0a0a12',
      700: '#05050a',
      800: '#030306',
      900: '#000000',
    },
    divider: '#2a2a3e',
    action: {
      active: '#e94560',
      hover: 'rgba(233, 69, 96, 0.08)',
      hoverOpacity: 0.08,
      selected: 'rgba(233, 69, 96, 0.12)',
      selectedOpacity: 0.12,
      disabled: '#4a4a5a',
      disabledOpacity: 0.38,
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
      focus: 'rgba(233, 69, 96, 0.12)',
      focusOpacity: 0.12,
      activatedOpacity: 0.12,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '3rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(233, 69, 96, 0.3)',
          },
        },
        outlined: {
          borderColor: '#2a2a3e',
          '&:hover': {
            borderColor: '#e94560',
            backgroundColor: 'rgba(233, 69, 96, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          borderRadius: 20,
          border: '1px solid #2a2a3e',
          backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#14141f',
            '& fieldset': {
              borderColor: '#2a2a3e',
            },
            '&:hover fieldset': {
              borderColor: '#3a3a5e',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#e94560',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#a0a0a0',
          },
          '& .MuiOutlinedInput-input': {
            color: '#eaeaea',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0f0f23',
          borderBottom: '1px solid #2a2a3e',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#e94560',
          height: 3,
          borderRadius: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '1rem',
          '&.Mui-selected': {
            color: '#e94560',
            fontWeight: 600,
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #2a2a3e',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#14141f',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: '#2a2a3e',
        },
        head: {
          fontWeight: 600,
          color: '#eaeaea',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(233, 69, 96, 0.04)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#14141f',
          borderRadius: 12,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(233, 69, 96, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(233, 69, 96, 0.12)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#1a1a2e',
          border: '1px solid #2a2a3e',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#e94560',
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#e94560',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: '#2a2a3e',
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
  },
});

export default theme;
