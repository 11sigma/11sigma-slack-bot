import { object, string, optional, λ, boolean, refine } from '@typeofweb/schema';

import type { TypeOf } from '@typeofweb/schema';

const stringToBoolean = refine(
  (value, t) => {
    if (value === 'true') {
      return t.nextValid(true);
    }
    if (value === 'false') {
      return t.nextValid(false);
    }
    return t.nextValid(value);
  },
  () => 'bool',
);

export const slackSlashCommandValidator = object(
  {
    token: string(),
    command: string(),
    text: string(),
    response_url: string(),
    trigger_id: string(),
    user_id: string(),
    user_name: string(),
    api_app_id: string(),

    team_id: optional(string()),
    enterprise_id: optional(string()),
    team_domain: optional(string()),
    channel_id: optional(string()),
    channel_name: optional(string()),
    is_enterprise_install: λ(boolean, stringToBoolean),
  },
  { allowUnknownKeys: true },
)();

export type SlackSlashCommand = TypeOf<typeof slackSlashCommandValidator>;
