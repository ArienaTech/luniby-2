// Vercel serverless function for sending WhatsApp messages via Twilio
const twilio = require('twilio');

// Initialize Twilio client - PRODUCTION SECURE
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !whatsappNumber) {
  throw new Error('Missing required Twilio environment variables');
}

const client = twilio(accountSid, authToken);
const TWILIO_WHATSAPP_NUMBER = whatsappNumber;

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

    // Ensure the 'to' number has whatsapp: prefix
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    // Validate phone number format (basic validation)
    const phoneRegex = /^whatsapp:\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(whatsappTo)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid WhatsApp number format. Use whatsapp:+61412345678' 
      });
    }

    // Format message for WhatsApp (with emojis and better formatting)
    const formattedMessage = message
      .replace(/🐾 NEW BOOKING ALERT/, '🐾 *NEW BOOKING ALERT*')
      .replace(/Pet:/, '*Pet:*')
      .replace(/Service:/, '*Service:*')
      .replace(/Time:/, '*Time:*')
      .replace(/Customer:/, '*Customer:*')
      .replace(/Reply ACCEPT/, '*Reply ACCEPT*')
      .replace(/DECLINE/, '*DECLINE*');

    // Send WhatsApp message via Twilio
    const twilioMessage = await client.messages.create({
      body: formattedMessage,
      from: TWILIO_WHATSAPP_NUMBER,
      to: whatsappTo,
      // Optional: Add status callback URL to track delivery
      statusCallback: `${process.env.VERCEL_URL || 'https://your-domain.com'}/api/twilio-webhook`,
      statusCallbackMethod: 'POST'
    });

    // Log successful send

    // Return success response
    return res.status(200).json({
      success: true,
      messageSid: twilioMessage.sid,
      status: twilioMessage.status,
      bookingId: bookingId
    });

  } catch (error) {
    console.error('Twilio WhatsApp Error:', error);

    // Handle specific Twilio errors
    if (error.code === 21211) {
      return res.status(400).json({
        success: false,
        error: 'Invalid WhatsApp number'
      });
    } else if (error.code === 21408) {
      return res.status(400).json({
        success: false,
        error: 'Permission to send WhatsApp message denied'
      });
    } else if (error.code === 63016) {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp template not approved or recipient not opted in'
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: 'Failed to send WhatsApp message. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// CORS configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}