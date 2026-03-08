import { google } from "googleapis";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  GMAIL_SENDER_EMAIL,
} = process.env;

async function testMailer() {
  try {
    // 1. Create OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
      GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

    // 2. Get new access token
    const accessToken = await oAuth2Client.getAccessToken();
    if (!accessToken?.token) {
      throw new Error(
        "❌ Failed to generate access token. Check refresh token."
      );
    }
    console.log("✅ Access token obtained");

    // 3. Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: GMAIL_SENDER_EMAIL,
        clientId: GMAIL_CLIENT_ID,
        clientSecret: GMAIL_CLIENT_SECRET,
        refreshToken: GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    // 4. Send test mail
    const result = await transporter.sendMail({
      from: `SplitBuddy Test <${GMAIL_SENDER_EMAIL}>`,
      to: GMAIL_SENDER_EMAIL, // send to yourself
      subject: "✅ Gmail OAuth2 Test",
      text: "If you see this, Gmail OAuth2 is working!",
    });

    console.log("📨 Email sent:", result);
  } catch (err) {
    console.error("❌ Test failed:", err.message || err);
  }
}

testMailer();
