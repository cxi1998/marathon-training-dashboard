import { Router, Request, Response } from 'express';
import stravaService from '../services/strava';
import ouraService from '../services/oura';
import { SessionData } from '../types';
import crypto from 'crypto';

const router = Router();

declare module 'express-session' {
  interface SessionData {
    stravaTokens?: any;
    ouraTokens?: any;
    oauthState?: string;
  }
}

router.get('/strava', (req: Request, res: Response) => {
  try {
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauthState = state;

    console.log(`[Strava Auth] Session ID: ${req.sessionID}, State: ${state}`);
    console.log(`[Strava Auth] Existing tokens:`, {
      hasStrava: !!req.session.stravaTokens,
      hasOura: !!req.session.ouraTokens
    });

    const authURL = stravaService.getAuthorizationURL(state);
    res.json({ url: authURL });
  } catch (error) {
    console.error('Strava auth error:', error);
    res.status(500).json({ error: 'Failed to initiate Strava authentication' });
  }
});

router.get('/strava/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    console.log(`[Strava Callback] Session ID: ${req.sessionID}, State: ${state}`);
    console.log(`[Strava Callback] Expected State: ${req.session.oauthState}`);
    console.log(`[Strava Callback] Existing tokens:`, {
      hasStrava: !!req.session.stravaTokens,
      hasOura: !!req.session.ouraTokens
    });

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=${error}`);
    }

    if (state !== req.session.oauthState) {
      console.error(`[Strava Callback] State mismatch! Expected: ${req.session.oauthState}, Got: ${state}`);
      return res.redirect(`${process.env.FRONTEND_URL}?error=invalid_state`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect(`${process.env.FRONTEND_URL}?error=missing_code`);
    }

    const tokens = await stravaService.exchangeToken(code);
    req.session.stravaTokens = tokens;

    console.log(`[Strava Callback] Tokens stored in session ${req.sessionID}`);

    // Explicitly save session before redirecting to prevent race conditions
    req.session.save((err) => {
      if (err) {
        console.error('[Strava Callback] Session save error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}?error=session_error`);
      }
      console.log(`[Strava Callback] Session saved, redirecting`);
      res.redirect(`${process.env.FRONTEND_URL}?strava=connected`);
    });
  } catch (error) {
    console.error('Strava callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
  }
});

router.get('/oura', (req: Request, res: Response) => {
  try {
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauthState = state;

    console.log(`[Oura Auth] Session ID: ${req.sessionID}, State: ${state}`);
    console.log(`[Oura Auth] Existing tokens:`, {
      hasStrava: !!req.session.stravaTokens,
      hasOura: !!req.session.ouraTokens
    });

    const authURL = ouraService.getAuthorizationURL(state);
    res.json({ url: authURL });
  } catch (error) {
    console.error('Oura auth error:', error);
    res.status(500).json({ error: 'Failed to initiate Oura authentication' });
  }
});

router.get('/oura/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    console.log(`[Oura Callback] Session ID: ${req.sessionID}, State: ${state}`);
    console.log(`[Oura Callback] Expected State: ${req.session.oauthState}`);
    console.log(`[Oura Callback] Existing tokens:`, {
      hasStrava: !!req.session.stravaTokens,
      hasOura: !!req.session.ouraTokens
    });

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=${error}`);
    }

    if (state !== req.session.oauthState) {
      console.error(`[Oura Callback] State mismatch! Expected: ${req.session.oauthState}, Got: ${state}`);
      return res.redirect(`${process.env.FRONTEND_URL}?error=invalid_state`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect(`${process.env.FRONTEND_URL}?error=missing_code`);
    }

    const tokens = await ouraService.exchangeToken(code);
    req.session.ouraTokens = tokens;

    console.log(`[Oura Callback] Tokens stored in session ${req.sessionID}`);

    // Explicitly save session before redirecting to prevent race conditions
    req.session.save((err) => {
      if (err) {
        console.error('[Oura Callback] Session save error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}?error=session_error`);
      }
      console.log(`[Oura Callback] Session saved, redirecting`);
      res.redirect(`${process.env.FRONTEND_URL}?oura=connected`);
    });
  } catch (error) {
    console.error('Oura callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
  }
});

router.get('/status', (req: Request, res: Response) => {
  res.json({
    strava: !!req.session.stravaTokens,
    oura: !!req.session.ouraTokens,
  });
});

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

// Debug endpoint to retrieve tokens after OAuth (for development only)
router.get('/debug/tokens', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  const tokens = {
    strava: req.session.stravaTokens || null,
    oura: req.session.ouraTokens || null,
  };

  // If Oura tokens exist, format them for .env file
  if (tokens.oura) {
    const envFormat = `
# Oura Access Token (add these to your .env file)
OURA_ACCESS_TOKEN=${tokens.oura.accessToken}
OURA_REFRESH_TOKEN=${tokens.oura.refreshToken}
OURA_TOKEN_EXPIRES_AT=${Math.floor(tokens.oura.expiresAt / 1000)}
    `.trim();

    return res.json({
      tokens,
      envFormat,
      instructions: 'Copy the envFormat values to your backend/.env file'
    });
  }

  res.json({
    tokens,
    message: 'No tokens found in session. Complete OAuth flow first by visiting /api/auth/oura'
  });
});

export default router;
