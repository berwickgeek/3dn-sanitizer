import type { NextApiRequest, NextApiResponse } from "next";

interface RateLimitConfig {
  uniqueTokenPerInterval?: number;
  interval?: number;
}

export default function rateLimit(options?: RateLimitConfig) {
  const tokenCache = new Map();
  const { uniqueTokenPerInterval = 10, interval = 60000 } = options ?? {};

  return {
    check: (req: NextApiRequest, res: NextApiResponse, limit: number) =>
      new Promise<void>((resolve, reject) => {
        const token =
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress ||
          "anonymous";
        const tokenCount = tokenCache.get(token) || [0];
        const currentTime = Date.now();
        const oldTokenCount = tokenCount[0];
        const timestamp = tokenCount[1] || currentTime;
        const timeDiff = currentTime - timestamp;

        if (timeDiff > interval) {
          tokenCount[0] = 1;
          tokenCount[1] = currentTime;
        } else {
          tokenCount[0] = oldTokenCount + 1;
        }

        tokenCache.set(token, tokenCount);

        if (tokenCount[0] > limit) {
          reject(new Error("Rate limit exceeded"));
          res.status(429).json({
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message: "Too many requests, please try again later",
            },
          });
          return;
        }

        // Clean up old tokens
        if (tokenCache.size > uniqueTokenPerInterval) {
          const tokens = [...tokenCache.entries()];
          const oldestToken = tokens.sort(([, a], [, b]) => a[1] - b[1])[0][0];
          tokenCache.delete(oldestToken);
        }

        resolve();
      }),
  };
}
