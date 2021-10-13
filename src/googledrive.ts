import Google from 'googleapis';

import { getConfig } from './config.js';

const PTO_FOLDER_ID = '1ATzZjHRGCKIWyWwqewrtB3Pde4ub4vrY';
const PTO_SHEET_NAME = 'Dates';

const getAuth = () => {
  return new Google.Auth.JWT({
    email: getConfig('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
    key: getConfig('GOOGLE_SERVICE_ACCOUNT_KEY'),
    keyId: getConfig('GOOGLE_SERVICE_ACCOUNT_KEYID'),
    scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
};

const getDriveClient = () => {
  const auth = getAuth();
  return new Google.drive_v3.Drive({ auth });
};

const getSheetsClient = () => {
  const auth = getAuth();
  return new Google.sheets_v4.Sheets({ auth });
};

export const listFilesForUser = (email: string) => {
  const driveClient = getDriveClient();
  return driveClient.files.list({
    pageSize: 10,
    fields: 'files(*)',
    q: `${JSON.stringify(PTO_FOLDER_ID)} in parents and name = ${JSON.stringify(email)}`,
  });
};

export const readFile = (fileId: string) => {
  const sheetsClient = getSheetsClient();
  return sheetsClient.spreadsheets.values.get({
    spreadsheetId: fileId,
    range: `${PTO_SHEET_NAME}!A:Z`,
  });
};
