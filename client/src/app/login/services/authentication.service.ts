import Session from 'supertokens-web-js/recipe/session';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { AuthToken as AccessToken } from '../../shared/models/AccessToken';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import {
  ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  AUTH_TOKEN_LOCAL_STORAGE_KEY,
} from '../../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private localStorageService: LocalStorageService =
    inject(LocalStorageService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private isLoggedInSignal = signal(false);

  constructor() {
    effect(async () => {
      console.log('checking if user is logged in');
      const isLoggedIn = await Session.doesSessionExist();
      console.log({ isLoggedIn });
      this.isLoggedInSignal.set(isLoggedIn);
    });
  }

  async startOauthLogin() {
    const url =
      (await firstValueFrom(
        this.http.get(`${environment.API_URL}/auth/get-oauth-code`)
      )) ?? '/';
    location.href = url as string;
  }

  getAccessToken(): AccessToken | null {
    return this.localStorageService.get(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
  }

  setAccessToken(accessToken: AccessToken | ''): void {
    if (accessToken === '') {
      this.localStorageService.set(ACCESS_TOKEN_LOCAL_STORAGE_KEY, accessToken);
      return;
    }

    this.localStorageService.set(ACCESS_TOKEN_LOCAL_STORAGE_KEY, accessToken);
  }

  getAuthToken(): string {
    return this.localStorageService.get(AUTH_TOKEN_LOCAL_STORAGE_KEY);
  }

  isAccessTokenExpired(): boolean {
    return (this.getAccessToken()?.expiry ?? -1) <= Date.now() - 60000;
  }

  doesAccessTokenExist(): boolean {
    return this.getAccessToken() !== null;
  }

  async refreshAndSetTokens(
    accessToken: AccessToken | null,
    username: string
  ): Promise<void> {
    if (!accessToken) {
      console.error('no access token present');
      return;
    }

    const {
      authToken,
      accessToken: newAccessToken,
      username: newUsername,
    } = await firstValueFrom(
      this.http.post<
        Promise<{
          authToken: string;
          accessToken: AccessToken;
          username: string;
        }>
      >(`${environment.API_URL}/auth/refresh-tokens`, {
        refreshToken: accessToken.refresh_token,
        username,
      })
    );

    this.setAccessToken(newAccessToken);
    this.localStorageService.set('authToken', authToken);
    this.localStorageService.set('username', username);
    return;
  }

  async logout(): Promise<void> {
    console.log('good bye!');
    await new Promise((resolve) => setTimeout(resolve, 500));
    await Session.signOut();
    window.location.href = '/';
  }

  isUserLoggedIn() {
    return this.isLoggedInSignal.asReadonly();
  }

  test() {
    return this.http.get(`${environment.API_URL}/reddit/test`);
  }
}
