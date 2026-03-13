import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('server.ts no longer uses Math.random() for ID generation', () => {
    const serverCode = fs.readFileSync('server.ts', 'utf-8');
    const authCode = fs.readFileSync('src/modules/auth/infrastructure/authRouter.ts', 'utf-8');
    const projectCode = fs.readFileSync('src/modules/projects/infrastructure/projectRouter.ts', 'utf-8');
    const estimateCode = fs.readFileSync('src/modules/ai-engine/infrastructure/estimateRouter.ts', 'utf-8');
    const notifCode = fs.readFileSync('src/modules/notifications/infrastructure/notificationRouter.ts', 'utf-8');
    const allCode = serverCode + authCode + projectCode + estimateCode + notifCode;


    // Ensure crypto.randomUUID() is used
    assert.ok(allCode.includes('crypto.randomUUID()'), 'crypto.randomUUID() should be used in server.ts');

    // Ensure Math.random() is NOT used
    assert.ok(!allCode.includes('Math.random()'), 'Math.random() should no longer be used for ID generation in server.ts');
});
