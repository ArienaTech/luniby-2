// Email service for sending notifications
export const emailService = {
  // Send welcome email
  async sendWelcomeEmail(email, name) {
    try {
      // In production, this would call your backend API to send email
      console.log(`Sending welcome email to ${email} for ${name}`);
      return {
        success: true,
        message: 'Welcome email sent successfully'
      };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send welcome email'
      };
    }
  },

  // Send verification email
  async sendVerificationEmail(email, verificationLink) {
    try {
      console.log(`Sending verification email to ${email}`);
      return {
        success: true,
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send verification email'
      };
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(email, resetLink) {
    try {
      console.log(`Sending password reset email to ${email}`);
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send password reset email'
      };
    }
  },

  // Send notification email
  async sendNotificationEmail(email, subject, message) {
    try {
      console.log(`Sending notification email to ${email}: ${subject}`);
      return {
        success: true,
        message: 'Notification email sent successfully'
      };
    } catch (error) {
      console.error('Error sending notification email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send notification email'
      };
    }
  },

  // Send triage result email
  async sendTriageResultEmail(email, triageData) {
    try {
      console.log(`Sending triage result email to ${email}`);
      return {
        success: true,
        message: 'Triage result email sent successfully'
      };
    } catch (error) {
      console.error('Error sending triage result email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send triage result email'
      };
    }
  },

  // Send appointment confirmation email
  async sendAppointmentConfirmationEmail(email, appointmentData) {
    try {
      console.log(`Sending appointment confirmation email to ${email}`);
      return {
        success: true,
        message: 'Appointment confirmation email sent successfully'
      };
    } catch (error) {
      console.error('Error sending appointment confirmation email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send appointment confirmation email'
      };
    }
  }
};

export default emailService;
