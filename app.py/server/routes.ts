import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import OpenAI from "openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize OpenAI client
  // Replit AI integration usually provides the key in env or we can use the default if running within Replit's environment with the integration enabled.
  // We'll try to use the standard instantiation.
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  app.get(api.messages.list.path, async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.post(api.messages.clear.path, async (req, res) => {
    await storage.clearMessages();
    res.status(204).end();
  });

  app.post(api.chat.path, async (req, res) => {
    try {
      const { message } = api.chat.input.parse(req.body);

      // 1. Save user message
      const userMessage = await storage.createMessage({
        role: "user",
        content: message,
      });

      // 2. Get history for context
      const history = await storage.getMessages();
      const messagesForAI = history.map(msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content
      }));

      // 3. Set headers for streaming
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");

      // 4. Call OpenAI with streaming
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          ...messagesForAI
        ],
        stream: true,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(content);
          fullResponse += content;
        }
      }

      res.end();

      // 5. Save AI response
      await storage.createMessage({
        role: "assistant",
        content: fullResponse,
      });

    } catch (error) {
      console.error("Chat error:", error);
      // If we haven't started streaming yet, send JSON error
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal server error" });
      } else {
        // If streaming started, just end it
        res.end();
      }
    }
  });

  return httpServer;
}
