import { getConfig } from '../config.js';
import * as Google from '../googledrive.js';

import type Bolt from '@slack/bolt';

const PTO_DAYS = 15;

export const pto = (app: Bolt.App) => {
  app.command(`/${getConfig('COMMANDS_PREFIX')}pto`, async ({ payload: { user_id }, ack }) => {
    const user = await app.client.users.info({ user: user_id });
    const email = user.user?.profile?.email;

    if (!email) {
      return ack('You need to set your email in your profile');
    }
    const ptoLeft = await calculatePtoLeft(email);
    return ack(`You have ${ptoLeft} days of PTO left`);
  });
};

async function calculatePtoLeft(email: string) {
  const res = await Google.listFilesForUser(email);
  const fileId = res.data.files?.[0]?.id;
  if (!fileId) {
    return PTO_DAYS;
  }

  const file = await Google.readFile(fileId);
  if (!file.data.values) {
    return PTO_DAYS;
  }

  const currentYear = new Date().getUTCFullYear();

  const datesOffThisYear = file.data.values
    .flat()
    .filter((val) => !!val)
    .map((val) => String(val).trim())
    .filter((val) => parseSheetDate(val) === currentYear);

  const usedPto = datesOffThisYear.length;
  const leftPto = PTO_DAYS - usedPto;

  return leftPto;
}

function parseSheetDate(value: string) {
  return Number(value.split('-')[2]);
}
