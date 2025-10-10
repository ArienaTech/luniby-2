import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Pets as PetsIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
// Mock data removed - using empty state
import { Client } from '../../types';

const ClientCard: React.FC<{ client: Client; onView: (client: Client) => void }> = ({ client, onView }) => (
  <Card sx={{ height: '100%', position: 'relative' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ width: 56, height: 56, mr: 2 }}>
          {client.firstName.charAt(0)}{client.lastName.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {client.firstName} {client.lastName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Client since {client.joinDate.toLocaleDateString()}
          </Typography>
        </Box>
        <IconButton onClick={() => onView(client)} size="small">
          <VisibilityIcon />
        </IconButton>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">{client.phone}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {client.email}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary', mt: 0.2 }} />
          <Typography variant="body2" color="textSecondary">
            {client.address}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PetsIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
          <Typography variant="body2">
            {client.pets.length} pet{client.pets.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Chip
          label="Active"
          color="success"
          size="small"
          variant="outlined"
        />
      </Box>
    </CardContent>
  </Card>
);

const ClientDetailDialog: React.FC<{
  client: Client | null;
  open: boolean;
  onClose: () => void;
}> = ({ client, open, onClose }) => {
  if (!client) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {client.firstName} {client.lastName}
          </Typography>
          <IconButton>
            <EditIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Contact Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">Phone</Typography>
              <Typography variant="body1">{client.phone}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">Email</Typography>
              <Typography variant="body1">{client.email}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">Address</Typography>
              <Typography variant="body1">{client.address}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">Join Date</Typography>
              <Typography variant="body1">{client.joinDate.toLocaleDateString()}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Emergency Contact
            </Typography>
            {client.emergencyContact ? (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Name</Typography>
                  <Typography variant="body1">{client.emergencyContact.name}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Phone</Typography>
                  <Typography variant="body1">{client.emergencyContact.phone}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Relationship</Typography>
                  <Typography variant="body1">{client.emergencyContact.relationship}</Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No emergency contact provided
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Pets
            </Typography>
            <List>
              {client.pets.map((pet) => (
                <ListItem key={pet.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar src={pet.photoUrl}>
                      {pet.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={pet.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span">
                          {pet.breed} • {pet.age} years old • {pet.weight} lbs
                        </Typography>
                        <br />
                        <Typography variant="body2" color="textSecondary">
                          {pet.behaviorNotes}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button variant="contained">Edit Client</Button>
      </DialogActions>
    </Dialog>
  );
};

const ClientManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const mockClients: Client[] = []; // No demo data
  const filteredClients = mockClients.filter(client =>
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setDetailDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Client Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add New Client
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search clients by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredClients.map((client) => (
          <Grid item xs={12} sm={6} md={4} key={client.id}>
            <ClientCard client={client} onView={handleViewClient} />
          </Grid>
        ))}
      </Grid>

      {filteredClients.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No clients found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your search terms or add a new client.
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

      <ClientDetailDialog
        client={selectedClient}
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedClient(null);
        }}
      />
    </Box>
  );
};

export default ClientManagement;