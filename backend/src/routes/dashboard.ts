import { Router, Request, Response } from 'express';
import stravaService from '../services/strava';
import ouraService from '../services/oura';
import { aggregateDashboardData } from '../utils/dataAggregation';

const router = Router();

function requireAuth(req: Request, res: Response, next: Function) {
  // Allow partial auth - require at least ONE service
  if (!req.session.stravaTokens && !req.session.ouraTokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

router.get('/data', requireAuth, async (req: Request, res: Response) => {
  try {
    console.log(`[Dashboard Data] Session ID: ${req.sessionID}`);
    console.log(`[Dashboard Data] Tokens:`, {
      hasStrava: !!req.session.stravaTokens,
      hasOura: !!req.session.ouraTokens
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
      req.session.stravaTokens
        ? stravaService.getActivities(req.session.stravaTokens, startDate, endDate)
        : Promise.resolve([]),
      req.session.ouraTokens
        ? ouraService.getSleepData(req.session.ouraTokens, startDate, endDate)
        : Promise.resolve([]),
      req.session.ouraTokens
        ? ouraService.getReadinessData(req.session.ouraTokens, startDate, endDate)
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

router.get('/activities', requireAuth, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing startDate or endDate parameter' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date parameters' });
    }

    if (!req.session.stravaTokens) {
      return res.json([]);
    }

    const activities = await stravaService.getActivities(
      req.session.stravaTokens,
      start,
      end
    );

    res.json(activities);
  } catch (error) {
    console.error('Activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

router.get('/sleep', requireAuth, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing startDate or endDate parameter' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date parameters' });
    }

    if (!req.session.ouraTokens) {
      return res.json([]);
    }

    const sleepData = await ouraService.getSleepData(req.session.ouraTokens, start, end);

    res.json(sleepData);
  } catch (error) {
    console.error('Sleep data error:', error);
    res.status(500).json({ error: 'Failed to fetch sleep data' });
  }
});

router.get('/readiness', requireAuth, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing startDate or endDate parameter' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date parameters' });
    }

    if (!req.session.ouraTokens) {
      return res.json([]);
    }

    const readinessData = await ouraService.getReadinessData(
      req.session.ouraTokens,
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
