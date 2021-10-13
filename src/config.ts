declare global {
  namespace NodeJS {
    // @ts-ignore
    interface ProcessEnv extends ParsedProcessEnv {}
  }
}

interface ParsedProcessEnv {
  readonly PORT: number;
  readonly HOST: string;
  readonly SLACK_BOT_TOKEN: string;
  readonly SLACK_SIGNING_SECRET: string;
  readonly COMMANDS_PREFIX: string;
  readonly GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  readonly GOOGLE_SERVICE_ACCOUNT_KEY: string;
  readonly GOOGLE_SERVICE_ACCOUNT_KEYID: string;
}

export const getConfig = <N extends keyof ParsedProcessEnv>(name: N): ParsedProcessEnv[N] => {
  /* eslint-disable @typescript-eslint/consistent-type-assertions -- ok */
  const value = process.env[name] as string;
  if (!value) {
    throw new Error(`Missing env variable: ${name}`);
  }

  switch (name) {
    case 'HOST':
      return value as ParsedProcessEnv[N];
    case 'PORT':
      return Number.parseInt(value) as ParsedProcessEnv[N];
    case 'SLACK_BOT_TOKEN':
    case 'SLACK_SIGNING_SECRET':
    case 'COMMANDS_PREFIX':
    case 'GOOGLE_SERVICE_ACCOUNT_EMAIL':
    case 'GOOGLE_SERVICE_ACCOUNT_KEY':
    case 'GOOGLE_SERVICE_ACCOUNT_KEYID':
      return value as ParsedProcessEnv[N];
  }

  throw new Error(`Unknown env variable: ${name}`);

  /* eslint-enable @typescript-eslint/consistent-type-assertions -- ok */
};
