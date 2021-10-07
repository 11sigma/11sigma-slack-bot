import Dotenv from 'dotenv';

import { init } from './server';

Dotenv.config();

init()
  .then((server) => {
    console.log(`🙌 Server started at ${server.address?.toString()}`);
  })
  .catch(console.error);
