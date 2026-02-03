import axios, { AxiosInstance } from 'axios';
import { OuraSleep, OuraReadiness, OuraHeartRate, OAuthTokenResponse, TokenData } from '../types';
import cache from './cache';

class OuraService {
  private baseURL = 'https://api.ouraring.com';
  private authURL = 'https://cloud.ouraring.com/oauth';

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
      client_id: process.env.OURA_CLIENT_ID,
      client_secret: process.env.OURA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.OURA_REDIRECT_URI,
    });

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: Date.now() + response.data.expires_in * 1000,
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenData> {
    const response = await axios.post<OAuthTokenResponse>(`${this.authURL}/token`, {
      client_id: process.env.OURA_CLIENT_ID,
      client_secret: process.env.OURA_CLIENT_SECRET,
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

  async getSleepData(
    tokens: TokenData,
    startDate: Date,
    endDate: Date
  ): Promise<OuraSleep[]> {
    const cacheKey = cache.generateKey('oura:sleep', {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });

    const cached = cache.get<OuraSleep[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const accessToken = await this.ensureValidToken(tokens);
    const client = this.createClient(accessToken);

    const response = await client.get<{ data: OuraSleep[] }>('/v2/usercollection/daily_sleep', {
      params: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      },
    });

    cache.set(cacheKey, response.data.data);
    return response.data.data;
  }

  async getReadinessData(
    tokens: TokenData,
    startDate: Date,
    endDate: Date
  ): Promise<OuraReadiness[]> {
    const cacheKey = cache.generateKey('oura:readiness', {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });

    const cached = cache.get<OuraReadiness[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const accessToken = await this.ensureValidToken(tokens);
    const client = this.createClient(accessToken);

    const response = await client.get<{ data: OuraReadiness[] }>(
      '/v2/usercollection/daily_readiness',
      {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        },
      }
    );

    cache.set(cacheKey, response.data.data);
    return response.data.data;
  }

  async getHeartRateData(
    tokens: TokenData,
    startDate: Date,
    endDate: Date
  ): Promise<OuraHeartRate[]> {
    const cacheKey = cache.generateKey('oura:heartrate', {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    });

    const cached = cache.get<OuraHeartRate[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const accessToken = await this.ensureValidToken(tokens);
    const client = this.createClient(accessToken);

    const response = await client.get<{ data: OuraHeartRate[] }>('/v2/usercollection/heartrate', {
      params: {
        start_datetime: startDate.toISOString(),
        end_datetime: endDate.toISOString(),
      },
    });

    cache.set(cacheKey, response.data.data);
    return response.data.data;
  }

  getAuthorizationURL(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.OURA_CLIENT_ID!,
      redirect_uri: process.env.OURA_REDIRECT_URI!,
      response_type: 'code',
      scope: 'daily heartrate',
      state,
    });

    return `${this.authURL}/authorize?${params.toString()}`;
  }
}

export default new OuraService();
