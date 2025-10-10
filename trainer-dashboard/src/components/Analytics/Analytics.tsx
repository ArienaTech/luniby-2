import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon,
  Star as StarIcon,
  Pets as PetsIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
// Mock data removed - using empty state

// Sample data for charts
const revenueData = [
  { month: 'Jan', revenue: 2800, sessions: 28 },
  { month: 'Feb', revenue: 3200, sessions: 32 },
  { month: 'Mar', revenue: 2900, sessions: 29 },
  { month: 'Apr', revenue: 3500, sessions: 35 },
  { month: 'May', revenue: 3800, sessions: 38 },
  { month: 'Jun', revenue: 4200, sessions: 42 },
];

const sessionTypeData = [
  { name: 'Individual', value: 45, color: '#1976d2' },
  { name: 'Behavioral', value: 25, color: '#f57c00' },
  { name: 'Group', value: 20, color: '#388e3c' },
  { name: 'Puppy', value: 10, color: '#7b1fa2' },
];

const clientRetentionData = [
  { month: 'Jan', retained: 85, new: 15 },
  { month: 'Feb', retained: 88, new: 12 },
  { month: 'Mar', retained: 82, new: 18 },
  { month: 'Apr', retained: 90, new: 10 },
  { month: 'May', retained: 87, new: 13 },
  { month: 'Jun', retained: 92, new: 8 },
];

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  subtitle?: string;
}> = ({ title, value, icon, color, trend, subtitle }) => (
  <Card>
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
          {trend && (
            <Chip
              label={trend}
              size="small"
              color={trend.startsWith('+') ? 'success' : 'error'}
              sx={{ mt: 1 }}
            />
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6months');

  const totalRevenue = mockInvoices.reduce((sum, invoice) => 
    invoice.status === 'paid' ? sum + invoice.amount : sum, 0
  );

  const avgSessionRating = 4.8;
  const clientGrowthRate = 15;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Analytics & Reports
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="1month">1 Month</MenuItem>
            <MenuItem value="3months">3 Months</MenuItem>
            <MenuItem value="6months">6 Months</MenuItem>
            <MenuItem value="1year">1 Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} component="div">
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={<MoneyIcon />}
            color="#388e3c"
            trend="+12.5%"
            subtitle="vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} component="div">
          <StatCard
            title="Active Clients"
            value={mockBusinessMetrics.activeClients}
            icon={<PeopleIcon />}
            color="#1976d2"
            trend={`+${clientGrowthRate}%`}
            subtitle="growth rate"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} component="div">
          <StatCard
            title="Sessions This Month"
            value={mockBusinessMetrics.completedSessions}
            icon={<EventIcon />}
            color="#f57c00"
            trend="+8.3%"
            subtitle="completion rate: 95%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} component="div">
          <StatCard
            title="Avg Rating"
            value={avgSessionRating.toFixed(1)}
            icon={<StarIcon />}
            color="#7b1fa2"
            subtitle="client satisfaction"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue & Sessions Trend */}
        <Grid item xs={12} lg={8} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Revenue & Sessions Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="right" dataKey="sessions" fill="#e3f2fd" name="Sessions" />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1976d2" 
                    strokeWidth={3}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Session Types Distribution */}
        <Grid item xs={12} lg={4} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Session Types
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sessionTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sessionTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Client Retention */}
        <Grid item xs={12} lg={6} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Client Retention Rate
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={clientRetentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="retained" stackId="a" fill="#4caf50" name="Retained %" />
                  <Bar dataKey="new" stackId="a" fill="#ff9800" name="New %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Metrics */}
        <Grid item xs={12} lg={6} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Performance Insights
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Most Popular Training Type
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Individual Training</Typography>
                  <Chip label="45%" color="primary" />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={45} 
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Client Satisfaction Rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Excellent</Typography>
                  <Chip label="96%" color="success" />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={96} 
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  color="success"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Session Completion Rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body1">On-time Completion</Typography>
                  <Chip label="92%" color="info" />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={92} 
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  color="info"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Revenue Growth
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Monthly Growth</Typography>
                  <Chip label="+12.5%" color="success" />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  color="warning"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity & Top Clients */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recent Activity
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Session completed with Max (John Smith)"
                    secondary="Individual training - 1 hour ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="New client registered: Emily Davis"
                    secondary="Border Collie - Luna - 3 hours ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Payment received from Michael Johnson"
                    secondary="$85.00 - 5 hours ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Session scheduled with Rocky"
                    secondary="Behavioral training - Tomorrow 4:00 PM"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} component="div">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Top Clients
              </Typography>
              <List>
                {mockClients.slice(0, 4).map((client, index) => (
                  <ListItem key={client.id}>
                    <Avatar sx={{ mr: 2 }}>
                      {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                    </Avatar>
                    <ListItemText
                      primary={`${client.firstName} ${client.lastName}`}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PetsIcon sx={{ fontSize: 16 }} />
                          <Typography variant="body2">
                            {client.pets.length} pet{client.pets.length !== 1 ? 's' : ''}
                          </Typography>
                          <Chip
                            label={`${3 + index} sessions`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;