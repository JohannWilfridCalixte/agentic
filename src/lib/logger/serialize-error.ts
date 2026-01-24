export const serializeError = (error: unknown) =>
  error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error;
