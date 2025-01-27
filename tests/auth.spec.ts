import { strict as assert } from 'assert';
import request from 'supertest';
import app from '../src/app';

describe('Authentication & Authorization', () => {
    let authToken: string;

    describe('POST /lime/authenticate', () => {
        it('should authenticate existing user', async () => {
            const response = await request(app)
                .post('/lime/authenticate')
                .send({
                    username: 'alice',
                    password: 'alice'
                });

            assert.equal(response.status, 200);
            assert.ok(response.body.token);
            authToken = response.body.token;
        });

        it('should reject invalid credentials', async () => {
            const response = await request(app)
                .post('/lime/authenticate')
                .send({
                    username: 'wrong',
                    password: 'wrong'
                });

            assert.equal(response.status, 401);
        });
    });

    describe('Transaction endpoints with auth', () => {
        const validHash = '0xfc2b3b6db38a51db3b9cb95de29b719de8deb99630626e4b4b99df056ffb7f2e';

        it('should track transactions for authenticated user', async () => {
            // First fetch transaction
            await request(app)
                .get(`/lime/eth?transactionHashes=${validHash}`)
                .set('AUTH_TOKEN', authToken);

            // Then check user's transactions
            const myTxResponse = await request(app)
                .get('/lime/my')
                .set('AUTH_TOKEN', authToken);

            assert.equal(myTxResponse.status, 200);
            assert.ok(Array.isArray(myTxResponse.body.transactions));
            assert.ok(myTxResponse.body.transactions.some(
                (tx: any) => tx.transactionHash === validHash
            ));
        });

        it('should allow anonymous transaction fetch', async () => {
            const response = await request(app)
                .get(`/lime/eth?transactionHashes=${validHash}`);

            assert.equal(response.status, 200);
        });

        it('should require auth for /my endpoint', async () => {
            const response = await request(app)
                .get('/lime/my');

            assert.equal(response.status, 401);
        });
    });
});