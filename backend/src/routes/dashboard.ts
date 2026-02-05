import { Router, Request, Response } from 'express';
import stravaService from '../services/strava';
import ouraService from '../services/oura';
import { aggregateDashboardData } from '../utils/dataAggregation';
import { TokenData } from '../types';

const router = Router();

/**
 * Get OAuth tokens from environment variables
 * Used for Vercel deployment where tokens are stored as env vars
 */
function getTokensFromEnv(): { stravaTokens: TokenData | null; ouraTokens: TokenData | null } {
  // Diagnostic logging
  console.log('[ENV CHECK] Environment variables status:', {
    STRAVA_ACCESS_TOKEN: process.env.STRAVA_ACCESS_TOKEN ? `Present (${process.env.STRAVA_ACCESS_TOKEN.substring(0, 10)}...)` : 'MISSING',
    OURA_ACCESS_TOKEN: process.env.OURA_ACCESS_TOKEN ? `Present (${process.env.OURA_ACCESS_TOKEN.substring(0, 10)}...)` : 'MISSING',
    OURA_REFRESH_TOKEN: process.env.OURA_REFRESH_TOKEN ? 'Present' : 'MISSING',
    OURA_TOKEN_EXPIRES_AT: process.env.OURA_TOKEN_EXPIRES_AT || 'MISSING'
  });

  const stravaTokens = process.env.STRAVA_ACCESS_TOKEN
    ? {
        accessToken: process.env.STRAVA_ACCESS_TOKEN,
        refreshToken: process.env.STRAVA_REFRESH_TOKEN || '',
        expiresAt: parseInt(process.env.STRAVA_TOKEN_EXPIRES_AT || '0') * 1000, // Convert seconds to milliseconds
      }
    : null;

  const ouraTokens = process.env.OURA_ACCESS_TOKEN
    ? {
        accessToken: process.env.OURA_ACCESS_TOKEN,
        refreshToken: process.env.OURA_REFRESH_TOKEN || '',
        expiresAt: parseInt(process.env.OURA_TOKEN_EXPIRES_AT || '0') * 1000, // Convert seconds to milliseconds
      }
    : null;

  return { stravaTokens, ouraTokens };
}

router.get('/data', async (req: Request, res: Response) => {
  try {
    const { stravaTokens, ouraTokens } = getTokensFromEnv();

    console.log(`[Dashboard Data] Tokens:`, {
      hasStrava: !!stravaTokens,
      hasOura: !!ouraTokens
    });

    const { date, lookback } = req.query;

    if (!date || !lookback) {
      return res.status(400).json({ error: 'Missing date or lookback parameter' });
    }

    const endDate = new Date(date as string);
    const lookbackDays = parseInt(lookback as string);

    if (isNaN(endDate.getTime()) || isNaN(lookbackDays)) {
      return res.status(400).json({ error: 'Invalid date or lookback parameter' });
    }

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - lookbackDays + 1);

    // Use Promise.allSettled to handle partial authentication
    const [activitiesResult, sleepDataResult, readinessDataResult] = await Promise.allSettled([
      stravaTokens
        ? stravaService.getActivities(stravaTokens, startDate, endDate)
        : Promise.resolve([]),
      ouraTokens
        ? ouraService.getSleepData(ouraTokens, startDate, endDate)
        : Promise.resolve([]),
      ouraTokens
        ? ouraService.getReadinessData(ouraTokens, startDate, endDate)
        : Promise.resolve([])
    ]);

    try {
      const dashboardData = aggregateDashboardData(
        activitiesResult.status === 'fulfilled' ? activitiesResult.value : [],
        sleepDataResult.status === 'fulfilled' ? sleepDataResult.value : [],
        readinessDataResult.status === 'fulfilled' ? readinessDataResult.value : [],
        startDate,
        endDate,
        lookbackDays
      );

      res.json(dashboardData);
    } catch (aggregationError) {
      console.error('[Dashboard] Data aggregation failed:', aggregationError);
      // Return safe empty dashboard instead of 500 error
      res.json({
        dateRange: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          lookbackDays
        },
        kpis: {
          weeklyMileage: 0,
          weeklyMileageChange: 0,
          averageReadinessScore: 0,
          readinessTrend: 'stable' as const,
          averageSleepDuration: 0,
          averageSleepScore: 0,
          totalTrainingSessions: 0,
          cumulativeElevationGain: 0,
          trainingLoad: 0,
        },
        timeSeries: [],
        activities: [],
        sleepData: [],
        readinessData: [],
      });
    }
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

router.get('/activities', async (req: Request, res: Response) => {
  try {
    const { stravaTokens } = getTokensFromEnv();

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing startDate or endDate parameter' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date parameters' });
    }

    if (!stravaTokens) {
      return res.json([]);
    }

    const activities = await stravaService.getActivities(
      stravaTokens,
      start,
      end
    );

    res.json(activities);
  } catch (error) {
    console.error('Activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

router.get('/sleep', async (req: Request, res: Response) => {
  try {
    const { ouraTokens } = getTokensFromEnv();

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing startDate or endDate parameter' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date parameters' });
    }

    if (!ouraTokens) {
      return res.json([]);
    }

    const sleepData = await ouraService.getSleepData(ouraTokens, start, end);

    res.json(sleepData);
  } catch (error) {
    console.error('Sleep data error:', error);
    res.status(500).json({ error: 'Failed to fetch sleep data' });
  }
});

router.get('/readiness', async (req: Request, res: Response) => {
  try {
    const { ouraTokens } = getTokensFromEnv();

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing startDate or endDate parameter' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date parameters' });
    }

    if (!ouraTokens) {
      return res.json([]);
    }

    const readinessData = await ouraService.getReadinessData(
      ouraTokens,
      start,
      end
    );

    res.json(readinessData);
  } catch (error) {
    console.error('Readiness data error:', error);
    res.status(500).json({ error: 'Failed to fetch readiness data' });
  }
});

export default router;
