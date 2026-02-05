import express from 'express';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from backend .env
const envPath = path.join(__dirname, '../backend/.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

const app = express();
const PORT = 3002; // Different from dev server

console.log('\n=== OAuth Token Retrieval Server ===');
console.log('This script will help you obtain OAuth tokens for Strava and Oura.');
console.log('You will use these tokens as Vercel environment variables.\n');

// Strava OAuth flow
app.get('/auth/strava', (req, res) => {
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3002/auth/strava/callback&scope=activity:read_all&approval_prompt=force`;

  console.log('Redirecting to Strava OAuth...');
  res.redirect(authUrl);
});

app.get('/auth/strava/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      throw new Error('No authorization code received');
    }

    console.log('Exchanging Strava authorization code for tokens...');

    const tokenResponse = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    });

    const { access_token, refresh_token, expires_at } = tokenResponse.data;

    console.log('\n========================================');
    console.log('✅ STRAVA TOKENS RETRIEVED SUCCESSFULLY');
    console.log('========================================');
    console.log('\nCopy these values to your Vercel environment variables:\n');
    console.log(`STRAVA_ACCESS_TOKEN=${access_token}`);
    console.log(`STRAVA_REFRESH_TOKEN=${refresh_token}`);
    console.log(`STRAVA_TOKEN_EXPIRES_AT=${expires_at}`);
    console.log('\n========================================\n');

    res.send(`
      <html>
        <head><title>Strava OAuth Success</title></head>
        <body style="font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
          <h1 style="color: #fc5200;">✅ Strava Tokens Retrieved!</h1>
          <p>Check your console/terminal for the token values.</p>
          <p>Copy the following environment variables to Vercel:</p>
          <pre style="background: #f5f5f5; padding: 20px; border-radius: 8px; overflow-x: auto;">
STRAVA_ACCESS_TOKEN=${access_token}
STRAVA_REFRESH_TOKEN=${refresh_token}
STRAVA_TOKEN_EXPIRES_AT=${expires_at}
          </pre>
          <p><a href="http://localhost:3002/auth/oura">→ Continue to Oura OAuth</a></p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('❌ Error exchanging Strava code:', error.response?.data || error.message);
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1 style="color: red;">Error</h1>
          <p>Failed to exchange authorization code. Check console for details.</p>
          <pre>${error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message}</pre>
        </body>
      </html>
    `);
  }
});

// Oura OAuth flow
app.get('/auth/oura', (req, res) => {
  const authUrl = `https://cloud.ouraring.com/oauth/authorize?client_id=${process.env.OURA_CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3002/auth/oura/callback&scope=daily%20heartrate`;

  console.log('Redirecting to Oura OAuth...');
  res.redirect(authUrl);
});

app.get('/auth/oura/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      throw new Error('No authorization code received');
    }

    console.log('Exchanging Oura authorization code for tokens...');

    // PHASE 1 DIAGNOSTIC LOGGING - See exactly what we're sending
    console.log('\n🔍 Oura Token Exchange - Request Details:');
    console.log('  Authorization Code Length:', (code as string).length);
    console.log('  OURA_CLIENT_ID:', process.env.OURA_CLIENT_ID);
    console.log('  OURA_CLIENT_SECRET (first 10 chars):', process.env.OURA_CLIENT_SECRET?.substring(0, 10) + '...');
    console.log('  OURA_REDIRECT_URI from env:', process.env.OURA_REDIRECT_URI);
    console.log('  redirect_uri being sent:', 'http://localhost:3002/auth/oura/callback');
    console.log('  grant_type:', 'authorization_code');
    console.log('');

    // Use URLSearchParams for form-encoded data (required by Oura)
    const params = new URLSearchParams({
      client_id: process.env.OURA_CLIENT_ID!,
      client_secret: process.env.OURA_CLIENT_SECRET!,
      code: code as string,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:3002/auth/oura/callback'
    });

    const tokenResponse = await axios.post('https://api.ouraring.com/oauth/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const expires_at = Math.floor(Date.now() / 1000) + expires_in;

    console.log('\n========================================');
    console.log('✅ OURA TOKENS RETRIEVED SUCCESSFULLY');
    console.log('========================================');
    console.log('\nCopy these values to your Vercel environment variables:\n');
    console.log(`OURA_ACCESS_TOKEN=${access_token}`);
    console.log(`OURA_REFRESH_TOKEN=${refresh_token}`);
    console.log(`OURA_TOKEN_EXPIRES_AT=${expires_at}`);
    console.log('\n========================================\n');

    res.send(`
      <html>
        <head><title>Oura OAuth Success</title></head>
        <body style="font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
          <h1 style="color: #0066cc;">✅ Oura Tokens Retrieved!</h1>
          <p>Check your console/terminal for the token values.</p>
          <p>Copy the following environment variables to Vercel:</p>
          <pre style="background: #f5f5f5; padding: 20px; border-radius: 8px; overflow-x: auto;">
OURA_ACCESS_TOKEN=${access_token}
OURA_REFRESH_TOKEN=${refresh_token}
OURA_TOKEN_EXPIRES_AT=${expires_at}
          </pre>
          <h2>🎉 All Done!</h2>
          <p>You now have all the tokens needed for Vercel deployment.</p>
          <p>You can close this window and stop the server (Ctrl+C).</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    // PHASE 1 DIAGNOSTIC LOGGING - Enhanced error details
    console.error('\n❌ Oura Token Exchange Failed:');
    console.error('  Status:', error.response?.status);
    console.error('  Status Text:', error.response?.statusText);
    console.error('  Error:', error.response?.data?.error);
    console.error('  Error Description:', error.response?.data?.error_description);
    console.error('  Full Response:', JSON.stringify(error.response?.data, null, 2));
    console.error('  Full Error:', error.message);
    console.error('');

    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1 style="color: red;">Error</h1>
          <p>Failed to exchange authorization code. Check console for details.</p>
          <pre>${error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message}</pre>
        </body>
      </html>
    `);
  }
});

