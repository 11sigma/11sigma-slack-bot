import Dotenv from 'dotenv';

import { init } from './server.js';

Dotenv.config();

try {
  const server = await init();

  const address = server.address();
  if (!address) {
    throw new Error('Server address is not defined');
  }

  if (typeof address === 'string') {
    console.log(`🙌 Server started at ${address}`);
  } else {
    console.log(`🙌 Server started at http://[${address.address}]:${address.port}`);
  }
} catch (error) {
  console.error(error);
  process.exit(1);
}
