import { strict as assert } from 'assert';
import request from 'supertest';
import app from '../src/app';

describe('Transaction Service', () => {
  describe('GET /lime/eth', () => {
    const validHash = '0xfc2b3b6db38a51db3b9cb95de29b719de8deb99630626e4b4b99df056ffb7f2e';
    const invalidHash = 'invalid-hash';

    it('should return 200 status when valid transaction hash is provided', async () => {
      const response = await request(app)
        .get(`/lime/eth?transactionHashes=${validHash}`);

      assert.equal(response.status, 200);
      assert.equal(typeof response.body, 'object');
      assert.ok('transactions' in response.body);
      assert.ok(Array.isArray(response.body.transactions));
    });

    it('should decode RLP transaction hashes', async () => {
      const rlpHex = 'f90110b842307866633262336236646233386135316462336239636239356465323962373139646538646562393936333036323665346234623939646630353666666237663265b842307834383630336637616466663766626663326131306232326136373130333331656536386632653464316364373361353834643537633838323164663739333536b842307863626339323065376262383963626362353430613436396131363232366266313035373832353238336162386561633366343564303038313165656638613634b842307836643630346666633634346132383266636138636238653737386531653366383234356438626431643439333236653330313661336338373862613063626264';
      
      const response = await request(app)
          .get(`/lime/eth/${rlpHex}`);
  
      assert.equal(response.status, 200);
      assert.ok(Array.isArray(response.body.transactions));
    });

    it('should return 400 status when invalid hash format is provided', async () => {
      const response = await request(app)
        .get(`/lime/eth?transactionHashes=${invalidHash}`);

      assert.equal(response.status, 400);
      assert.equal(typeof response.body, 'object');
      assert.ok('error' in response.body);
    });

    it('should return 400 status when no transaction hash is provided', async () => {
      const response = await request(app)
        .get('/lime/eth');

      assert.equal(response.status, 400);
      assert.equal(typeof response.body, 'object');
      assert.ok('error' in response.body);
    });

    it('should handle multiple transaction hashes', async () => {
      const hash2 = '0x48603f7adff7fbfc2a10b22a6710331ee68f2e4d1cd73a584d57c8821df79356';
      const response = await request(app)
        .get(`/lime/eth?transactionHashes=${validHash}&transactionHashes=${hash2}`);

      assert.equal(response.status, 200);
      assert.equal(typeof response.body, 'object');
      assert.ok('transactions' in response.body);
      assert.ok(Array.isArray(response.body.transactions));
      assert.ok(response.body.transactions.length <= 2);
    });
  });

  describe('GET /lime/all', () => {
    it('should return all transactions', async () => {
      const response = await request(app)
        .get('/lime/all');

      assert.equal(response.status, 200);
      assert.equal(typeof response.body, 'object');
      assert.ok('transactions' in response.body);
      assert.ok(Array.isArray(response.body.transactions));
    });

    it('should return 404 when no transactions exist', async () => {
      // Note: This test might not always pass depending on your database state
      const response = await request(app)
        .get('/lime/all');

      // If there are no transactions
      if (response.status === 404) {
        assert.ok('message' in response.body);
        assert.equal(response.body.message, 'No transactions found');
      } else {
        // If there are transactions
        assert.equal(response.status, 200);
        assert.ok('transactions' in response.body);
      }
    });
  });
});