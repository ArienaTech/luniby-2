# Scripts Documentation

This directory contains serverless functions and utility scripts for the Pet Care Marketplace application.

## Structure

```
scripts/
├── api/           # Serverless API functions
└── README.md      # This documentation
```

## API Functions

All API functions are designed to be deployed as serverless functions (Netlify Functions, Vercel Functions, etc.).

### Communication Services

#### `send-email.js`
- **Purpose**: Send email notifications via Twilio SendGrid
- **Endpoint**: `/.netlify/functions/send-email`
- **Method**: POST
- **Parameters**:
  - `to`: Recipient email address
  - `subject`: Email subject line
  - `text`: Plain text message
  - `html`: HTML message content

#### `send-sms.js`
- **Purpose**: Send SMS notifications via Twilio
- **Endpoint**: `/.netlify/functions/send-sms`
- **Method**: POST
- **Parameters**:
  - `to`: Recipient phone number (E.164 format)
  - `message`: SMS message content

#### `send-whatsapp.js`
- **Purpose**: Send WhatsApp messages via Twilio
- **Endpoint**: `/.netlify/functions/send-whatsapp`
- **Method**: POST
- **Parameters**:
  - `to`: Recipient WhatsApp number (E.164 format)
  - `message`: WhatsApp message content
  - `mediaUrl`: Optional media attachment URL

#### `send-push.js`
- **Purpose**: Send push notifications
- **Endpoint**: `/.netlify/functions/send-push`
- **Method**: POST
- **Parameters**:
  - `deviceToken`: Target device token
  - `title`: Notification title
  - `body`: Notification body
  - `data`: Optional additional data

### Webhook Handlers

#### `twilio-webhook.js`
- **Purpose**: Handle incoming Twilio webhooks
- **Endpoint**: `/.netlify/functions/twilio-webhook`
- **Method**: POST
- **Features**:
  - SMS delivery status updates
  - WhatsApp message status updates
  - Incoming message processing
  - Webhook signature verification

## Environment Variables

All API functions require the following environment variables:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number

# Database Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage Examples

### Send SMS Notification

```javascript
const response = await fetch('/.netlify/functions/send-sms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: '+1234567890',
    message: 'Your booking has been confirmed!'
  })
});
```

### Send Email Notification

```javascript
const response = await fetch('/.netlify/functions/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'Booking Confirmation',
    html: '<h1>Your booking is confirmed!</h1>'
  })
});
```

### Send WhatsApp Message

```javascript
const response = await fetch('/.netlify/functions/send-whatsapp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'whatsapp:+1234567890',
    message: 'Your pet care appointment is tomorrow at 2 PM.'
  })
});
```

## Deployment

### Netlify Functions

1. Functions are automatically deployed with your site
2. Environment variables must be set in Netlify dashboard
3. Functions are available at `/.netlify/functions/[function-name]`

### Vercel Functions

1. Move functions to `api/` directory in project root
2. Set environment variables in Vercel dashboard
3. Functions are available at `/api/[function-name]`

## Error Handling

All functions include comprehensive error handling:

- **400 Bad Request**: Invalid parameters
- **401 Unauthorized**: Missing or invalid credentials
- **500 Internal Server Error**: Service errors
- **200 OK**: Successful operation

## Security

### Webhook Verification

The Twilio webhook handler includes signature verification:

```javascript
// Verify webhook signature
const signature = request.headers['x-twilio-signature'];
const isValid = twilio.validateRequest(
  twilioAuthToken,
  signature,
  webhookUrl,
  request.body
);
```

### Rate Limiting

Consider implementing rate limiting for production:

- Use service-level rate limiting
- Implement request throttling
- Monitor usage patterns

## Monitoring

### Logging

All functions include structured logging:

```javascript
console.log('Function executed:', {
  function: 'send-sms',
  to: recipient,
  status: 'success',
  timestamp: new Date().toISOString()
});
```

### Metrics

Monitor key metrics:

- Function execution time
- Success/failure rates
- Message delivery rates
- Error patterns

## Testing

### Local Development

Use Netlify CLI for local testing:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development server
netlify dev

# Test function locally
curl -X POST http://localhost:8888/.netlify/functions/send-sms \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567890", "message": "Test message"}'
```

### Integration Testing

Test with actual services:

1. Use Twilio test credentials for development
2. Test webhook endpoints with ngrok
3. Verify error handling scenarios
4. Test rate limiting behavior

## Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure all required variables are set
2. **Phone Number Format**: Use E.164 format (+1234567890)
3. **Webhook URLs**: Must be publicly accessible HTTPS URLs
4. **CORS Issues**: Configure CORS headers for browser requests

### Debug Mode

Enable debug logging:

```javascript
// Add to function for detailed logging
const debug = process.env.DEBUG === 'true';
if (debug) {
  console.log('Debug info:', { request, response });
}
```