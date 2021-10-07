import { createPlugin } from '@typeofweb/server';

import { handleSlackSlashCommand } from './handler';
import { slackSlashCommandValidator } from './validator';

export const slackSlashCommandsPlugin = createPlugin('slack-slash-commands', (app) => {
  app.route({
    path: '/api/integration/slack/commands',
    method: 'post',
    validation: {
      payload: slackSlashCommandValidator,
    },
    handler(request) {
      // @todo verify request

      return handleSlackSlashCommand(request.payload);
    },
  });
});
