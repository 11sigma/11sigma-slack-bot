import { slackRespondInChannel } from '../utils';

export const helloCommand = () => {
  return slackRespondInChannel(`Hello!`);
};
