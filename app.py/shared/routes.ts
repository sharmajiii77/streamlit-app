import { z } from "zod";
import { insertMessageSchema, messages } from "./schema";

export const api = {
  messages: {
    list: {
      method: "GET" as const,
      path: "/api/messages",
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/messages",
      input: insertMessageSchema,
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        500: z.object({ message: z.string() }),
      },
    },
    clear: {
        method: "POST" as const,
        path: "/api/messages/clear",
        responses: {
            204: z.void()
        }
    }
  },
  chat: {
      method: "POST" as const,
      path: "/api/chat",
      input: z.object({ message: z.string() }),
      responses: {
          200: z.any() // Stream
      }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
