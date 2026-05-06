/**
 * Simple in-memory queue to serialize ZAI API calls.
 * Since the model has a concurrency limit of 1, this ensures
 * only one ZAI API call runs at a time.
 */

type QueuedTask<T> = {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

let queue: QueuedTask<unknown>[] = [];
let running = false;

async function runQueue() {
  if (running) return;
  running = true;

  while (queue.length > 0) {
    const task = queue.shift()!;
    try {
      const result = await task.fn();
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    }
  }

  running = false;
}

export async function withQueue<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue.push({ fn: fn as () => Promise<unknown>, resolve: resolve as (value: unknown) => void, reject });
    runQueue();
  });
}
