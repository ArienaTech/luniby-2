import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  TextField,
  Button,
  Paper,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Search as SearchIcon
} from '@mui/icons-material';
// Mock data removed - using empty state
import { Message } from '../../types';

// Mock messages data
const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '1',
    receiverId: 'trainer',
    content: 'Hi Sarah! How did Max do in today\'s session? I noticed he was a bit anxious this morning.',
    timestamp: new Date('2024-12-15T14:30:00'),
    read: true,
    type: 'text'
  },
  {
    id: '2',
    senderId: 'trainer',
    receiverId: '1',
    content: 'Max did great! He was a bit nervous at first, but once we started with the treats, he relaxed and followed commands well. We worked on his heel command and he\'s making excellent progress.',
    timestamp: new Date('2024-12-15T14:45:00'),
    read: true,
    type: 'text'
  },
  {
    id: '3',
    senderId: '1',
    receiverId: 'trainer',
    content: 'That\'s wonderful to hear! Should I continue practicing the heel command at home?',
    timestamp: new Date('2024-12-15T15:00:00'),
    read: true,
    type: 'text'
  },
  {
    id: '4',
    senderId: '2',
    receiverId: 'trainer',
    content: 'Luna has been much calmer at home since our last session. Thank you for the impulse control exercises!',
    timestamp: new Date('2024-12-16T10:15:00'),
    read: false,
    type: 'text'
  },
  {
    id: '5',
    senderId: '3',
    receiverId: 'trainer',
    content: 'Hi Sarah, I wanted to confirm our appointment for Rocky tomorrow at 4 PM. Also, should I bring anything specific?',
    timestamp: new Date('2024-12-17T16:20:00'),
    read: false,
    type: 'text'
  }
];

const Messages: React.FC = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Get conversations grouped by client
  const conversations = mockClients.map(client => {
    const clientMessages = mockMessages.filter(
      msg => msg.senderId === client.id || msg.receiverId === client.id
    );
    const lastMessage = clientMessages[clientMessages.length - 1];
    const unreadCount = clientMessages.filter(msg => !msg.read && msg.senderId === client.id).length;
    
    return {
      client,
      messages: clientMessages,
      lastMessage,
      unreadCount
    };
  }).filter(conv => conv.messages.length > 0);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    `${conv.client.firstName} ${conv.client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = conversations.find(conv => conv.client.id === selectedClientId);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedClientId) return;
    
    // In a real app, this would send the message to the server
    console.log('Sending message:', newMessage, 'to client:', selectedClientId);
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Messages
      </Typography>

      <Grid container spacing={3} sx={{ height: 'calc(100vh - 200px)' }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <TextField
                fullWidth
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Conversations
              </Typography>
            </CardContent>
            
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <List sx={{ pt: 0 }}>
                {filteredConversations.map((conversation) => (
                  <ListItem
                    key={conversation.client.id}
                    button
                    selected={selectedClientId === conversation.client.id}
                    onClick={() => setSelectedClientId(conversation.client.id)}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      mb: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                        },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge badgeContent={conversation.unreadCount} color="error">
                        <Avatar>
                          {conversation.client.firstName.charAt(0)}{conversation.client.lastName.charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {conversation.client.firstName} {conversation.client.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {conversation.lastMessage && formatTime(conversation.lastMessage.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '200px'
                          }}
                        >
                          {conversation.lastMessage?.content || 'No messages'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Card>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardContent sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}>
                      {selectedConversation.client.firstName.charAt(0)}{selectedConversation.client.lastName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {selectedConversation.client.firstName} {selectedConversation.client.lastName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedConversation.client.email}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                      <Chip
                        label={`${selectedConversation.client.pets.length} pet${selectedConversation.client.pets.length !== 1 ? 's' : ''}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </CardContent>

                {/* Messages Area */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  {selectedConversation.messages.map((message) => {
                    const isFromTrainer = message.senderId === 'trainer';
                    
                    return (
                      <Box
                        key={message.id}
                        sx={{
                          display: 'flex',
                          justifyContent: isFromTrainer ? 'flex-end' : 'flex-start',
                          mb: 2
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            backgroundColor: isFromTrainer ? 'primary.main' : 'grey.100',
                            color: isFromTrainer ? 'white' : 'text.primary',
                            borderRadius: 2,
                            borderTopRightRadius: isFromTrainer ? 0 : 2,
                            borderTopLeftRadius: isFromTrainer ? 2 : 0,
                          }}
                        >
                          <Typography variant="body1">{message.content}</Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 1,
                              opacity: 0.8,
                              textAlign: 'right'
                            }}
                          >
                            {formatTime(message.timestamp)}
                          </Typography>
                        </Paper>
                      </Box>
                    );
                  })}
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      multiline
                      maxRows={3}
                    />
                    <IconButton color="primary">
                      <AttachFileIcon />
                    </IconButton>
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      <SendIcon />
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Select a conversation
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Choose a client from the list to start messaging
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Messages;