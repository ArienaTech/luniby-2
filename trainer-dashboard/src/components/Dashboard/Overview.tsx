import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Pets as PetsIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon
} from '@mui/icons-material';
// Mock data removed - using empty state

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Overview: React.FC = () => {
  const upcomingAppointments = mockAppointments.filter(apt => 
    apt.date > new Date() && apt.status === 'scheduled'
  ).slice(0, 5);

  const recentClients = mockClients.slice(0, 3);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Dashboard Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clients"
            value={mockBusinessMetrics.totalClients}
            icon={<PeopleIcon />}
            color="#1976d2"
            subtitle={`${mockBusinessMetrics.activeClients} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Pets"
            value={mockPets.length}
            icon={<PetsIcon />}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Month Revenue"
            value={`$${mockBusinessMetrics.monthlyRevenue.toLocaleString()}`}
            icon={<MoneyIcon />}
            color="#f57c00"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Rating"
            value={mockBusinessMetrics.averageSessionRating}
            icon={<StarIcon />}
            color="#7b1fa2"
            subtitle="out of 5.0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming Appointments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Upcoming Appointments
                </Typography>
              </Box>
              <List>
                {upcomingAppointments.map((appointment) => {
                  const client = mockClients.find(c => c.id === appointment.clientId);
                  const pet = mockPets.find(p => p.id === appointment.petId);
                  
                  return (
                    <ListItem key={appointment.id} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar src={pet?.photoUrl}>
                          {pet?.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {appointment.title}
                            </Typography>
                            <Chip
                              label={appointment.type}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {client?.firstName} {client?.lastName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {appointment.date.toLocaleDateString()} at{' '}
                              {appointment.date.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Clients & Progress */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            {/* Recent Clients */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Recent Clients
                    </Typography>
                  </Box>
                  <List>
                    {recentClients.map((client) => (
                      <ListItem key={client.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar>
                            {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${client.firstName} ${client.lastName}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {client.pets.length} pet{client.pets.length !== 1 ? 's' : ''}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Joined: {client.joinDate.toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Monthly Progress */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Monthly Progress
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Sessions Completed</Typography>
                      <Typography variant="body2">
                        {mockBusinessMetrics.completedSessions}/{mockBusinessMetrics.totalSessions}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(mockBusinessMetrics.completedSessions / mockBusinessMetrics.totalSessions) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Client Retention</Typography>
                      <Typography variant="body2">
                        {mockBusinessMetrics.clientRetentionRate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={mockBusinessMetrics.clientRetentionRate}
                      sx={{ height: 8, borderRadius: 4 }}
                      color="success"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;