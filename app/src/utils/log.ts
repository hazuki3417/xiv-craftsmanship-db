import { stdout as output1, stderr as output2 } from "process";

export const stdout = (value: string) => {
  output1.write(value);
};

export const stderr = (error: unknown, context?: Record<string, unknown>) => {
  if (error instanceof Error) {
    output2.write(
      `[ERROR]: ${JSON.stringify({
        message: error.message,
        stack: error.stack,
        ...context,
      })}\n`,
    );
  } else {
    output2.write(
      `[ERROR]: ${JSON.stringify({
        error,
        ...context,
      })}\n`,
    );
  }
};

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
