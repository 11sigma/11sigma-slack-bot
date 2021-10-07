import { helloCommand } from './commands/hello';

import type { SlackSlashCommand } from './validator';

const COMMAND_PREFIX = '/11' as const;
const COMMAND_PREFIX_PATTERN = new RegExp(`^${COMMAND_PREFIX}`);

export const handleSlackSlashCommand = (command: SlackSlashCommand) => {
  const parsedCommand = parseCommandText(command.command);

  switch (parsedCommand) {
    case 'hello':
      return helloCommand();
    default:
      return null;
  }
};

const parseCommandText = (text: string) => {
  return text.split(/\s+/)[0]?.trim().replace(COMMAND_PREFIX_PATTERN, '');
};
