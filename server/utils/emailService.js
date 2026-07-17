/**
 * Mock Email Service (Phase 15)
 * Simulates sending emails since SMTP credentials are not configured.
 * Logs beautifully formatted emails to the console.
 */

const sendEmail = async (to, subject, htmlBody) => {
  console.log('\n' + '='.repeat(60));
  console.log('📧 MOCK EMAIL SENT');
  console.log('='.repeat(60));
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('-'.repeat(60));
  console.log(htmlBody.replace(/<[^>]*>?/gm, '')); // Strip HTML for console readability
  console.log('='.repeat(60) + '\n');
  return true;
};

const EmailTemplates = {
  welcome: (companyName, adminName) => ({
    subject: 'Welcome to Zone Monitor Visitor Management System',
    body: `
      <h2>Welcome, ${adminName}!</h2>
      <p>Thank you for registering <strong>${companyName}</strong> on the Zone Monitor platform.</p>
      <p>Your account has been created successfully. Your <strong>One Day Trial</strong> has started.</p>
      <p>Enjoy exploring all the features!</p>
    `
  }),
  
  trialExpiring: (companyName, daysLeft) => ({
    subject: `Action Required: Your trial expires in ${daysLeft} days`,
    body: `
      <h2>Trial Expiry Notice</h2>
      <p>Hello,</p>
      <p>Your trial for <strong>${companyName}</strong> will expire in ${daysLeft} days.</p>
      <p>Please upgrade your plan to continue using the Visitor Management System without interruption.</p>
    `
  }),

  subscriptionExpired: (companyName) => ({
    subject: 'Urgent: Your subscription has expired',
    body: `
      <h2>Subscription Expired</h2>
      <p>Hello,</p>
      <p>Your subscription for <strong>${companyName}</strong> has officially expired.</p>
      <p>Your dashboard access has been restricted. Please log in and upgrade your plan to restore full functionality.</p>
    `
  }),

  paymentReceived: (companyName, plan, amount) => ({
    subject: `Payment Received - ${plan} Plan`,
    body: `
      <h2>Payment Confirmation</h2>
      <p>Thank you for your payment!</p>
      <p>We have received ₹${amount} for the <strong>${plan}</strong> plan for ${companyName}.</p>
      <p>Your request has been sent to the SaaS Administrator for final activation.</p>
    `
  }),

  subscriptionActivated: (companyName, plan, expiryDate) => ({
    subject: `Subscription Activated - ${plan} Plan`,
    body: `
      <h2>🎉 Subscription Activated</h2>
      <p>Great news!</p>
      <p>Your <strong>${plan}</strong> subscription for ${companyName} has been fully activated.</p>
      <p>Your new billing cycle is valid until: ${expiryDate}</p>
      <p>Thank you for choosing Zone Monitor.</p>
    `
  })
};

module.exports = {
  sendEmail,
  EmailTemplates
};
