// Twilio webhook handler for SMS delivery status and incoming messages
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with proper configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://wagrmmbkukwblfpfxxcb.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZ3JtbWJrdWt3YmxmcGZ4eGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MzI1MjYsImV4cCI6MjA2ODMwODUyNn0.9acMmbOCQZJ2uggvOYfIhqBFYdWGwu-ObNXyT5PPniw';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Webhook doesn't need session persistence
    autoRefreshToken: false
  },
  global: {
    headers: {
      'X-Client-Info': 'twilio-webhook/1.0.0'
    }
  }
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      MessageSid,
      MessageStatus,
      From,
      To,
      Body,
      AccountSid,
      // Additional Twilio parameters
      SmsSid,
      SmsStatus,
      SmsMessageSid
    } = req.body;

    // Handle delivery status updates
    if (MessageStatus || SmsStatus) {
      await handleDeliveryStatus(MessageSid || SmsMessageSid, MessageStatus || SmsStatus);
    }

    // Handle incoming SMS messages (responses from providers)
    if (Body && From) {
      await handleIncomingSMS(From, Body, MessageSid);
    }

    // Respond with TwiML (required by Twilio)
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thank you for your response!</Message>
</Response>`);

  } catch (error) {
    console.error('Webhook error:', error);
    
    // Still return 200 to prevent Twilio retries
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`);
  }
}

// Handle SMS delivery status updates
async function handleDeliveryStatus(messageSid, status) {
  try {
    const statusMap = {
      'queued': 'pending',
      'sent': 'sent',
      'delivered': 'delivered',
      'undelivered': 'failed',
      'failed': 'failed',
      'read': 'read'
    };

    const mappedStatus = statusMap[status.toLowerCase()] || status;
    
    // Update notification status in database
    const updateData = {
      status: mappedStatus,
      updated_at: new Date().toISOString()
    };

    if (mappedStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    } else if (mappedStatus === 'read') {
      updateData.read_at = new Date().toISOString();
    } else if (mappedStatus === 'failed') {
      updateData.failed_reason = `Twilio status: ${status}`;
    }

    const { error } = await supabase
      .from('booking_notifications')
      .update(updateData)
      .eq('external_id', messageSid);

    if (error) {
      console.error('Failed to update notification status:', error);
    } else {
    }
  } catch (error) {
    console.error('Error handling delivery status:', error);
  }
}

