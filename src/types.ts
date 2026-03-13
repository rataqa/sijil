export type ILoggerKind = 'pino' | 'console' | 'void';

interface ILogFun {
  (msg: string, args?: Record<string, unknown>): void;
}

export interface IBasicLogger {
  debug: ILogFun;
  info : ILogFun;
  warn : ILogFun;
  error: ILogFun;
}

export interface ILogger {
  defaultLogger       : IBasicLogger;
  makeLoggerPerRequest: <TContext extends IHttpRequestContext>(ctx: TContext) => IBasicLogger;
}

export interface IObject {
  [key: string]: unknown;
}

export interface IAppInfo extends IObject {
  appName   : string;
  appVersion: string;
}

export interface IHttpRequestContext {
  correlation_id: string;
}
