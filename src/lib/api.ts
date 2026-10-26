import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3f4d271c`;

// Supabase client — used for Auth directly (no Edge Function required)
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }
);

async function call<T = any>(method: string, path: string, body?: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${publicAnonKey}`,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      const err = await res.json().catch(() => ({}));
      return { error: err.error ?? "error", status: res.status } as any;
    }
    return await res.json();
  } catch {
    return null;
  }
}

export const API = {
  // ── Supabase Auth (works without Edge Function) ──────────────────────────
  authSignUp: (email: string, password: string, name: string) =>
    supabase.auth.signUp({ email, password, options: { data: { name } } }),

  authSignIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  authGetSession: () => supabase.auth.getSession(),

  authSignOut: () => supabase.auth.signOut(),

  authUpdateMeta: (meta: Record<string, unknown>) =>
    supabase.auth.updateUser({ data: meta }),

  authRefreshUser: () => supabase.auth.getUser(),

  // ── Edge Function calls (kept for when/if deployed) ───────────────────────
  register: (email: string, password: string, name: string) =>
    call("POST", "/auth/register", { email, password, name }),

  login: (email: string, password: string) =>
    call("POST", "/auth/login", { email, password }),

  deleteAccount: (userId: string, email: string) =>
    call("POST", "/auth/delete", { userId, email }),

  getUser: (userId: string) =>
    call("GET", `/user/${userId}`),

  updateUser: (userId: string, user: unknown) =>
    call("PUT", `/user/${userId}`, { user }),

  getSessions: (userId: string) =>
    call("GET", `/sessions/${userId}`),

  addSession: (userId: string, session: unknown) =>
    call("POST", `/sessions/${userId}`, { session }),

  updateSession: (userId: string, sessionId: string, feedback?: Record<string, number>, notes?: string) =>
    call("PUT", `/sessions/${userId}/${sessionId}`, { feedback, notes }),

  getReminders: (userId: string) =>
    call("GET", `/reminders/${userId}`),

  saveReminders: (userId: string, prefs: unknown) =>
    call("PUT", `/reminders/${userId}`, { prefs }),

  getQuizDraft: (userId: string) =>
    call("GET", `/quiz-draft/${userId}`),

  saveQuizDraft: (userId: string, step: number, answers: unknown) =>
    call("PUT", `/quiz-draft/${userId}`, { step, answers }),

  clearQuizDraft: (userId: string) =>
    call("DELETE", `/quiz-draft/${userId}`),

  addSatisfaction: (userId: string, entry: unknown) =>
    call("POST", `/satisfaction/${userId}`, { entry }),
};
