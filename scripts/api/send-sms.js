// Vercel serverless function for sending SMS via Twilio
const twilio = require('twilio');

// Initialize Twilio client - PRODUCTION SECURE
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !phoneNumber) {
  throw new Error('Missing required Twilio environment variables');
}

const client = twilio(accountSid, authToken);
const TWILIO_PHONE_NUMBER = phoneNumber;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { to, message, bookingId } = req.body;

    // Validate required fields
    if (!to || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and message are required' 
      });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid phone number format. Use E.164 format (+61412345678)' 
      });
    }

    // Send SMS via Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: to,
      // Optional: Add status callback URL to track delivery
      statusCallback: `${process.env.VERCEL_URL || 'https://your-domain.com'}/api/twilio-webhook`,
      statusCallbackMethod: 'POST'
    });

    // Log successful send (in production, use proper logging)

    // Return success response
    return res.status(200).json({
      success: true,
      messageSid: twilioMessage.sid,
      status: twilioMessage.status,
      bookingId: bookingId
    });

  } catch (error) {
    console.error('Twilio SMS Error:', error);

    // Handle specific Twilio errors
    if (error.code === 21211) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number'
      });
    } else if (error.code === 21408) {
      return res.status(400).json({
        success: false,
        error: 'Permission to send SMS to this number denied'
      });
    } else if (error.code === 21614) {
      return res.status(400).json({
        success: false,
        error: 'SMS body is invalid'
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: 'Failed to send SMS. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// CORS configuration for development
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}