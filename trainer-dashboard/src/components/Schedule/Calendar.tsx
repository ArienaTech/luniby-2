import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Event as EventIcon
} from '@mui/icons-material';
// Mock data removed - using empty state
import { Appointment } from '../../types';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return 'primary';
    case 'completed': return 'success';
    case 'cancelled': return 'error';
    case 'no-show': return 'warning';
    default: return 'default';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'individual': return '#1976d2';
    case 'group': return '#388e3c';
    case 'behavioral': return '#f57c00';
    case 'puppy': return '#7b1fa2';
    case 'advanced': return '#d32f2f';
    default: return '#757575';
  }
};

const AppointmentCard: React.FC<{
  appointment: Appointment;
  onClick: (appointment: Appointment) => void;
}> = ({ appointment, onClick }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const client = mockClients.find(c => c.id === appointment.clientId);
  const pet = mockPets.find(p => p.id === appointment.petId);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        border: `2px solid ${getTypeColor(appointment.type)}`,
        borderRadius: 2,
        '&:hover': { 
          boxShadow: 3,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
      onClick={() => onClick(appointment)}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: getTypeColor(appointment.type) }}>
            {appointment.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
          <IconButton size="small" onClick={handleMenuClick}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
          {appointment.title}
        </Typography>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          {client?.firstName} {client?.lastName}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={appointment.type}
            size="small"
            sx={{ 
              backgroundColor: getTypeColor(appointment.type),
              color: 'white',
              fontSize: '0.75rem'
            }}
          />
          <Chip
            label={appointment.status}
            size="small"
            color={getStatusColor(appointment.status) as any}
            variant="outlined"
          />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
          <MenuItem onClick={handleMenuClose}>Cancel</MenuItem>
          <MenuItem onClick={handleMenuClose}>Mark Complete</MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

const AppointmentDetailDialog: React.FC<{
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
}> = ({ appointment, open, onClose }) => {
  if (!appointment) return null;

  const client = mockClients.find(c => c.id === appointment.clientId);
  const pet = mockPets.find(p => p.id === appointment.petId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
          {appointment.title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">Date & Time</Typography>
          <Typography variant="body1">
            {appointment.date.toLocaleDateString()} at{' '}
            {appointment.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">Duration</Typography>
          <Typography variant="body1">{appointment.duration} minutes</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">Client</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Avatar sx={{ mr: 2 }}>
              {client?.firstName.charAt(0)}{client?.lastName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body1">{client?.firstName} {client?.lastName}</Typography>
              <Typography variant="body2" color="textSecondary">{client?.phone}</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">Pet</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Avatar src={pet?.photoUrl} sx={{ mr: 2 }}>
              {pet?.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body1">{pet?.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {pet?.breed} • {pet?.age} years old
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">Type & Status</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip
              label={appointment.type}
              sx={{ 
                backgroundColor: getTypeColor(appointment.type),
                color: 'white'
              }}
            />
            <Chip
              label={appointment.status}
              color={getStatusColor(appointment.status) as any}
              variant="outlined"
            />
          </Box>
        </Box>

        {appointment.notes && (
          <Box>
            <Typography variant="subtitle2" color="textSecondary">Notes</Typography>
            <Typography variant="body1">{appointment.notes}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="outlined">Edit</Button>
        <Button variant="contained">Mark Complete</Button>
      </DialogActions>
    </Dialog>
  );
};

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Generate calendar days for the current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const days = [];
  const currentDateObj = new Date(startDate);
  
  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
    days.push(new Date(currentDateObj));
    currentDateObj.setDate(currentDateObj.getDate() + 1);
  }

  const getAppointmentsForDay = (date: Date) => {
    return mockAppointments.filter(apt => 
      apt.date.toDateString() === date.toDateString()
    );
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialogOpen(true);
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Schedule
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Appointment
        </Button>
      </Box>

      <Card>
        <CardContent>
          {/* Calendar Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={handlePreviousMonth}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Typography>
            <IconButton onClick={handleNextMonth}>
              <ChevronRightIcon />
            </IconButton>
          </Box>

          {/* Day Headers */}
          <Grid container sx={{ mb: 2 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Grid item xs key={day}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    textAlign: 'center', 
                    fontWeight: 'bold',
                    color: 'text.secondary',
                    py: 1
                  }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          </Grid>

          {/* Calendar Grid */}
          <Grid container spacing={1}>
            {days.map((day, index) => {
              const dayAppointments = getAppointmentsForDay(day);
              
              return (
                <Grid item xs key={index} sx={{ minHeight: 120 }}>
                  <Box
                    sx={{
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1,
                      backgroundColor: isCurrentMonth(day) ? 'background.paper' : 'action.hover',
                      position: 'relative'
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isToday(day) ? 'bold' : 'normal',
                        color: isToday(day) ? 'primary.main' : 
                               isCurrentMonth(day) ? 'text.primary' : 'text.secondary'
                      }}
                    >
                      {day.getDate()}
                    </Typography>
                    
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {dayAppointments.slice(0, 2).map((appointment) => (
                        <Box
                          key={appointment.id}
                          sx={{
                            backgroundColor: getTypeColor(appointment.type),
                            color: 'white',
                            borderRadius: 1,
                            p: 0.5,
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            '&:hover': { opacity: 0.8 }
                          }}
                          onClick={() => handleAppointmentClick(appointment)}
                        >
                          <Typography variant="caption" sx={{ display: 'block', fontWeight: 'medium' }}>
                            {appointment.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            {appointment.title.length > 15 
                              ? `${appointment.title.substring(0, 15)}...` 
                              : appointment.title
                            }
                          </Typography>
                        </Box>
                      ))}
                      {dayAppointments.length > 2 && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                          +{dayAppointments.length - 2} more
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Today's Appointments Sidebar */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Today's Appointments
          </Typography>
          <List>
            {getAppointmentsForDay(new Date()).map((appointment) => {
              const client = mockClients.find(c => c.id === appointment.clientId);
              const pet = mockPets.find(p => p.id === appointment.petId);
              
              return (
                <ListItem 
                  key={appointment.id} 
                  sx={{ px: 0, cursor: 'pointer' }}
                  onClick={() => handleAppointmentClick(appointment)}
                >
                  <ListItemAvatar>
                    <Avatar src={pet?.photoUrl}>
                      {pet?.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={appointment.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span">
                          {appointment.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {client?.firstName} {client?.lastName}
                        </Typography>
                        <br />
                        <Chip
                          label={appointment.type}
                          size="small"
                          sx={{ 
                            backgroundColor: getTypeColor(appointment.type),
                            color: 'white',
                            mt: 0.5
                          }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
          {getAppointmentsForDay(new Date()).length === 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
              No appointments scheduled for today
            </Typography>
          )}
        </CardContent>
      </Card>

      <AppointmentDetailDialog
        appointment={selectedAppointment}
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedAppointment(null);
        }}
      />
    </Box>
  );
};

export default Calendar;