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

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=${error}`);
    }

    if (state !== req.session.oauthState) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=invalid_state`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect(`${process.env.FRONTEND_URL}?error=missing_code`);
    }

    const tokens = await stravaService.exchangeToken(code);
    req.session.stravaTokens = tokens;

    res.redirect(`${process.env.FRONTEND_URL}?strava=connected`);
  } catch (error) {
    console.error('Strava callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
  }
});

router.get('/oura', (req: Request, res: Response) => {
  try {
    const state = crypto.randomBytes(16).toString('hex');
    req.session.oauthState = state;

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

    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=${error}`);
    }

    if (state !== req.session.oauthState) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=invalid_state`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect(`${process.env.FRONTEND_URL}?error=missing_code`);
    }

    const tokens = await ouraService.exchangeToken(code);
    req.session.ouraTokens = tokens;

    res.redirect(`${process.env.FRONTEND_URL}?oura=connected`);
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

export default router;
