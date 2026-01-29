interface SerializedError {
  readonly message: string;
  readonly name: string;
  readonly stack: string | undefined;
}

export function serializeError(error: unknown): SerializedError | unknown {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }
  return error;
}
