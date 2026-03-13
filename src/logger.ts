import pino, { type LoggerOptions } from 'pino';

import type { IAppInfo, IHttpRequestContext, ILogger, IObject } from './types';

const { pid } = process, hostname = process.env.HOSTNAME;

export const LOGGER_KINDS = ['pino', 'console', 'void'] as const;

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;

const PINO_LEVELS: Record<string, number> = {
  trace: 10,
  debug: 20,
  info : 30,
  warn : 40,
  error: 50,
  fatal: 60,
};

const defaultOptions: LoggerOptions = {
  level: 'info',
};

export function makeLogger<TApp extends IAppInfo = IAppInfo>(
  kind: 'pino' | 'console' | 'void',
  appInfo: TApp,
  options: LoggerOptions = {},
): ILogger {
  if (kind === 'pino') {
    return makePinoLogger(appInfo, { ...defaultOptions, ...options });
  } else if (kind === 'console') {
    return makeConsoleLogger(appInfo, { ...defaultOptions, ...options });
  } else {
    return makeVoidLogger(appInfo, { ...defaultOptions, ...options });
  }
}

export function makePinoLogger<TApp extends IAppInfo = IAppInfo>(appInfo: TApp, options: LoggerOptions = {}) {
  const _logger = pino(options);

  const _defaultLogger = _logger.child(appInfo);

  function useLogger(l: pino.Logger) {
    return {
      debug: (msg: string, args?: IObject) => l.debug({ msg, ...args }),
      info : (msg: string, args?: IObject) => l.info({ msg, ...args }),
      warn : (msg: string, args?: IObject) => l.warn({ msg, ...args }),
      error: (msg: string, args?: IObject) => l.error({ msg, ...args }),
    };
  }

  function makeLoggerPerRequest<TContext extends IHttpRequestContext = IHttpRequestContext>(ctx: TContext) {
    return useLogger(_defaultLogger.child(ctx));
  }

  return {
    defaultLogger: useLogger(_defaultLogger),
    makeLoggerPerRequest,
  };
}

export function makeConsoleLogger<TApp extends IAppInfo = IAppInfo>(appInfo: TApp, options: LoggerOptions = {}) {
  const levelKey = String(options.level || defaultOptions.level);
  const level = PINO_LEVELS[`${levelKey}`] || 0;

  const findLevelIdx = (ll: string) => LOG_LEVELS.findIndex((l) => l === String(ll)) || 0;

  const levelIdx = findLevelIdx(levelKey);

  const json = (v: unknown) => { try { return JSON.stringify(v); } catch { return String(v); } };

  const time = () => new Date().getTime();
  const defaults = () => ({ level, time: time(), pid, hostname });

  function useLogger(l = console, ctx: IObject = {}) {
    return {
      debug: (msg: string, args?: IObject) => { findLevelIdx('debug') >= levelIdx && l.debug(json({ ...defaults(), ...ctx, msg, ...args })); },
      info : (msg: string, args?: IObject) => { findLevelIdx('info') >= levelIdx && l.info(json({ ...defaults(), ...ctx, msg, ...args })); },
      warn : (msg: string, args?: IObject) => { findLevelIdx('warn') >= levelIdx && l.warn(json({ ...defaults(), ...ctx, msg, ...args })); },
      error: (msg: string, args?: IObject) => { findLevelIdx('error') >= levelIdx && l.error(json({ ...defaults(), ...ctx, msg, ...args })); },
    };
  }

  function makeLoggerPerRequest<TContext extends IHttpRequestContext = IHttpRequestContext>(ctx: TContext) {
    return useLogger(console, { ...appInfo, ...ctx });
  }

  return {
    defaultLogger: useLogger(console, appInfo),
    makeLoggerPerRequest,
  };
}

export function makeVoidLogger<TApp extends IAppInfo = IAppInfo>(_appInfo: TApp, _config: LoggerOptions = {}) {

  const vl = {
      debug: () => {},
      info : () => {},
      warn : () => {},
      error: () => {},
  };

  const defaultLogger = vl;

  function makeLoggerPerRequest<TContext extends IHttpRequestContext = IHttpRequestContext>(_ctx: TContext) {
    return vl;
  }

  return {
    defaultLogger,
    makeLoggerPerRequest,
  };
}
