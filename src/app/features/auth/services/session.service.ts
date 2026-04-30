import { Injectable } from '@angular/core';

/**
 * Session Service
 * Manages authentication token storage in browser session storage.
 * 
 * Storage scope: sessionStorage (automatically cleared when tab closes)
 * Token key: "auth_token"
 */
@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly TOKEN_KEY = 'auth_token';

  /**
   * Store authentication token in session storage
   * @param token - The token string to store
   */
  setToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Retrieve authentication token from session storage
   * @returns Token string if present, null if absent
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if authentication token exists
   * @returns true if token is present, false otherwise
   */
  hasToken(): boolean {
    return sessionStorage.getItem(this.TOKEN_KEY) !== null;
  }

  /**
   * Clear authentication token from session storage
   * Useful for logout flows (future enhancement)
   */
  clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }
}