// Handle incoming SMS responses from providers
async function handleIncomingSMS(from, body, messageSid) {
  try {
    const response = body.toUpperCase().trim();
    
    // Clean phone number (remove whatsapp: prefix if present)
    const cleanFrom = from.replace('whatsapp:', '');
    

    // Find the most recent booking notification for this phone number
    const { data: notifications, error } = await supabase
      .from('booking_notifications')
      .select(`
        id,
        booking_id,
        provider_id,
        consultation_bookings (
          id,
          customer_name,
          customer_phone,
          customer_email,
          pet_name,
          pet_type,
          consultation_type,
          preferred_date,
          preferred_time,
          status
        )
      `)
      .eq('notification_type', 'sms')
      .eq('status', 'sent')
      .order('created_at', { ascending: false })
      .limit(5); // Get last 5 to find matching provider

    if (error || !notifications || notifications.length === 0) {
      return;
    }

    // Find notification from matching provider phone
    let matchingNotification = null;
    
    // Get provider phone numbers to match
    for (const notification of notifications) {
      const { data: providerAvailability } = await supabase
        .from('provider_availability')
        .select('notification_settings')
        .eq('provider_id', notification.provider_id)
        .single();

      if (providerAvailability?.notification_settings?.phone) {
        const providerPhone = formatPhoneNumber(providerAvailability.notification_settings.phone);
        if (providerPhone === cleanFrom) {
          matchingNotification = notification;
          break;
        }
      }
    }

    if (!matchingNotification) {
      return;
    }

    const booking = matchingNotification.consultation_bookings;
    const bookingId = booking.id;

    // Handle different response types
    if (response === 'ACCEPT' || response === 'YES' || response === 'CONFIRM') {
      // Update booking status to confirmed
      const { error: updateError } = await supabase
        .from('consultation_bookings')
        .update({ 
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (!updateError) {
        // Send confirmation SMS to provider
        await sendConfirmationSMS(cleanFrom, 'accepted', booking);
        
        // Send confirmation to customer
        await sendCustomerNotification(booking, 'confirmed');
        
      }
    } else if (response === 'DECLINE' || response === 'NO' || response === 'REJECT') {
      // Update booking status to declined
      const { error: updateError } = await supabase
        .from('consultation_bookings')
        .update({ 
          status: 'declined',
          declined_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (!updateError) {
        // Send confirmation SMS to provider
        await sendConfirmationSMS(cleanFrom, 'declined', booking);
        
        // Send notification to customer
        await sendCustomerNotification(booking, 'declined');
        
      }
    } else {
      // Send help message
      await sendHelpMessage(cleanFrom);
    }

  } catch (error) {
    console.error('Error handling incoming SMS:', error);
  }
}

// Format phone number to E.164 format
function formatPhoneNumber(phone) {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('61')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('04')) {
    return `+61${cleaned.substring(1)}`;
  } else if (cleaned.startsWith('4')) {
    return `+61${cleaned}`;
  }
  
  return `+61${cleaned}`;
}

// Send confirmation SMS to provider
async function sendConfirmationSMS(to, action, booking) {
  try {
    const twilio = require('twilio');
    
    // PRODUCTION SECURE - Validate environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      throw new Error('Missing required Twilio environment variables');
    }
    
    const client = twilio(accountSid, authToken);

    let message;
    if (action === 'accepted') {
      message = `✅ Booking CONFIRMED!

Pet: ${booking.pet_name} (${booking.pet_type})
Date: ${booking.preferred_date} at ${booking.preferred_time}

We've notified ${booking.customer_name}. Meeting details will be sent 30 minutes before the consultation.

Thank you for using Luniby! 🐾`;
    } else {
      message = `❌ Booking DECLINED

Pet: ${booking.pet_name} (${booking.pet_type})
Date: ${booking.preferred_date} at ${booking.preferred_time}

We've notified ${booking.customer_name} and will help them find another provider.

Thank you for using Luniby! 🐾`;
    }

         await client.messages.create({
       body: message,
       from: process.env.TWILIO_PHONE_NUMBER || '+14632508485',
       to: to
     });

   } catch (error) {
     console.error('Failed to send confirmation SMS:', error);
   }
 }

// Send notification to customer
async function sendCustomerNotification(booking, status) {
  try {
    const twilio = require('twilio');
    
    // PRODUCTION SECURE - Validate environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      throw new Error('Missing required Twilio environment variables');
    }
    
    const client = twilio(accountSid, authToken);

    let message;
    if (status === 'confirmed') {
      message = `🎉 Great news! Your consultation has been CONFIRMED

Pet: ${booking.pet_name}
Date: ${booking.preferred_date} at ${booking.preferred_time}
Service: ${booking.consultation_type}

Meeting details will be sent 30 minutes before your appointment.

Questions? Reply to this message or visit luniby.com

Thank you for choosing Luniby! 🐾`;
    } else {
      message = `We're sorry, but your consultation request was not available.

Pet: ${booking.pet_name}
Date: ${booking.preferred_date} at ${booking.preferred_time}

Don't worry! We're finding alternative providers for you. You'll receive new options within 24 hours.

Visit luniby.com to browse other available vets.

Thank you for choosing Luniby! 🐾`;
    }

    // Format customer phone number
    const customerPhone = formatPhoneNumber(booking.customer_phone);

         await client.messages.create({
       body: message,
       from: process.env.TWILIO_PHONE_NUMBER || '+14632508485',
       to: customerPhone
     });

   } catch (error) {
     console.error('Failed to send customer notification:', error);
   }
 }

// Send help message
async function sendHelpMessage(to) {
  try {
    const twilio = require('twilio');
    
    // PRODUCTION SECURE - Validate environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      throw new Error('Missing required Twilio environment variables');
    }
    
    const client = twilio(accountSid, authToken);

    const message = `🤔 I didn't understand that response.

Please reply with:
• ACCEPT (or YES) - to confirm the booking
• DECLINE (or NO) - to reject the booking

Need help? Contact support at support@luniby.com

Thank you! 🐾`;

         await client.messages.create({
       body: message,
       from: process.env.TWILIO_PHONE_NUMBER || '+14632508485',
       to: to
     });

   } catch (error) {
     console.error('Failed to send help message:', error);
   }
 }

// CORS and body parser configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}