Ethereum Transaction Fetcher API Documentation
Overview
REST API server that fetches and stores Ethereum transactions using provided transaction hashes. Implemented with Node.js, TypeScript, PostgreSQL.

Architecture:

   Key Components:

      Database: PostgreSQL with tables for transactions, users, user_transactions
      Authentication: JWT-based with predefined users
      Ethereum Integration: Infura provider for fetching transaction data

   Technologies:

      Node.js & TypeScript
      Express.js for REST API
      ethers.js for Ethereum interaction
      PostgreSQL for data persistence
      Docker for containerization

Running the Server

# With Docker
docker-compose up

# Without Docker
npm install
npm start

   API_PORT=3000
   ETH_NODE_URL=https://sepolia.infura.io/v3/YOUR-PROJECT-ID
   DB_CONNECTION_URL=postgresql://username:password@localhost:5432/postgres
   JWT_SECRET=your-secret-key

API Endpoints:
   /lime/eth
   GET request that fetches transaction data.
   Query Parameters:

   transactionHashes: List of transaction hash strings

   Optional Header:

   AUTH_TOKEN: JWT token for tracking user queries

   Response:

   {
      "transactions": [
         {
               "transactionHash": string,
               "transactionStatus": number,
               "blockHash": string,
               "blockNumber": number,
               "from": string,
               "to": string|null,
               "contractAddress": string|null,
               "logsCount": number,
               "input": string,
               "value": string
         }
      ]
   }

   /lime/all
   GET request returning all stored transactions.

   /lime/eth/:rlphex
   GET request accepting RLP encoded transaction hashes.
   Parameters:

   rlphex: Hexadecimal RLP encoded list of transaction hashes

Authentication Endpoints
   /lime/authenticate
   POST request for user authentication.
   Body:

   {
      "username": string,
      "password": string
   }

   Response:

   {
      "token": string
   }

   /lime/my
   GET request returning user's queried transactions.
   Required Header:

   AUTH_TOKEN: JWT token

Default Users

   alice/alice
   bob/bob
   carol/carol
   dave/dave

Testing

   npm test

Docker Support

   docker build -t limeapi .
   docker run limeapi