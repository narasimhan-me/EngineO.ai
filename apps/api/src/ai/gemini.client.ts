import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GeminiGenerateRequest {
  contents: Array<{
    parts: Array<{ text?: string } & Record<string, unknown>>;
  }>;
  generationConfig?: Record<string, unknown>;
  safetySettings?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  [key: string]: unknown;
}

interface GeminiModel {
  name: string;
  supportedGenerationMethods?: string[];
}

interface GeminiApiError extends Error {
  status?: number;
}

export const DEFAULT_GEMINI_MODEL_PRIORITY: string[] = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

export function isRetryableGeminiError(err: unknown): boolean {
  const anyErr = err as { status?: unknown } | null | undefined;
  const status =
    anyErr && typeof anyErr.status === 'number' ? anyErr.status : undefined;

  if (status === 429) {
    return true;
  }

  if (typeof status === 'number' && status >= 500 && status <= 599) {
    return true;
  }

  return false;
}

@Injectable()
export class GeminiClient {
  private readonly apiKey: string;
  private readonly apiVersion: string;
  private readonly desiredModels: string[];

  private availableModels: string[] | null = null;
  private fallbackChain: string[] | null = null;
  private initialized = false;
  private initializingPromise: Promise<void> | null = null;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('AI_API_KEY') || '';
    this.apiVersion =
      this.configService.get<string>('GEMINI_API_VERSION') || 'v1';

    const priorityEnv =
      this.configService.get<string>('GEMINI_MODEL_PRIORITY') || '';
    const legacyModel = this.configService.get<string>('GEMINI_MODEL') || '';

    let priority = DEFAULT_GEMINI_MODEL_PRIORITY;

    if (priorityEnv.trim()) {
      priority = priorityEnv
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean);
    } else if (legacyModel) {
      priority = [legacyModel, ...DEFAULT_GEMINI_MODEL_PRIORITY].filter(
        (value, index, self) => self.indexOf(value) === index,
      );
    }

    this.desiredModels = priority;
  }

  /**
   * Public entry point for callers needing Gemini generateContent with
   * automatic model discovery and failover.
   */
  async generateWithFallback(
    request: GeminiGenerateRequest,
  ): Promise<GeminiGenerateResponse> {
    if (!this.apiKey) {
      throw new Error(
        '[Gemini] AI_API_KEY is not configured; cannot call Gemini API.',
      );
    }

    await this.ensureInitialized();

    const chain =
      (this.fallbackChain && this.fallbackChain.length > 0
        ? this.fallbackChain
        : this.desiredModels) || this.desiredModels;

    let lastError: unknown;

    for (const model of chain) {
      try {
        return await this.callModel(model, request);
      } catch (error) {
        lastError = error;
        if (isRetryableGeminiError(error)) {
          // eslint-disable-next-line no-console
          console.warn(
            `[Gemini] Model ${model} failed with retryable error; attempting next model in chain.`,
          );
          continue;
        }

        // Non-retryable error: bubble up immediately.
        throw error;
      }
    }

    throw lastError ?? new Error('[Gemini] All models in fallback chain failed.');
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.apiKey) {
      // No API key configured – nothing to initialize.
      this.initialized = true;
      this.fallbackChain = this.desiredModels;
      return;
    }

    if (this.initialized) {
      return;
    }

    if (this.initializingPromise) {
      await this.initializingPromise;
      return;
    }

    this.initializingPromise = this.loadAvailableModels();
    await this.initializingPromise;
  }

  private async loadAvailableModels(): Promise<void> {
    try {
      const url = `https://generativelanguage.googleapis.com/${this.apiVersion}/models?key=${this.apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        const body = await response.text();
        // eslint-disable-next-line no-console
        console.error(
          `[Gemini] Failed to list models (status ${response.status}): ${body}`,
        );
        this.availableModels = null;
        this.fallbackChain = this.desiredModels;
        return;
      }

      const data = (await response.json()) as { models?: GeminiModel[] };
      const models = data.models ?? [];

      const usable = models.filter((model) =>
        (model.supportedGenerationMethods || []).includes('generateContent'),
      );

      this.availableModels = usable.map((m) => m.name);

      const availableSet = new Set(this.availableModels);
      const chain = this.desiredModels.filter((m) => availableSet.has(m));

      if (chain.length === 0) {
        // eslint-disable-next-line no-console
        console.warn(
          '[Gemini] No desired models found in available models; using full desired priority list as fallback chain.',
        );
        this.fallbackChain = this.desiredModels;
      } else {
        this.fallbackChain = chain;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Gemini] Error while listing models:', error);
      this.availableModels = null;
      this.fallbackChain = this.desiredModels;
    } finally {
      this.initialized = true;
    }
  }

  private async callModel(
    model: string,
    request: GeminiGenerateRequest,
  ): Promise<GeminiGenerateResponse> {
    const url = `https://generativelanguage.googleapis.com/${this.apiVersion}/models/${model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const body = await response.text();
      const error: GeminiApiError = new Error(
        `[Gemini] generateContent error (status ${response.status}) for model ${model}: ${body}`,
      );
      error.status = response.status;
      throw error;
    }

    return (await response.json()) as GeminiGenerateResponse;
  }
}

