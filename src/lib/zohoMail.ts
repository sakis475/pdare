import axios from 'axios';
import { otpTemplate } from './emailVerification/content';

// Type definitions for email data
interface EmailOptions {
  to: string;
  subject: string;
  content: string;
}

// Function to get a new access token using the refresh token
async function getAccessToken(): Promise<string | null> {
  try {
    const response = await axios.post(
      `https://accounts.zoho.eu/oauth/v2/token`,
      null,
      {
        params: {
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_SECRET,
          refresh_token: process.env.ZOHO_REFRESH_TOKEN,
          grant_type: 'refresh_token',
        },
      }
    );
    console.log(response.data);
    console.log({
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_SECRET,
      refresh_token: process.env.ZOHO_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    });

    return response.data.access_token;
  } catch (error: any) {
    console.error(
      '❌ Error refreshing access token:',
      error.response?.data || error.message
    );
    throw error;
  }
}

// Function to send an email using Zoho Mail API
export async function sendZohoEmail({
  to,
  subject,
  content,
}: EmailOptions): Promise<boolean> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('❌ Failed to get access token. Cannot send email.');
    return false;
  }
  content = otpTemplate(123456);
  try {
    const response = await axios.post(
      `https://mail.zoho.eu/api/accounts/${process.env.ZOHO_ACCOUNT_ID}/messages`,
      {
        fromAddress: `ServeTab <${process.env.ZOHO_EMAIL}>`,
        toAddress: to,
        subject: subject,
        content: content,
      },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Email sent successfully!', response.data);
    return true;
  } catch (error: any) {
    console.error(
      '❌ Error sending email:',
      error.response?.data || error.message
    );
    return false;
  }
}
