import { createApp } from '@typeofweb/server';

import { getConfig } from './config';
import { slackSlashCommandsPlugin } from './integrations/slack/http';

export async function init() {
  const app = createApp({
    port: getConfig('PORT'),
    hostname: getConfig('HOST'),
  });

  await app.plugin(slackSlashCommandsPlugin);
  return app.start();
}
