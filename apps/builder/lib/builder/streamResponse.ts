/**
 * Helper to format Server‑Sent Events streams.
 * Provides a simple wrapper that takes an async generator of data objects
 * and writes them to the response as SSE lines.
 */
export async function* sseStream<T>(iterable: AsyncIterable<T>) {
  for await (const data of iterable) {
    const line = `data: ${JSON.stringify(data)}\n\n`;
    yield new TextEncoder().encode(line);
  }
}

/**
 * Encode a single object as an SSE line.
 */
export function encodeSse(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}