import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
    // Clear session storage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    // Clean up session storage after each test
    sessionStorage.clear();
  });

  describe('setToken', () => {
    it('should store token in sessionStorage', () => {
      const token = 'test_token_12345';
      service.setToken(token);
      expect(sessionStorage.getItem('auth_token')).toBe(token);
    });

    it('should overwrite existing token', () => {
      service.setToken('old_token');
      service.setToken('new_token');
      expect(sessionStorage.getItem('auth_token')).toBe('new_token');
    });
  });

  describe('getToken', () => {
    it('should retrieve stored token from sessionStorage', () => {
      const token = 'test_token_12345';
      sessionStorage.setItem('auth_token', token);
      expect(service.getToken()).toBe(token);
    });

    it('should return null when token is not present', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return empty string if empty token was stored', () => {
      sessionStorage.setItem('auth_token', '');
      expect(service.getToken()).toBe('');
    });
  });

  describe('hasToken', () => {
    it('should return true when token is present', () => {
      sessionStorage.setItem('auth_token', 'some_token');
      expect(service.hasToken()).toBe(true);
    });

    it('should return false when token is not present', () => {
      expect(service.hasToken()).toBe(false);
    });

    it('should return true even if token is empty string', () => {
      sessionStorage.setItem('auth_token', '');
      expect(service.hasToken()).toBe(true);
    });
  });

  describe('clearToken', () => {
    it('should remove token from sessionStorage', () => {
      sessionStorage.setItem('auth_token', 'test_token');
      service.clearToken();
      expect(sessionStorage.getItem('auth_token')).toBeNull();
    });

    it('should not throw error when clearing non-existent token', () => {
      expect(() => service.clearToken()).not.toThrow();
    });
  });

  describe('token persistence across component lifecycle', () => {
    it('should maintain token through multiple get/set operations', () => {
      const token1 = 'token_1';
      const token2 = 'token_2';

      service.setToken(token1);
      expect(service.getToken()).toBe(token1);

      service.setToken(token2);
      expect(service.getToken()).toBe(token2);
      expect(service.hasToken()).toBe(true);

      service.clearToken();
      expect(service.getToken()).toBeNull();
      expect(service.hasToken()).toBe(false);
    });
  });
});
