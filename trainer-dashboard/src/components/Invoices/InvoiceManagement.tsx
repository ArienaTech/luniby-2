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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Fab,
  TextField,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
// Mock data removed - using empty state
import { Invoice } from '../../types';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'success';
    case 'pending': return 'warning';
    case 'overdue': return 'error';
    default: return 'default';
  }
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
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
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const InvoiceDetailDialog: React.FC<{
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
}> = ({ invoice, open, onClose }) => {
  if (!invoice) return null;

  const client = mockClients.find(c => c.id === invoice.clientId);
  const sessions = mockSessions.filter(s => invoice.sessionIds.includes(s.id));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">
              Invoice #{invoice.id}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {client?.firstName} {client?.lastName}
            </Typography>
          </Box>
          <Chip
            label={invoice.status}
            color={getStatusColor(invoice.status) as any}
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Client Information
            </Typography>
            <Typography variant="body1">{client?.firstName} {client?.lastName}</Typography>
            <Typography variant="body2" color="textSecondary">{client?.email}</Typography>
            <Typography variant="body2" color="textSecondary">{client?.phone}</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {client?.address}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Invoice Details
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="textSecondary">Due Date</Typography>
              <Typography variant="body1">{invoice.dueDate.toLocaleDateString()}</Typography>
            </Box>
            {invoice.paidDate && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="textSecondary">Paid Date</Typography>
                <Typography variant="body1">{invoice.paidDate.toLocaleDateString()}</Typography>
              </Box>
            )}
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="textSecondary">Total Amount</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                ${invoice.amount.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Services
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.services.map((service, index) => (
                    <TableRow key={index}>
                      <TableCell>{service.description}</TableCell>
                      <TableCell align="center">{service.quantity}</TableCell>
                      <TableCell align="right">${service.rate.toFixed(2)}</TableCell>
                      <TableCell align="right">${(service.quantity * service.rate).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      ${invoice.amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {sessions.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Related Sessions
              </Typography>
              <List>
                {sessions.map((session) => (
                  <ListItem key={session.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={`${session.type} Training Session`}
                      secondary={`${session.date.toLocaleDateString()} - ${session.duration} minutes`}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button startIcon={<DownloadIcon />}>Download PDF</Button>
        <Button startIcon={<SendIcon />}>Send to Client</Button>
        {invoice.status === 'pending' && (
          <Button variant="contained" color="success">
            Mark as Paid
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const InvoiceManagement: React.FC = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredInvoices = mockInvoices.filter(invoice => 
    filterStatus === 'all' || invoice.status === filterStatus
  );

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailDialogOpen(true);
  };

  // Calculate stats
  const totalRevenue = mockInvoices.reduce((sum, inv) => 
    inv.status === 'paid' ? sum + inv.amount : sum, 0
  );
  const pendingAmount = mockInvoices.reduce((sum, inv) => 
    inv.status === 'pending' ? sum + inv.amount : sum, 0
  );
  const overdueAmount = mockInvoices.reduce((sum, inv) => 
    inv.status === 'overdue' ? sum + inv.amount : sum, 0
  );
  const totalInvoices = mockInvoices.length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Invoice Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Create Invoice
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={<MoneyIcon />}
            color="#4caf50"
            subtitle="Paid invoices"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Amount"
            value={`$${pendingAmount.toLocaleString()}`}
            icon={<ScheduleIcon />}
            color="#ff9800"
            subtitle="Awaiting payment"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Overdue Amount"
            value={`$${overdueAmount.toLocaleString()}`}
            icon={<WarningIcon />}
            color="#f44336"
            subtitle="Requires attention"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Invoices"
            value={totalInvoices}
            icon={<ReceiptIcon />}
            color="#2196f3"
            subtitle="All time"
          />
        </Grid>
      </Grid>

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Filter by Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="overdue">Overdue</MenuItem>
        </TextField>
      </Box>

      {/* Invoices Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Recent Invoices
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const client = mockClients.find(c => c.id === invoice.clientId);
                  const isOverdue = invoice.status === 'pending' && invoice.dueDate < new Date();
                  
                  return (
                    <TableRow key={invoice.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          #{invoice.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                            {client?.firstName.charAt(0)}{client?.lastName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {client?.firstName} {client?.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {client?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          ${invoice.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color={isOverdue ? 'error' : 'textPrimary'}
                        >
                          {invoice.dueDate.toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={isOverdue ? 'Overdue' : invoice.status}
                          color={isOverdue ? 'error' : getStatusColor(invoice.status) as any}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small">
                          <SendIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {filteredInvoices.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No invoices found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your filters or create a new invoice.
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

      <InvoiceDetailDialog
        invoice={selectedInvoice}
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedInvoice(null);
        }}
      />
    </Box>
  );
};

export default InvoiceManagement;