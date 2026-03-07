// Lawyer notification — new case request
const lawyerNewCaseEmail = (lawyerName, caseDetails) => {
  return {
    subject: `⚖️ New Case Request on JurisBridge — ${caseDetails.category}`,
    text: `Hi ${lawyerName}, you have a new consultation request on JurisBridge in ${caseDetails.category}. Please login to your dashboard to accept or decline.`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a5f, #2d5f8a); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">⚖️ JurisBridge</h1>
          <p style="color: #cce0ff; margin: 4px 0 0 0; font-size: 14px;">AI-Powered Legal Assistance Platform</p>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          <h2 style="color: #1e3a5f; margin-top: 0;">New Case Request</h2>
          <p style="color: #333;">Hi <strong>${lawyerName}</strong>,</p>
          <p style="color: #555;">You have received a new consultation request that matches your specialization.</p>
          
          <!-- Case Details Box -->
          <div style="background: #f5f8fc; border-left: 4px solid #1e3a5f; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>📂 Category:</strong> ${caseDetails.category}</p>
            <p style="margin: 4px 0;"><strong>📝 Title:</strong> ${caseDetails.title}</p>
            <p style="margin: 4px 0;"><strong>📅 Submitted:</strong> ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
            <p style="margin: 4px 0;"><strong>🔴 Priority:</strong> ${caseDetails.priority || 'Normal'}</p>
          </div>

          <p style="color: #555;">Please log in to your dashboard to review and accept or decline this request.</p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.CLIENT_URL}/lawyer/dashboard" 
               style="background: #1e3a5f; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              View Case Request
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 16px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            🤖 Powered by JurisPilot AI | © ${new Date().getFullYear()} JurisBridge
          </p>
        </div>
      </div>
    `,
  };
};

// Case accepted notification to user
const userCaseAcceptedEmail = (userName, lawyerName, caseTitle) => {
  return {
    subject: `✅ Your case has been accepted — JurisBridge`,
    text: `Hi ${userName}, great news! Lawyer ${lawyerName} has accepted your case "${caseTitle}". You can now start a conversation on JurisBridge.`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        
        <div style="background: linear-gradient(135deg, #1e3a5f, #2d5f8a); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">⚖️ JurisBridge</h1>
        </div>

        <div style="padding: 24px;">
          <h2 style="color: #27ae60; margin-top: 0;">✅ Case Accepted!</h2>
          <p style="color: #333;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #555;">Great news! Lawyer <strong>${lawyerName}</strong> has accepted your case:</p>
          
          <div style="background: #f0faf0; border-left: 4px solid #27ae60; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>📝 Case:</strong> ${caseTitle}</p>
            <p style="margin: 4px 0;"><strong>👨‍⚖️ Lawyer:</strong> ${lawyerName}</p>
          </div>

          <p style="color: #555;">You can now chat with your lawyer directly on the platform.</p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.CLIENT_URL}/user/cases" 
               style="background: #27ae60; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              Go to My Cases
            </a>
          </div>
        </div>

        <div style="background: #f0f0f0; padding: 16px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            🤖 Powered by JurisPilot AI | © ${new Date().getFullYear()} JurisBridge
          </p>
        </div>
      </div>
    `,
  };
};

// AI escalation notification to lawyer
const lawyerAIEscalationEmail = (lawyerName, queryDetails) => {
  return {
    subject: `🤖 JurisPilot AI Escalation — Lawyer Needed`,
    text: `Hi ${lawyerName}, JurisPilot AI has escalated a query that requires human legal expertise in ${queryDetails.category}. Please login to assist.`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        
        <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🤖 JurisPilot AI Escalation</h1>
          <p style="color: #ffcccc; margin: 4px 0 0 0; font-size: 14px;">Human Expertise Required</p>
        </div>

        <div style="padding: 24px;">
          <p style="color: #333;">Hi <strong>${lawyerName}</strong>,</p>
          <p style="color: #555;">JurisPilot AI has determined that the following query requires professional legal assistance:</p>
          
          <div style="background: #fef5f5; border-left: 4px solid #e74c3c; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>📂 Category:</strong> ${queryDetails.category}</p>
            <p style="margin: 4px 0;"><strong>❓ Query Preview:</strong> ${queryDetails.preview}</p>
            <p style="margin: 4px 0;"><strong>📊 AI Confidence:</strong> ${queryDetails.confidence}% (Below threshold)</p>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.CLIENT_URL}/lawyer/escalations" 
               style="background: #e74c3c; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
              Review Escalation
            </a>
          </div>
        </div>

        <div style="background: #f0f0f0; padding: 16px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            ⚖️ JurisBridge | © ${new Date().getFullYear()}
          </p>
        </div>
      </div>
    `,
  };
};

module.exports = {
  lawyerNewCaseEmail,
  userCaseAcceptedEmail,
  lawyerAIEscalationEmail,
};