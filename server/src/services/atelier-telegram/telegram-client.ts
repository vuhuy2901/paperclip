import type {
  TelegramApiResponse,
  TelegramBotInfo,
  TelegramMessage,
  TelegramUpdate,
} from "./types.js";
import { addTelegramLog } from "./config.js";

export class TelegramBotClient {
  private token: string;
  private baseUrl: string;

  constructor(token: string) {
    this.token = token.trim();
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  public updateToken(newToken: string): void {
    this.token = newToken.trim();
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  public hasToken(): boolean {
    return this.token.length > 5 && this.token.includes(":");
  }

  private sanitizeError(err: unknown): string {
    const raw = String(err);
    if (this.token && raw.includes(this.token)) {
      return raw.split(this.token).join("[REDACTED_TELEGRAM_TOKEN]");
    }
    return raw;
  }

  private async callApi<T>(method: string, body?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
    if (!this.hasToken()) {
      throw new Error("Telegram Bot Token is not configured or invalid format");
    }

    const url = `${this.baseUrl}/${method}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "ATELIER-AI-Paperclip/2.0",
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal,
      });
    } catch (networkErr) {
      const sanitized = this.sanitizeError(networkErr);
      throw new Error(`Telegram API network error during ${method}: ${sanitized}`);
    }

    let json: TelegramApiResponse<T>;
    try {
      json = (await response.json()) as TelegramApiResponse<T>;
    } catch (parseErr) {
      throw new Error(`Telegram API invalid JSON response during ${method}: HTTP ${response.status}`);
    }

    if (!json.ok) {
      const errMsg = `Telegram API error (${json.error_code}): ${json.description || "Unknown error"}`;
      throw new Error(this.sanitizeError(errMsg));
    }

    return json.result as T;
  }

  public async getMe(): Promise<TelegramBotInfo> {
    return this.callApi<TelegramBotInfo>("getMe");
  }

  public async getUpdates(offset: number, timeoutSeconds = 15, signal?: AbortSignal): Promise<TelegramUpdate[]> {
    return this.callApi<TelegramUpdate[]>(
      "getUpdates",
      {
        offset,
        limit: 50,
        timeout: timeoutSeconds,
        allowed_updates: ["message", "edited_message", "callback_query"],
      },
      signal
    );
  }

  public async sendMessage(
    chatId: number | string,
    text: string,
    options?: {
      reply_to_message_id?: number;
      reply_markup?: any;
      parse_mode?: "Markdown" | "HTML";
      disable_web_page_preview?: boolean;
    }
  ): Promise<TelegramMessage> {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode ?? "Markdown",
      disable_web_page_preview: options?.disable_web_page_preview ?? true,
    };

    if (options?.reply_to_message_id) {
      payload.reply_to_message_id = options.reply_to_message_id;
    }
    if (options?.reply_markup) {
      payload.reply_markup = options.reply_markup;
    }

    try {
      return await this.callApi<TelegramMessage>("sendMessage", payload);
    } catch (err: any) {
      // Fallback: If Markdown parsing fails (e.g. unescaped characters), retry without parse_mode
      if (options?.parse_mode === "Markdown" && String(err).includes("can't parse entities")) {
        delete payload.parse_mode;
        return await this.callApi<TelegramMessage>("sendMessage", payload);
      }
      throw err;
    }
  }

  public async editMessageText(
    chatId: number | string,
    messageId: number,
    text: string,
    options?: {
      reply_markup?: any;
      parse_mode?: "Markdown" | "HTML";
    }
  ): Promise<TelegramMessage | boolean> {
    const payload: Record<string, unknown> = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: options?.parse_mode ?? "Markdown",
    };
    if (options?.reply_markup) {
      payload.reply_markup = options.reply_markup;
    }

    try {
      return await this.callApi<TelegramMessage | boolean>("editMessageText", payload);
    } catch (err: any) {
      if (options?.parse_mode === "Markdown" && String(err).includes("can't parse entities")) {
        delete payload.parse_mode;
        return await this.callApi<TelegramMessage | boolean>("editMessageText", payload);
      }
      throw err;
    }
  }

  public async answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert = false
  ): Promise<boolean> {
    return this.callApi<boolean>("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert,
    });
  }

  public async sendChatAction(chatId: number | string, action = "typing"): Promise<boolean> {
    try {
      return await this.callApi<boolean>("sendChatAction", {
        chat_id: chatId,
        action,
      });
    } catch {
      return false;
    }
  }
}
