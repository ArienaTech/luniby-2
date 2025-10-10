// Netlify function for sending emails via SendGrid
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  throw new Error('Missing required environment variable: SENDGRID_API_KEY');
}
sgMail.setApiKey(apiKey);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { to, subject, html, text, from } = JSON.parse(event.body);

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: to, subject, and html or text' 
        })
      };
    }

    // Prepare email message
    const msg = {
      to: to,
      from: from || {
        email: 'hello@luniby.com',
        name: 'Luniby Contact Form'
      },
      subject: subject,
      text: text,
      html: html,
      // Add tracking
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: false
        },
        openTracking: {
          enable: true
        }
      }
    };

    // Send email via SendGrid
    console.log('Attempting to send email to:', to);
    console.log('From:', msg.from);
    console.log('Subject:', subject);
    
    const response = await sgMail.send(msg);
    
    console.log('SendGrid response:', response[0].statusCode);
    console.log('Message ID:', response[0].headers['x-message-id']);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messageId: response[0].headers['x-message-id'],
        message: 'Email sent successfully'
      })
    };

  } catch (error) {
    console.error('SendGrid Email Error:', error);

    // Handle specific SendGrid errors
    if (error.response) {
      const { message, code, response } = error;
      
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Failed to send email',
          details: message,
          code: code,
          sendgridError: response?.body?.errors || []
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};