import { performance } from 'perf_hooks';

import Ivm from 'isolated-vm';
import { default as Ts } from 'typescript';

import { getConfig } from '../config.js';
import { tryCatch } from '../utils.js';

import type Bolt from '@slack/bolt';

export const execute = (app: Bolt.App) => {
  app.command(`/${getConfig('COMMANDS_PREFIX')}execute`, async ({ ack, body, say }) => {
    console.log(body.text);
    const parsingResult = tryCatch(() => parseMessage(body.text));

    if (parsingResult instanceof Error) {
      await ack({
        response_type: 'in_channel',
        text: errorMessage(parsingResult),
      });
      return;
    } else {
      await ack({ response_type: 'in_channel' });
    }

    const { code, language } = parsingResult;
    const executionResult = await tryCatch(() => executeCode(code, language));
    if (executionResult instanceof Error) {
      await say(`Runtime error: ${wrapText(String(executionResult))}`);
      return;
    }

    const response = executionResultToString(executionResult);
    await say(response);
  });
};

export const MAX_OUTPUT_LINES = 20;
export const MAX_OUTPUT_CHARACTERS = 1200;
export const MAX_RESULT_CHARACTERS = 700;
const MAX_ARRAY_ITEMS = 100;
const TIMEOUT = 10;
const MEMORY_LIMIT = 32;

const javascript = (code: string) => {
  return code;
};

const typescript = (code: string) => {
  const out = Ts.transpileModule(code, {
    compilerOptions: {
      module: Ts.ModuleKind.CommonJS,
      alwaysStrict: true,
    },
  });
  return out.outputText;
};

const jsTranspilers: { readonly [key: string]: (code: string) => string | Promise<string> } = {
  javascript,
  typescript,
  js: javascript,
  ts: typescript,
};

type ResultType = number | string | object | null | undefined;

interface ExecutionResult {
  readonly stdout: readonly string[];
  readonly result: ResultType;
  readonly time?: string;
}

function parseArg(arg: ResultType) {
  if (Array.isArray(arg)) {
    return JSON.stringify(arg.slice(0, MAX_ARRAY_ITEMS));
  } else if (ArrayBuffer.isView(arg)) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- required
    return JSON.stringify(Array.from((arg as Uint8Array).slice(0, MAX_ARRAY_ITEMS)));
  } else if (typeof arg === 'object') {
    return JSON.stringify(arg);
  } else if (typeof arg !== 'undefined' && arg !== null) {
    return arg.toString();
  }
  return 'undefined';
}

const CODE_PATTERN = /^(\w+)\s+(`{3}|`)([^`]+)\2$/s;
function parseMessage(msg: string) {
  const result = CODE_PATTERN.exec(msg.trim());

  if (!result) {
    throw new Error('Invalid syntax');
  }
  return {
    language: result[1].toLowerCase(),
    code: result[3].trim(),
  };
}

const consoleWrapCode = /*javascript*/ `
__logs = [];
eval = void 0;
console = {
  log (...args) {
    __logs.push(args)
  },
  info (...args) {
    __logs.push(['[i]'].concat(args))
  },
  debug (...args) {
    __logs.push(['[d]'].concat(args))
  },
  error (...args) {
    __logs.push(['[e]'].concat(args))
  }
}`;

async function executeCode(source: string, language: string): Promise<ExecutionResult> {
  if (!jsTranspilers[language]) {
    throw new Error(`Unsupported language ${language}`);
  }
  const code = await jsTranspilers[language](source);
  const vm = new Ivm.Isolate({
    memoryLimit: MEMORY_LIMIT,
  });
  const context = await vm.createContext();
  await context.eval(consoleWrapCode);

  const config = {
    timeout: TIMEOUT,
    promise: false,
    externalCopy: true,
  } as const;

  try {
    const begin = performance.now();
    const exeResult: Ivm.ExternalCopy<ResultType> = await context.eval(code, config);
    const result = exeResult.copy({ transferIn: true });
    const rawLogs: Ivm.ExternalCopy<ReadonlyArray<ReadonlyArray<ResultType>>> = await context.eval('__logs', config);
    const rawStdout = rawLogs.copy({
      transferIn: true,
    });
    const end = performance.now();
    const stdout = rawStdout.map((row) => row.map(parseArg).join(', '));
    return {
      stdout,
      result,
      time: (end - begin).toFixed(3),
    };
  } finally {
    context.release();
    vm.dispose();
  }
}

function wrapText(text: string) {
  return `\`\`\`${text}\n\`\`\``;
}

export function cleanupExecutionResult(result: ExecutionResult) {
  return {
    text: result.stdout.slice(0, MAX_OUTPUT_LINES).join('\n').slice(0, MAX_OUTPUT_CHARACTERS),
    lines: result.stdout.length,
  };
}

export function executionResultToString(result: ExecutionResult): string {
  const stdout = cleanupExecutionResult(result);
  const isCut = stdout.text.length !== result.stdout.join('\n').length;
  const stdoutText =
    stdout.lines === 0 ? '' : `Output (${stdout.lines} lines): ${wrapText(stdout.text + (isCut ? '\n...' : ''))}\n`;
  const codeResult =
    `Result (${result.time ?? 0} ms): ` + wrapText(parseArg(result.result).substr(0, MAX_RESULT_CHARACTERS));
  return stdoutText + codeResult;
}

const errorMessage = (error: unknown) =>
  `Error: ${String(error)}\n` +
  'Correct syntax:\n\n' +
  '> /11execute js ```\n' +
  '// code' +
  '```\n\n' +
  `Supported languages: ${Object.keys(jsTranspilers).join(', ')}.`;
