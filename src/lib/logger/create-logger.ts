import pino from 'pino';

interface LoggerOptions {
  readonly service_name: string;
  readonly service_revision?: string;
  readonly transport?: pino.TransportSingleOptions;
}

export function createLogger({ service_name, service_revision, transport }: LoggerOptions) {
  return pino({
    name: service_name,
    transport,
    base: {
      service: {
        name: service_name,
        revision: service_revision,
      },
    },
  });
}

export type Logger = ReturnType<typeof createLogger>;
