import axios, { AxiosInstance } from 'axios';
import { OuraSleep, OuraReadiness, OuraHeartRate, OAuthTokenResponse, TokenData } from '../types';
import cache from './cache';

class OuraService {
  private baseURL = 'https://api.ouraring.com';
  private authURL = 'https://cloud.ouraring.com/oauth';  // For authorization only
  private tokenURL = 'https://api.ouraring.com/oauth';    // For token exchange

  private createClient(accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async exchangeToken(code: string): Promise<TokenData> {
    try {
      const params = new URLSearchParams({
        client_id: process.env.OURA_CLIENT_ID!,
        client_secret: process.env.OURA_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.OURA_REDIRECT_URI!,
      });

      console.log('🔍 Oura Token Exchange Request:');
      console.log('  URL:', `${this.tokenURL}/token`);
      console.log('  Client ID:', process.env.OURA_CLIENT_ID);
      console.log('  Client Secret Length:', process.env.OURA_CLIENT_SECRET?.length);
      console.log('  Client Secret First 10 chars:', process.env.OURA_CLIENT_SECRET?.substring(0, 10) + '...');
      console.log('  Redirect URI:', process.env.OURA_REDIRECT_URI);
      console.log('  Code Length:', code.length);
      console.log('  Grant Type:', 'authorization_code');

      const response = await axios.post<OAuthTokenResponse>(
        `${this.tokenURL}/token`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          maxRedirects: 0,  // Disable redirects to prevent api -> cloud redirect
        }
      );

      console.log('✅ Oura token exchange successful');
      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: Date.now() + response.data.expires_in * 1000,
      };
    } catch (error: any) {
      console.error('❌ Oura Token Exchange Failed:');
      console.error('  Status:', error.response?.status);
      console.error('  Error:', error.response?.data?.error);
      console.error('  Description:', error.response?.data?.error_description);
      console.error('  Full Response:', JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenData> {
    const params = new URLSearchParams({
      client_id: process.env.OURA_CLIENT_ID!,
      client_secret: process.env.OURA_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await axios.post<OAuthTokenResponse>(
      `${this.tokenURL}/token`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

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
    try {
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
    } catch (error) {
      console.error('[Oura Service] Failed to fetch sleep data:', error);
      return [];
    }
  }

  async getReadinessData(
    tokens: TokenData,
    startDate: Date,
    endDate: Date
  ): Promise<OuraReadiness[]> {
    try {
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
    } catch (error) {
      console.error('[Oura Service] Failed to fetch readiness data:', error);
      return [];
    }
  }

  async getHeartRateData(
    tokens: TokenData,
    startDate: Date,
    endDate: Date
  ): Promise<OuraHeartRate[]> {
    try {
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
    } catch (error) {
      console.error('[Oura Service] Failed to fetch heart rate data:', error);
      return [];
    }
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
