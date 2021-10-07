export const slackAcknowledge = () => {
  return { response_type: 'in_channel' };
};

export const slackRespondEphemeral = (text: string) => {
  return {
    response_type: 'ephemeral',
    text,
  };
};

export const slackRespondInChannel = (text: string) => {
  return {
    response_type: 'in_channel',
    text,
  };
};
