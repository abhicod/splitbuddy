import express from 'express';
import { sendMail } from '../utils/mailer.js';

const router = express.Router();

// POST /api/debug/send-test-email
// Body: { to: string | string[], subject?: string, text?: string, html?: string }
router.post('/send-test-email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    const recipients = to || req.query.to || 'nimishsttl@gmail.com';

    const result = await sendMail({
      to: recipients,
      subject: subject || 'SplitBuddy test email',
      text: text || `This is a test email sent from SplitBuddy to ${recipients}. If you received this, the mailer is working.`,
      html: html || undefined
    });

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    return res.json({ success: true, result: result.result });
  } catch (err) {
    console.error('Debug send-test-email error:', err);
    return res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

router.get('/mail-config', (req, res) => {
  try {
    const env = process.env;
    const hasSmtp = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
    const hasGmailOauth = !!(env.GMAIL_CLIENT_ID && env.GMAIL_CLIENT_SECRET && env.GMAIL_REFRESH_TOKEN && env.GMAIL_SENDER_EMAIL);
    const hasGmailUserPass = !!(env.GMAIL_USER && env.GMAIL_PASS);
    const method = hasSmtp ? 'smtp' : hasGmailOauth ? 'gmail-oauth2' : hasGmailUserPass ? 'gmail-userpass' : (env.NODE_ENV !== 'production' ? 'ethereal' : null);
    return res.json({ success: true, method, hasSmtp, hasGmailOauth, hasGmailUserPass, nodeEnv: env.NODE_ENV || 'development' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err?.message || String(err) });
  }
});

export default router;