// Home page with instructions
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>OAuth Token Retrieval</title></head>
      <body style="font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <h1>🔐 OAuth Token Retrieval</h1>
        <p>This server helps you obtain OAuth tokens for Vercel deployment.</p>

        <h2>Instructions:</h2>
        <ol>
          <li>Make sure you've updated the OAuth redirect URIs in Strava/Oura apps:
            <ul>
              <li>Strava: <code>http://localhost:3002/auth/strava/callback</code></li>
              <li>Oura: <code>http://localhost:3002/auth/oura/callback</code></li>
            </ul>
          </li>
          <li>Click the links below to start each OAuth flow</li>
          <li>Copy the tokens from your console/terminal</li>
          <li>Save them for Vercel environment variables</li>
        </ol>

        <h2>OAuth Flows:</h2>
        <p><a href="/auth/strava" style="display: inline-block; background: #fc5200; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0;">1. Connect Strava</a></p>
        <p><a href="/auth/oura" style="display: inline-block; background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0;">2. Connect Oura</a></p>

        <h2>After Getting Tokens:</h2>
        <p>Add these environment variables to your Vercel backend project:</p>
        <ul>
          <li>STRAVA_ACCESS_TOKEN</li>
          <li>STRAVA_REFRESH_TOKEN</li>
          <li>STRAVA_TOKEN_EXPIRES_AT</li>
          <li>OURA_ACCESS_TOKEN</li>
          <li>OURA_REFRESH_TOKEN</li>
          <li>OURA_TOKEN_EXPIRES_AT</li>
        </ul>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('\nBefore proceeding, make sure you have updated the OAuth redirect URIs:');
  console.log('  Strava: http://localhost:3002/auth/strava/callback');
  console.log('  Oura: http://localhost:3002/auth/oura/callback\n');
  console.log('Open http://localhost:3002 in your browser to begin.\n');
});
