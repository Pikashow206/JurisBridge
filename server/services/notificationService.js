const { sendEmail } = require('../config/email');
const {
  lawyerNewCaseEmail,
  userCaseAcceptedEmail,
  lawyerAIEscalationEmail,
} = require('../utils/emailTemplates');

// ========================
// EMAIL NOTIFICATIONS
// ========================

// Notify lawyer about a new case
const notifyLawyerNewCase = async (lawyerEmail, lawyerName, caseDetails) => {
  try {
    const template = lawyerNewCaseEmail(lawyerName, caseDetails);
    await sendEmail({
      to: lawyerEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
    console.log(`📧 New case notification sent to ${lawyerName}`);
    return true;
  } catch (error) {
    console.error(`❌ Email to ${lawyerName} failed:`, error.message);
    return false;
  }
};

// Notify user that their case was accepted
const notifyUserCaseAccepted = async (userEmail, userName, lawyerName, caseTitle) => {
  try {
    const template = userCaseAcceptedEmail(userName, lawyerName, caseTitle);
    await sendEmail({
      to: userEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
    console.log(`📧 Case accepted notification sent to ${userName}`);
    return true;
  } catch (error) {
    console.error(`❌ Email to ${userName} failed:`, error.message);
    return false;
  }
};

// Notify lawyer about AI escalation
const notifyLawyerEscalation = async (lawyerEmail, lawyerName, queryDetails) => {
  try {
    const template = lawyerAIEscalationEmail(lawyerName, queryDetails);
    await sendEmail({
      to: lawyerEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
    console.log(`📧 AI escalation notification sent to ${lawyerName}`);
    return true;
  } catch (error) {
    console.error(`❌ Escalation email to ${lawyerName} failed:`, error.message);
    return false;
  }
};

// ========================
// SMS NOTIFICATIONS (Twilio)
// ========================

let twilioClient = null;

const initTwilio = () => {
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_ACCOUNT_SID !== 'placeholder' &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_AUTH_TOKEN !== 'placeholder'
  ) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('   📱 Twilio SMS: Ready');
  } else {
    console.log('   📱 Twilio SMS: Not configured (skipping)');
  }
};

// Send SMS notification
const sendSMS = async (to, message) => {
  if (!twilioClient) {
    console.log(`📱 SMS (mock): To ${to} — ${message}`);
    return { success: true, mock: true };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    console.log(`📱 SMS sent to ${to}: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error(`❌ SMS to ${to} failed:`, error.message);
    return { success: false, error: error.message };
  }
};

// Notify lawyer via SMS about new case
const smsNotifyLawyerNewCase = async (phone, lawyerName, category) => {
  const message = `🔨 JurisBridge: Hi ${lawyerName}, you have a new ${category} case request. Login to your dashboard to accept. — JurisPilot AI`;
  return await sendSMS(phone, message);
};

module.exports = {
  notifyLawyerNewCase,
  notifyUserCaseAccepted,
  notifyLawyerEscalation,
  initTwilio,
  sendSMS,
  smsNotifyLawyerNewCase,
};