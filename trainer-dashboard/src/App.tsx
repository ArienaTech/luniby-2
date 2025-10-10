import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  useMediaQuery
} from '@mui/material';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Overview from './components/Dashboard/Overview';
import ClientManagement from './components/Clients/ClientManagement';
import Calendar from './components/Schedule/Calendar';
import TrainingSessions from './components/Sessions/TrainingSessions';
import Analytics from './components/Analytics/Analytics';
import InvoiceManagement from './components/Invoices/InvoiceManagement';
import Messages from './components/Messages/Messages';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

const getPageTitle = (activeTab: string): string => {
  switch (activeTab) {
    case 'dashboard': return 'Dashboard';
    case 'clients': return 'Client Management';
    case 'pets': return 'Pet Profiles';
    case 'schedule': return 'Schedule & Calendar';
    case 'sessions': return 'Training Sessions';
    case 'messages': return 'Messages';
    case 'invoices': return 'Invoices & Billing';
    case 'analytics': return 'Analytics & Reports';
    case 'settings': return 'Settings';
    default: return 'Pet Trainer Dashboard';
  }
};

const renderPageContent = (activeTab: string): React.ReactNode => {
  switch (activeTab) {
    case 'dashboard':
      return <Overview />;
    case 'clients':
      return <ClientManagement />;
    case 'pets':
      return (
        <Box sx={{ p: 3 }}>
          <h2>Pet Profiles - Coming Soon</h2>
          <p>This section will contain detailed pet profiles and management tools.</p>
        </Box>
      );
    case 'schedule':
      return <Calendar />;
    case 'sessions':
      return <TrainingSessions />;
    case 'messages':
      return <Messages />;
    case 'invoices':
      return <InvoiceManagement />;
    case 'analytics':
      return <Analytics />;
    case 'settings':
      return (
        <Box sx={{ p: 3 }}>
          <h2>Settings - Coming Soon</h2>
          <p>This section will contain application settings and preferences.</p>
        </Box>
      );
    default:
      return <Overview />;
  }
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Header 
          onMenuClick={handleMenuClick} 
          title={getPageTitle(activeTab)}
        />
        
        <Sidebar
          open={sidebarOpen}
          onClose={handleSidebarClose}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: '64px', // Height of the AppBar
            ml: isMobile ? 0 : (sidebarOpen ? '280px' : 0),
            transition: theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            backgroundColor: 'background.default',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {renderPageContent(activeTab)}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;