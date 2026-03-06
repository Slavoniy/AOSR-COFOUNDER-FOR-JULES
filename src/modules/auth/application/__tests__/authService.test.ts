import { test, describe, before, afterEach } from 'node:test';
import assert from 'node:assert';
import { AuthService } from '../authService.ts';

describe('AuthService', () => {
  let authService: AuthService;
  let originalFetch: typeof fetch;

  before(() => {
    authService = new AuthService();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('register throws error with server message on non-ok response', async () => {
    const errorMessage = 'Email already exists';
    // @ts-ignore
    global.fetch = async () => ({
      ok: false,
      json: async () => ({ error: errorMessage })
    } as Response);

    await assert.rejects(
      authService.register('Test User', 'test@example.com', 'password123'),
      {
        name: 'Error',
        message: errorMessage
      }
    );
  });

  test('register throws default error message on non-ok response without error field', async () => {
    // @ts-ignore
    global.fetch = async () => ({
      ok: false,
      json: async () => ({})
    } as Response);

    await assert.rejects(
      authService.register('Test User', 'test@example.com', 'password123'),
      {
        name: 'Error',
        message: 'Registration failed'
      }
    );
  });
});
