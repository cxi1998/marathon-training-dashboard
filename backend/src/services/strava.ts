import axios, { AxiosInstance } from 'axios';
import { StravaActivity, StravaStats, OAuthTokenResponse, TokenData } from '../types';
import cache from './cache';

class StravaService {
  private baseURL = 'https://www.strava.com/api/v3';
  private authURL = 'https://www.strava.com/oauth';

  private createClient(accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async exchangeToken(code: string): Promise<TokenData> {
    const response = await axios.post<OAuthTokenResponse>(`${this.authURL}/token`, {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: Date.now() + response.data.expires_in * 1000,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenData> {
    const response = await axios.post<OAuthTokenResponse>(`${this.authURL}/token`, {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: Date.now() + response.data.expires_in * 1000,
    };
  }

  private async ensureValidToken(tokens: TokenData): Promise<string> {
    if (Date.now() >= tokens.expiresAt) {
      const newTokens = await this.refreshToken(tokens.refreshToken);
      return newTokens.accessToken;
    }
    return tokens.accessToken;
  }

  async getActivities(
    tokens: TokenData,
    startDate: Date,
    endDate: Date
  ): Promise<StravaActivity[]> {
    const cacheKey = cache.generateKey('strava:activities', {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });

    const cached = cache.get<StravaActivity[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const accessToken = await this.ensureValidToken(tokens);
    const client = this.createClient(accessToken);

    const after = Math.floor(startDate.getTime() / 1000);
    const before = Math.floor(endDate.getTime() / 1000);

    console.log('[Strava] Fetching activities:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      after,
      before,
    });

    const activities: StravaActivity[] = [];
    let page = 1;
    const perPage = 200;

    while (true) {
      const response = await client.get<StravaActivity[]>('/athlete/activities', {
        params: {
          after,
          before,
          page,
          per_page: perPage,
        },
      });

      console.log(`[Strava] Page ${page}: ${response.data.length} activities`);

      if (response.data.length === 0) break;

      activities.push(...response.data);

      if (response.data.length < perPage) break;
      page++;
    }

    console.log(`[Strava] Total activities fetched: ${activities.length}`);

    const runActivities = activities.filter(
      (activity) =>
        activity.type === 'Run' ||
        activity.sport_type === 'Run' ||
        activity.sport_type === 'TrailRun'
    );

    console.log(`[Strava] Run activities after filter: ${runActivities.length}`);

    cache.set(cacheKey, runActivities);
    return runActivities;
  }

  async getAthleteStats(tokens: TokenData, athleteId: number): Promise<StravaStats> {
    const cacheKey = cache.generateKey('strava:stats', { athleteId });

    const cached = cache.get<StravaStats>(cacheKey);
    if (cached) {
      return cached;
    }

    const accessToken = await this.ensureValidToken(tokens);
    const client = this.createClient(accessToken);

    const response = await client.get<StravaStats>(`/athletes/${athleteId}/stats`);

    cache.set(cacheKey, response.data, 1800);
    return response.data;
  }

  async getAthlete(tokens: TokenData): Promise<{ id: number; username: string }> {
    const accessToken = await this.ensureValidToken(tokens);
    const client = this.createClient(accessToken);

    const response = await client.get<{ id: number; username: string }>('/athlete');
    return response.data;
  }

  getAuthorizationURL(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID!,
      redirect_uri: process.env.STRAVA_REDIRECT_URI!,
      response_type: 'code',
      scope: 'activity:read_all',
      state,
    });

    return `${this.authURL}/authorize?${params.toString()}`;
  }
}

export default new StravaService();
