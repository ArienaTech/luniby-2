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
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Fab,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
// Mock data removed - using empty state
import { TrainingSession } from '../../types';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'scheduled': return 'primary';
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

const SessionCard: React.FC<{
  session: TrainingSession;
  onEdit: (session: TrainingSession) => void;
}> = ({ session, onEdit }) => {
  const client = null; // No demo data
  const pet = mockPets.find(p => p.id === session.petId);

  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={pet?.photoUrl} sx={{ mr: 2 }}>
              {pet?.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {pet?.name} - {session.type}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {client?.firstName} {client?.lastName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => onEdit(session)} size="small">
            <EditIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            <ScheduleIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
            {session.date.toLocaleDateString()} at{' '}
            {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Duration: {session.duration} minutes
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={session.type}
            size="small"
            sx={{ 
              backgroundColor: getTypeColor(session.type),
              color: 'white'
            }}
          />
          <Chip
            label={session.status}
            size="small"
            color={getStatusColor(session.status) as any}
            variant="outlined"
          />
        </Box>

        {session.status === 'completed' && (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
              Session Summary:
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {session.notes || 'No notes recorded'}
            </Typography>
          </Box>
        )}

        {session.status === 'scheduled' && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              size="small"
            >
              Mark Complete
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const SessionDetailDialog: React.FC<{
  session: TrainingSession | null;
  open: boolean;
  onClose: () => void;
}> = ({ session, open, onClose }) => {
  const [editMode, setEditMode] = useState(false);
  const [notes, setNotes] = useState('');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [homework, setHomework] = useState<string[]>([]);

  React.useEffect(() => {
    if (session) {
      setNotes(session.notes);
      setAchievements(session.achievements);
      setHomework(session.homework);
    }
  }, [session]);

  if (!session) return null;

  const client = null; // No demo data
  const pet = mockPets.find(p => p.id === session.petId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={pet?.photoUrl} sx={{ mr: 2 }}>
              {pet?.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6">
                Training Session - {pet?.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {client?.firstName} {client?.lastName}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            onClick={() => setEditMode(!editMode)}
            startIcon={<EditIcon />}
          >
            {editMode ? 'Cancel' : 'Edit'}
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Session Details
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">Date & Time</Typography>
              <Typography variant="body1">
                {session.date.toLocaleDateString()} at{' '}
                {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">Duration</Typography>
              <Typography variant="body1">{session.duration} minutes</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">Type & Status</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  label={session.type}
                  sx={{ 
                    backgroundColor: getTypeColor(session.type),
                    color: 'white'
                  }}
                />
                <Chip
                  label={session.status}
                  color={getStatusColor(session.status) as any}
                  variant="outlined"
                />
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">Goals</Typography>
              <List dense>
                {session.goals.map((goal, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText primary={`• ${goal}`} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Session Notes
            </Typography>
            
            {editMode ? (
              <TextField
                fullWidth
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add session notes..."
                sx={{ mb: 2 }}
              />
            ) : (
              <Typography variant="body1" sx={{ mb: 2, minHeight: 100 }}>
                {session.notes || 'No notes recorded'}
              </Typography>
            )}

            {session.status === 'completed' && (
              <>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                  Achievements
                </Typography>
                <List dense>
                  {session.achievements.map((achievement, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText 
                        primary={`✓ ${achievement}`}
                        sx={{ '& .MuiListItemText-primary': { color: 'success.main' } }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                  Homework
                </Typography>
                <List dense>
                  {session.homework.map((hw, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText primary={`• ${hw}`} />
                    </ListItem>
                  ))}
                </List>

                {session.nextSteps.length > 0 && (
                  <>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Next Steps
                    </Typography>
                    <List dense>
                      {session.nextSteps.map((step, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText primary={`→ ${step}`} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {editMode && (
          <Button variant="contained" onClick={() => setEditMode(false)}>
            Save Changes
          </Button>
        )}
        {session.status === 'scheduled' && (
          <Button variant="contained" color="success">
            Mark Complete
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const TrainingSessions: React.FC = () => {
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filteredSessions = mockSessions.filter(session => {
    const statusMatch = filterStatus === 'all' || session.status === filterStatus;
    const typeMatch = filterType === 'all' || session.type === filterType;
    return statusMatch && typeMatch;
  });

  const handleEditSession = (session: TrainingSession) => {
    setSelectedSession(session);
    setDetailDialogOpen(true);
  };

  const completedSessions = mockSessions.filter(s => s.status === 'completed').length;
  const totalSessions = mockSessions.length;
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Training Sessions
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Session
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Sessions
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {totalSessions}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Completed
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {completedSessions}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Scheduled
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {mockSessions.filter(s => s.status === 'scheduled').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <ScheduleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Completion Rate
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {completionRate.toFixed(0)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          select
          label="Filter by Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="scheduled">Scheduled</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
          <MenuItem value="no-show">No Show</MenuItem>
        </TextField>

        <TextField
          select
          label="Filter by Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Types</MenuItem>
          <MenuItem value="individual">Individual</MenuItem>
          <MenuItem value="group">Group</MenuItem>
          <MenuItem value="behavioral">Behavioral</MenuItem>
          <MenuItem value="puppy">Puppy</MenuItem>
          <MenuItem value="advanced">Advanced</MenuItem>
        </TextField>
      </Box>

      {/* Sessions Grid */}
      <Grid container spacing={3}>
        {filteredSessions.map((session) => (
          <Grid item xs={12} sm={6} md={4} key={session.id}>
            <SessionCard session={session} onEdit={handleEditSession} />
          </Grid>
        ))}
      </Grid>

      {filteredSessions.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No sessions found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your filters or create a new session.
          </Typography>
        </Box>
      )}

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>

      <SessionDetailDialog
        session={selectedSession}
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedSession(null);
        }}
      />
    </Box>
  );
};

export default TrainingSessions;