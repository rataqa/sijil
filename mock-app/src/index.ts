import express, { Request, Response, NextFunction } from 'express';
import { randomInt, randomUUID } from 'node:crypto';
import { makeLogger, type IBasicLogger } from '@rataqa/sijil';

const app = express();

const appInfo = { appName: 'mock-app', appVersion: '1.2.3' };

const logger = makeLogger('pino', appInfo, { level: 'info' });

const serviceA = makeServiceA();

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.t0 = new Date();

  const correlation_id = req.get('x-correlation-id') || randomUUID();
  res.locals.correlation_id = correlation_id;

  const rl = logger.makeLoggerPerRequest({ correlation_id });

  const { method, url, query, headers, body } = req;
  rl.info('New request', { method, url, query, headers, body });

  res.locals.logger = rl;
  next();
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ data: appInfo, ts: new Date() });
});

app.post('/', (req: IRequest, res: IResponse) => {
  const { x = randomInt(100), y = randomInt(100) } = req.body;
  const { ctx, logger } = res.locals;
  logger.info('Handling request for root path');

  const api = serviceA.apiPerRequest(ctx, logger);
  const sum = api.add(x, y);

  res.json({ ...req.body, sum });
});

app.listen(3000, () => {
  logger.info('Server is running on port 3000');
});

interface IInputToAdd {
  x: number;
  y: number;
}

type IRequest = Request<any, any, IInputToAdd>;

type IResponse<TBody = any> = Response<TBody, IResLocals>;

interface IResLocals {
  ctx: IAppCtx;
  logger: IBasicLogger;
}

interface IAppCtx {
  t0: Date;
  correlation_id: string;
}

function makeServiceA() {

  function apiPerRequest(ctx: IAppCtx, rl: IBasicLogger) {
    function add(x: number, y: number) {
      const sum = x + y;
      rl.info('add()', { x, y, sum });
      return sum;
    }

    return {
      add,
    };
  }

  return {
    apiPerRequest,
  };
}
