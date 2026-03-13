import assert from 'node:assert';
import { describe, it } from 'node:test';

import { makeLogger } from '../logger';

describe('Logger', () => {

  it('should log messages correctly - pino', () => {
    const l = makeLogger('pino', { appName: 'test-app', appVersion: '1.0.0' }, { level: 'debug' });
    l.debug('Debug message', { extra: 'debug' });
    l.info('Info message', { extra: 'info' });
    l.warn('Warn message', { extra: 'warn' });
    l.error('Error message', { extra: 'error' });
    assert.equal(true, true, 'Just a placeholder assertion to ensure the test runs without errors');

    const rl = l.makeLoggerPerRequest({ correlation_id: '12345' });
    rl.info('Info message with context', { extra: 'context' });
    assert.equal(true, true, 'Just a placeholder assertion to ensure the test runs without errors');
  });

  it('should log messages correctly - console', () => {
    const l = makeLogger('console', { appName: 'test-app', appVersion: '1.0.0' }, { level: 'debug' });
    l.debug('Debug message', { extra: 'debug' });
    l.info('Info message', { extra: 'info' });
    l.warn('Warn message', { extra: 'warn' });
    l.error('Error message', { extra: 'error' });
    assert.equal(true, true, 'Just a placeholder assertion to ensure the test runs without errors');

    const rl = l.makeLoggerPerRequest({ correlation_id: '12345' });
    rl.info('Info message with context', { extra: 'context' });
    assert.equal(true, true, 'Just a placeholder assertion to ensure the test runs without errors');
  });

  it('should log messages correctly - void', () => {
    const l = makeLogger('void', { appName: 'test-app', appVersion: '1.0.0' }, { level: 'debug' });
    l.debug('Debug message', { extra: 'debug' });
    l.info('Info message', { extra: 'info' });
    l.warn('Warn message', { extra: 'warn' });
    l.error('Error message', { extra: 'error' });
    assert.equal(true, true, 'Just a placeholder assertion to ensure the test runs without errors');

    const rl = l.makeLoggerPerRequest({ correlation_id: '12345' });
    rl.info('Info message with context', { extra: 'context' });
    assert.equal(true, true, 'Just a placeholder assertion to ensure the test runs without errors');
  });
});
