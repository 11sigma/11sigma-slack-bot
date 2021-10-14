import Bolt from '@slack/bolt';

import { hello } from './commands/hello.js';
import { pto } from './commands/pto.js';
import { getConfig } from './config.js';

export function init() {
  const app = new Bolt.App({
    token: getConfig('SLACK_BOT_TOKEN'),
    signingSecret: getConfig('SLACK_SIGNING_SECRET'),
    customRoutes: [
      {
        path: '/',
        method: ['GET'],
        handler: (_req, res) => {
          res.writeHead(200);
          res.end(`It's working!`);
        },
      },
    ],
  });

  initCommands(app);

  return app.start(getConfig('PORT'));
}

function initCommands(app: Bolt.App) {
  hello(app);
  pto(app);
}
