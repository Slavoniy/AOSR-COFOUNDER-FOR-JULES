import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('server.ts no longer uses Math.random() for ID generation', () => {
    const serverCode = fs.readFileSync('server.ts', 'utf-8');

    // Ensure crypto.randomUUID() is used
    assert.ok(serverCode.includes('crypto.randomUUID()'), 'crypto.randomUUID() should be used in server.ts');

    // Ensure Math.random() is NOT used
    assert.ok(!serverCode.includes('Math.random()'), 'Math.random() should no longer be used for ID generation in server.ts');
});
