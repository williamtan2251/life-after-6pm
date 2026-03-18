import { supabase } from "./supabase";
import { event } from "./analytics";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const history: ChatMessage[] = [];

const styles = {
  bot: "color: #1E90FF; font-size: 13px; font-weight: bold;",
  user: "color: #888; font-size: 12px; font-style: italic;",
  email: "color: #32CD32; font-size: 13px; font-weight: bold;",
  error: "color: #FF6347; font-size: 12px;",
  hint: "color: #FFD700; font-size: 11px;",
};

async function irc(message: string): Promise<void> {
  if (!message || typeof message !== "string") {
    console.log("%c[irc] Pass a message string, e.g. irc('hello')", styles.hint);
    return;
  }

  try {
    const { data, error } = await supabase.functions.invoke("console-chat", {
      body: { message, history: history.slice(-10) },
    });

    if (error) {
      // supabase-js wraps non-2xx responses in FunctionsHttpError — parse the JSON body
      const errBody = await error.context?.json?.().catch(() => null);
      const msg = errBody?.reply || "Something went wrong. Try again later.";
      console.log(`%c${msg}`, styles.error);
      return;
    }

    if (!data?.reply) {
      console.log("%c🤖 ...I got nothing. Try again?", styles.error);
      return;
    }

    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: data.reply });

    event("console_chat", { message_count: String(history.length / 2) });

    console.log(`%c🤖 ${data.reply}`, styles.bot);

    if (data.email) {
      try {
        await supabase.from("console_leads").upsert(
          { email: data.email },
          { onConflict: "email" }
        );
        event("console_email_capture", { email: data.email });
        console.log(`%c✅ Got your email! I'll make sure William sees it.`, styles.email);
      } catch {
        // Silent fail — don't interrupt the chat experience
      }
    }
  } catch {
    console.log("%c[irc] Network error — are you online?", styles.error);
  }
}

declare global {
  interface Window {
    irc: (message: string) => void;
  }
}

export function initConsoleChatbot() {
  window.irc = (message: string) => void irc(message);
}
