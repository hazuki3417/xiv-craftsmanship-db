export const logError = (error: unknown, context: Record<string, unknown>) => {
  if (error instanceof Error) {
    console.error("[ERROR]", {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  } else {
    console.error("[ERROR]", {
      error,
      ...context,
    });
  }
};
