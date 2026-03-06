import test from 'node:test';
import assert from 'node:assert';
import { AuthService } from './authService.ts';

test('AuthService', async (t) => {
  let authService: AuthService;
  const originalFetch = global.fetch;

  t.beforeEach(() => {
    // Re-instantiate to have a clean state between tests
    authService = new AuthService();
  });

  await t.test('register', async (st) => {
    st.afterEach(() => {
      // Restore global fetch after each test
      global.fetch = originalFetch;
    });

    await st.test('should successfully register a user and update currentUser', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'engineer' as const,
      };

      global.fetch = async (input, init) => {
        assert.strictEqual(input, '/api/auth/register');
        assert.strictEqual(init?.method, 'POST');
        assert.deepStrictEqual(init?.headers, { 'Content-Type': 'application/json' });
        assert.strictEqual(init?.body, JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }));

        return {
          ok: true,
          json: async () => mockUser,
        } as Response;
      };

      const user = await authService.register('Test User', 'test@example.com', 'password123');

      assert.deepStrictEqual(user, mockUser);
      assert.deepStrictEqual(authService.getCurrentUser(), mockUser);
      assert.strictEqual(authService.isAuthenticated(), true);
    });

    await st.test('should throw an error with message from response if registration fails', async () => {
      global.fetch = async () => {
        return {
          ok: false,
          json: async () => ({ error: 'Email already exists' }),
        } as Response;
      };

      await assert.rejects(
        async () => {
          await authService.register('Test User', 'test@example.com', 'password123');
        },
        (err: Error) => {
          assert.strictEqual(err.message, 'Email already exists');
          return true;
        }
      );

      assert.strictEqual(authService.getCurrentUser(), null);
      assert.strictEqual(authService.isAuthenticated(), false);
    });

    await st.test('should fallback to default error message if registration fails and no error string is provided', async () => {
      global.fetch = async () => {
        return {
          ok: false,
          json: async () => ({}), // no error property
        } as Response;
      };

      await assert.rejects(
        async () => {
          await authService.register('Test User', 'test@example.com', 'password123');
        },
        (err: Error) => {
          assert.strictEqual(err.message, 'Registration failed');
          return true;
        }
      );

      assert.strictEqual(authService.getCurrentUser(), null);
    });

    await st.test('should propagate network errors from fetch', async () => {
      global.fetch = async () => {
        throw new Error('Network timeout');
      };

      await assert.rejects(
        async () => {
          await authService.register('Test User', 'test@example.com', 'password123');
        },
        (err: Error) => {
          assert.strictEqual(err.message, 'Network timeout');
          return true;
        }
      );

      assert.strictEqual(authService.getCurrentUser(), null);
    });
  });
});
