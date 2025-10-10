import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Pets as PetsIcon,
  Event as EventIcon,
  Assessment as AssessmentIcon,
  Message as MessageIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
// Mock data removed - using empty state

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'clients', label: 'Clients', icon: <PeopleIcon /> },
  { id: 'pets', label: 'Pets', icon: <PetsIcon /> },
  { id: 'schedule', label: 'Schedule', icon: <EventIcon /> },
  { id: 'sessions', label: 'Training Sessions', icon: <AssessmentIcon /> },
  { id: 'messages', label: 'Messages', icon: <MessageIcon /> },
  { id: 'invoices', label: 'Invoices', icon: <ReceiptIcon /> },
  { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> }
];

const DRAWER_WIDTH = 280;

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, activeTab, onTabChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with trainer info */}
      <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={mockTrainer.avatar}
            sx={{ width: 48, height: 48, mr: 2 }}
          >
            {mockTrainer.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {mockTrainer.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Pet Trainer
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Pawsitive Training Center
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              onClick={() => handleItemClick(item.id)}
              selected={activeTab === item.id}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: activeTab === item.id ? 'primary.contrastText' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      
      {/* Footer */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © 2024 Trainer Dashboard
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;