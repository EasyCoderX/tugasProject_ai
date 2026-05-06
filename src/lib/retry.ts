const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export interface RetryConfig {
  maxRetries?: number;
  baseDelayMs?: number;
}

export function isOverloadError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('1305') ||
      msg.includes('overloaded') ||
      msg.includes('server overloaded') ||
      msg.includes('429') ||
      msg.includes('too many requests') ||
      msg.includes('concurrency') ||
      msg.includes('rate limit') ||
      msg.includes('busy') ||
      msg.includes('try again later')
    );
  }
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config?: RetryConfig
): Promise<T> {
  const maxRetries = config?.maxRetries ?? MAX_RETRIES;
  const baseDelayMs = config?.baseDelayMs ?? BASE_DELAY_MS;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isOverload = isOverloadError(error);
      const isLastAttempt = attempt === maxRetries;

      if (isOverload && !isLastAttempt) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        console.log(`ZAI API overloaded, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw new Error('Retry logic error');
}
