import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

// One OpenAI-compatible gateway (AgentRouter) fans out to Claude / GPT / Gemini
// via a single key, so "choosing a provider" is really choosing a model id.
const gateway = createOpenAI({
  baseURL: process.env.AI_BASE_URL,
  apiKey: process.env.AI_API_KEY,
});

// Google native SDK — reads GOOGLE_GENERATIVE_AI_API_KEY from env by default.
const google = createGoogleGenerativeAI();

// The models the UI is allowed to request. `id` is what we send to the gateway;
// `provider` groups them for the picker.
export const AI_MODELS = [
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", provider: "Anthropic" },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5", provider: "Anthropic" },
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", label: "GPT-4o mini", provider: "OpenAI" },
  { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash Lite", provider: "Google" },
  { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite", provider: "Google" },
  { id: "gemini-flash-latest", label: "Gemini Flash (latest)", provider: "Google" },
  { id: "gemini-pro-latest", label: "Gemini Pro (latest)", provider: "Google" },
] as const;

export type AiModelId = (typeof AI_MODELS)[number]["id"];

export const DEFAULT_MODEL: AiModelId =
  (process.env.AI_MODEL as AiModelId) ?? "gemini-3.5-flash-lite";

export function isAllowedModel(id: string): id is AiModelId {
  return AI_MODELS.some((m) => m.id === id);
}

// Resolve a model id to an AI-SDK LanguageModel. Gemini goes to the native Google
// SDK (the gateway key is dead); everything else still routes through the gateway.
export function getModel(id: AiModelId = DEFAULT_MODEL): LanguageModel {
  return id.startsWith("gemini-") ? google(id) : gateway(id);
}
