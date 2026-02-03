const request = require('supertest');
const app = require('../src/app');

describe('Health Check Endpoint', () => {
    it('should return 200 and OK status', async () => {
        const res = await request(app).get('/api/health');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('message');
        expect(res.body.services).toBeDefined();
    });

    it('should contain timestamp', async () => {
        const res = await request(app).get('/api/health');
        expect(res.body.timestamp).toBeDefined();
    });
});
