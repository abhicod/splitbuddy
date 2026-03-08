import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const {
  RESEND_SENDER,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  GMAIL_USER,
  GMAIL_PASS,
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  GMAIL_SENDER_EMAIL,
  NODE_ENV,
} = process.env;

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

const normalizeSender = (sender) => {
  const fallback = 'SplitBuddy <no-reply@splitbuddy.app>';
  if (!sender || typeof sender !== 'string') return fallback;
  const s = sender.replace(/[\r\n]/g, '').trim();
  const match = s.match(/^(.+?)\s*<\s*([^>]+)\s*>$/);
  if (match) {
    const name = match[1].trim();
    const email = match[2].trim();
    if (isValidEmail(email)) {
      const safeName = name.replace(/[<>]/g, '').trim();
      return `${safeName} <${email}>`;
    }
    return fallback;
  }
  if (isValidEmail(s)) return s;
  return fallback;
};

const createTransporter = async () => {
  // Priority: explicit SMTP -> Gmail OAuth2 -> Gmail user/pass -> Ethereal (dev)
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    const port = SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587;
    const secure = port === 465;
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    return { transporter, info: { method: 'smtp' } };
  }

  if (GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN && GMAIL_SENDER_EMAIL) {
    const oAuth2Client = new google.auth.OAuth2(
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );
    oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

    let accessToken;
    try {
      accessToken = await oAuth2Client.getAccessToken();
      // accessToken can be an object { token } or string
      const tokenValue = accessToken?.token || accessToken;
      if (!tokenValue) {
        throw new Error('No access token returned. The refresh token may be invalid or expired. Ensure you generated a refresh token with access_type=offline and prompt=consent.');
      }
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: GMAIL_SENDER_EMAIL,
          clientId: GMAIL_CLIENT_ID,
          clientSecret: GMAIL_CLIENT_SECRET,
          refreshToken: GMAIL_REFRESH_TOKEN,
          accessToken: tokenValue,
        },
      });

      return { transporter, info: { method: 'gmail-oauth2' } };
    } catch (err) {
      console.error('[mailer][gmail-oauth2] failed to get access token or create transporter:', err && err.message ? err.message : err);
      // Don't throw here: allow fallback to other transports (e.g., GMAIL_USER/GMAIL_PASS or Ethereal)
      console.warn('[mailer][gmail-oauth2] falling back to other transport methods');
    }
  }

  if (GMAIL_USER && GMAIL_PASS) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });
    return { transporter, info: { method: 'gmail-userpass' } };
  }

  // Development fallback: Ethereal test account
  if (NODE_ENV !== 'production') {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return { transporter, info: { method: 'ethereal', preview: true, account: testAccount } };
  }

  throw new Error('No mail transport configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS or Gmail OAuth2 vars.');
};

export const sendMail = async ({ to, subject, text, html }) => {
  try {
    const recipients = Array.isArray(to)
      ? to.map(r => String(r).trim()).filter(Boolean)
      : String(to || '').split(',').map(s => s.trim()).filter(Boolean);

    if (!recipients.length) throw new Error('No recipients provided');

    const from = normalizeSender(RESEND_SENDER || GMAIL_SENDER_EMAIL || process.env.GMAIL_USER || 'SplitBuddy <no-reply@splitbuddy.app>');

    const { transporter, info } = await createTransporter();


    const mailOptions = {
      from,
      to: recipients.join(', '),
      subject: subject || '',
      text: text || undefined,
      html: html || (text ? `<pre>${text}</pre>` : undefined),
    };

    try {
      const result = await transporter.sendMail(mailOptions);

      // If ethereal, include preview URL
      if (info?.method === 'ethereal') {
        const previewUrl = nodemailer.getTestMessageUrl(result);
        return { success: true, result: { info: result, previewUrl } };
      }

      return { success: true, result };
    } catch (err) {
      console.error('[mailer] sendMail error (method=' + (info?.method || 'unknown') + '):', err);
      return { success: false, error: (err && err.message) ? `${err.message} (method=${info?.method || 'unknown'})` : String(err) };
    }
  } catch (err) {
    console.error('sendMail error:', err);
    return { success: false, error: err?.message || String(err) };
  }
};
