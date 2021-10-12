import { getConfig } from '../config.js';

import type Bolt from '@slack/bolt';

export const hello = (app: Bolt.App) => {
  app.command(`/${getConfig('COMMANDS_PREFIX')}hello`, async ({ command, ack }) => {
    await ack({
      replace_original: false,
      text: `Hello, <@${command.user_id}>!`,
      response_type: 'in_channel',
    });
  });
};
