// Vercel serverless function for sending emails via SendGrid
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid - PRODUCTION SECURE
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  throw new Error('Missing required environment variable: SENDGRID_API_KEY');
}
sgMail.setApiKey(apiKey);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html, text, from } = req.body;

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, and html or text' 
      });
    }

    // Prepare email message
    const msg = {
      to: to,
      from: from || {
        email: 'noreply@yourmarketplace.com',
        name: 'Your Marketplace'
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
    const response = await sgMail.send(msg);

    return res.status(200).json({
      success: true,
      messageId: response[0].headers['x-message-id'],
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('SendGrid Email Error:', error);

    // Handle specific SendGrid errors
    if (error.response) {
      const { message, code, response } = error;
      
      return res.status(400).json({
        error: 'Failed to send email',
        details: message,
        code: code,
        sendgridError: response?.body?.errors || []
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}