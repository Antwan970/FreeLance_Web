const nodemailer = require('nodemailer');

const requiredMailEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];

function getMailMode() {
  return process.env.EMAIL_DELIVERY || 'console';
}

function getMissingMailEnv() {
  return requiredMailEnv.filter((key) => !process.env[key]);
}

function isMailConfigured() {
  if (getMailMode() === 'console') {
    return true;
  }

  return getMissingMailEnv().length === 0;
}

function logMailConfigStatus() {
  if (getMailMode() === 'console') {
    console.log('Email notifications enabled in console mode. Messages will be printed in the backend terminal.');
    return;
  }

  const missingEnv = getMissingMailEnv();

  if (missingEnv.length) {
    console.warn(`Email notifications disabled. Missing SMTP environment variables: ${missingEnv.join(', ')}`);
    return;
  }

  console.log(`Email notifications enabled with SMTP host: ${process.env.SMTP_HOST}`);
}

function createTransporter() {
  if (getMailMode() === 'console') {
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS.replace(/\s+/g, ''),
    },
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildApplicationDecisionEmail({ applicantName, status, jobTitle, company }) {
  const isAccepted = status === 'accepted';
  const decisionText = isAccepted ? 'accepted' : 'rejected';
  const subject = `Your application for ${jobTitle} was ${decisionText}`;
  const safeApplicantName = escapeHtml(applicantName);
  const safeJobTitle = escapeHtml(jobTitle);
  const safeCompany = escapeHtml(company);

  const text = [
    `Hi ${applicantName},`,
    '',
    `Your application for ${jobTitle} at ${company} has been ${decisionText}.`,
    '',
    isAccepted
      ? 'Congratulations! The employer has accepted your application.'
      : 'Thank you for applying. The employer has decided not to move forward with your application at this time.',
    '',
    'Best regards,',
    'FreeLance Team',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <p>Hi ${safeApplicantName},</p>
      <p>Your application for <strong>${safeJobTitle}</strong> at <strong>${safeCompany}</strong> has been <strong>${decisionText}</strong>.</p>
      <p>${isAccepted
        ? 'Congratulations! The employer has accepted your application.'
        : 'Thank you for applying. The employer has decided not to move forward with your application at this time.'}</p>
      <p>Best regards,<br />FreeLance Team</p>
    </div>
  `;

  return { subject, text, html };
}

async function sendApplicationDecisionEmail({ to, applicantName, status, jobTitle, company }) {
  if (!to || !['accepted', 'rejected'].includes(status)) {
    return { skipped: true, reason: 'Missing recipient or unsupported status' };
  }

  if (!isMailConfigured()) {
    const missingEnv = getMissingMailEnv();
    console.warn(`Application decision email skipped. Missing SMTP environment variables: ${missingEnv.join(', ')}`);
    return { skipped: true, reason: `Missing SMTP environment variables: ${missingEnv.join(', ')}` };
  }

  const transporter = createTransporter();
  const email = buildApplicationDecisionEmail({
    applicantName: applicantName || 'Applicant',
    status,
    jobTitle: jobTitle || 'the job',
    company: company || 'the company',
  });

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || 'FreeLance Team <no-reply@localhost>',
    to,
    ...email,
  });

  if (getMailMode() === 'console') {
    console.log('Application decision email generated:', info.message);
  }

  return { skipped: false };
}

module.exports = {
  logMailConfigStatus,
  sendApplicationDecisionEmail,
};
