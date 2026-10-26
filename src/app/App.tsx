import { useState, useEffect, useRef } from "react"
import { LangCtx, useLang, type Lang } from "../lib/i18n"
import { API } from "../lib/api"
import { motion } from "motion/react"
import {
  Brain, Sun, Moon, Heart, Bed, Pill, MapPin, Clock,
  ChevronRight, ChevronLeft, CheckCircle2, BarChart3, Star,
  Home, Coffee, Users, Wind, Droplets, Music, Timer,
  RefreshCw, Activity, TrendingUp, List, Waves, Leaf,
  LogOut, Trash2, Mail, Lock, Eye, EyeOff, Check, Plus,
  AlertCircle, Zap, Target, BookOpen, Award, Settings,
  User as UserIcon, X, Edit3, MessageSquare, Shield,
  ExternalLink, ChevronDown, ChevronUp, Calendar, History,
  ThumbsUp, Copy, Bell, Sparkles, PenLine, ChevronsUp, ChevronsDown
} from "lucide-react"
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts"

// ── Custom SVG Charts (avoids recharts duplicate-key warnings) ─────────────────

type SvgSeries = { key: string; color: string; dash?: string; opacity?: number; strokeWidth?: number }

function SvgMultiArea({ data, series, xKey = "label", domain = [0, 5], height = 140 }: {
  data: Record<string, any>[]; series: SvgSeries[]; xKey?: string; domain?: [number, number]; height?: number
}) {
  const [minV, maxV] = domain
  const pL = 28, pR = 6, pT = 4, pB = 18
  const vbW = 300, vbH = height
  const cW = vbW - pL - pR, cH = vbH - pT - pB
  const ys = (v: number) => pT + cH - ((v - minV) / (maxV - minV)) * cH
  const xs = (i: number) => pL + (data.length < 2 ? cW / 2 : (i / (data.length - 1)) * cW)
  const yTicks = Array.from({ length: maxV - minV + 1 }, (_, i) => minV + i)
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" height={height} style={{ overflow: "visible" }}>
      {yTicks.map(v => (
        <g key={v}>
          <line x1={pL} x2={pL + cW} y1={ys(v)} y2={ys(v)} stroke="#E8E3DA" strokeWidth={0.6} />
          <text x={pL - 3} y={ys(v)} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#9A9185">{v}</text>
        </g>
      ))}
      {data.map((d, i) => (
        <text key={i} x={xs(i)} y={vbH - pB + 11} textAnchor="middle" fontSize={9} fill="#9A9185">{d[xKey]}</text>
      ))}
      {series.map(s => {
        const pts = data.map((d, i) => ({ x: xs(i), y: d[s.key] != null ? ys(d[s.key]) : null }))
        let linePath = "", firstX: number | null = null, lastX: number | null = null
        pts.forEach(pt => {
          if (pt.y === null) return
          if (firstX === null) { linePath += `M ${pt.x} ${pt.y}`; firstX = pt.x }
          else linePath += ` L ${pt.x} ${pt.y}`
          lastX = pt.x
        })
        const areaPath = linePath && firstX !== null && lastX !== null
          ? `${linePath} L ${lastX} ${ys(minV)} L ${firstX} ${ys(minV)} Z`
          : ""
        return (
          <g key={s.key}>
            {areaPath && <path d={areaPath} fill={s.color} fillOpacity={s.opacity ?? 0.12} stroke="none" />}
            {linePath && <path d={linePath} fill="none" stroke={s.color} strokeWidth={s.strokeWidth ?? 2} strokeDasharray={s.dash} strokeLinecap="round" strokeLinejoin="round" />}
          </g>
        )
      })}
    </svg>
  )
}

function SvgGroupedBar({ data, series, xKey = "label", domain = [0, 5], height = 140, maxBarW = 22 }: {
  data: Record<string, any>[]; series: SvgSeries[]; xKey?: string; domain?: [number, number]; height?: number; maxBarW?: number
}) {
  const [minV, maxV] = domain
  const pL = 28, pR = 6, pT = 4, pB = 18
  const vbW = 300, vbH = height
  const cW = vbW - pL - pR, cH = vbH - pT - pB
  const ys = (v: number) => pT + cH - ((v - minV) / (maxV - minV)) * cH
  const yTicks = Array.from({ length: maxV - minV + 1 }, (_, i) => minV + i)
  const slotW = cW / (data.length || 1)
  const gap = 2, n = series.length
  const barW = Math.min(maxBarW, (slotW - gap * (n + 1)) / n)
  const groupW = barW * n + gap * (n - 1)
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} width="100%" height={height} style={{ overflow: "visible" }}>
      {yTicks.map(v => (
        <g key={v}>
          <line x1={pL} x2={pL + cW} y1={ys(v)} y2={ys(v)} stroke="#E8E3DA" strokeWidth={0.6} />
          <text x={pL - 3} y={ys(v)} textAnchor="end" dominantBaseline="middle" fontSize={9} fill="#9A9185">{v}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const centerX = pL + (i + 0.5) * slotW
        return (
          <g key={i}>
            {series.map((s, si) => {
              const val = d[s.key]
              if (val == null || val === 0) return null
              const bX = centerX - groupW / 2 + si * (barW + gap)
              const bH = Math.max(2, ((val - minV) / (maxV - minV)) * cH)
              const bY = ys(val)
              return (
                <rect key={s.key} x={bX} y={bY} width={barW} height={bH} fill={s.color} rx={2} ry={2} />
              )
            })}
            <text x={centerX} y={vbH - pB + 11} textAnchor="middle" fontSize={9} fill="#9A9185">{d[xKey]}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

type View =
  | "splash" | "login" | "create-account" | "onboarding"
  | "journey" | "quiz" | "quiz-results"
  | "checkin" | "processing" | "recommendations"
  | "dashboard" | "settings"
  | "resources" | "how-it-works" | "history" | "satisfaction" | "edit-profile"
  | "reminders" | "past-report" | "when-to-use"

type Mood = "low" | "anxious" | "neutral" | "good" | "great"
type MedStatus = "took" | "not-yet" | "skipping" | "none"
type Environment = "home-solo" | "home-others" | "office" | "cafe" | "outside"
type TimeOfDay = "morning" | "midday" | "afternoon" | "evening"
type CurrentActivity = "studying" | "working" | "creative" | "admin" | "scrolling" | "resting" | "commuting" | "other"
type ActivityFeeling = "dreading" | "bored" | "neutral" | "interested" | "loving"
type CognitiveState =
  | "overload" | "motivation-deficit" | "hyperfocus-productive"
  | "hyperfocus-unproductive" | "fatigue-failure"
  | "emotional-dysregulation" | "executive-dysfunction" | "balanced"

interface CheckInData {
  energy: number; mood: Mood; sleep: number; meds: MedStatus
  environment: Environment; timeOfDay: TimeOfDay; stress: number
  fatigue: number; sleepiness: number; focus: number; motivation: number
  taskDifficulty: number; workload: number
  currentActivity: CurrentActivity; activityFeeling: ActivityFeeling
}

interface Rec {
  id: string; title: string; category: string; color: string
  Icon: React.ElementType; brief: string; why: string; howTo: string; duration: string
}

interface OnboardingProfile {
  name: string; gender: string; age: string
  diagnosis: string; adhdKnowledge: string; peakTime: string
  busyness: string; timeLoss: string; workDistraction: string
  moodShifts: boolean | null; strengths: string[]; coConditions: string[]
}

interface QuizAnswers {
  powerNap: string           // Q1 — rest strategy personalization
  taskInitiation: string     // Q2 — executive dysfunction signal
  noisePreference: string    // Q3 — focus environment preference
  bodyDoubling: boolean | null // Q4 — social focus personalization
  exerciseHelps: boolean | null // Q5 — movement rec personalization
  procrastinate: string      // Q6
  startOrganized: string     // Q7
  hardToUnwind: string       // Q8
  distractedAtWork: string   // Q9
  emotionalDerail: string    // Q10 — emotional dysregulation signal
  avoidFailure: string       // Q11
  racingThoughts: number     // Q12
  carelessMistakes: number   // Q13
}

interface QuizResults {
  score: number
  level: "low" | "moderate" | "high" | "very-high"
  attentionScore: number; emotionalScore: number
  executiveScore: number; socialScore: number
  powerNap: string
  noisePreference: string
  bodyDoubling: boolean | null
  exerciseHelps: boolean | null
}

interface Session {
  id: string; date: string; time: string
  checkIn: CheckInData; cognitiveState: CognitiveState
  recIds: string[]; feedback: Record<string, number>
  notes?: string
}

interface ReminderPrefs {
  enabled: boolean
  days: string[]          // e.g. ["Mon","Wed","Fri"]
  cadence: "weekly" | "biweekly"
  timesPerDay: 1 | 2
  time1: string           // "09:00"
  time1Period: "AM" | "PM"
  time2: string           // "03:00"
  time2Period: "AM" | "PM"
}

interface AppUser {
  id: string; email: string; name: string; password: string
  createdAt: string; onboardingDone: boolean; quizDone: boolean
  profile: OnboardingProfile | null; quizResults: QuizResults | null
  avatar: string
}

interface SatisfactionEntry {
  id: string; date: string; rating: number; comment: string; category: string
}

// ── Storage ───────────────────────────────────────────────────────────────────

const STORE = {
  users: (): AppUser[] => JSON.parse(localStorage.getItem("adhd_users") || "[]"),
  setUsers: (u: AppUser[]) => localStorage.setItem("adhd_users", JSON.stringify(u)),
  currentUser: (): AppUser | null => {
    const r = localStorage.getItem("adhd_current_user")
    return r ? JSON.parse(r) : null
  },
  setCurrentUser: (u: AppUser | null) => {
    if (u) localStorage.setItem("adhd_current_user", JSON.stringify(u))
    else localStorage.removeItem("adhd_current_user")
  },
  sessions: (): Session[] => JSON.parse(localStorage.getItem("adhd_sessions") || "[]"),
  setSessions: (s: Session[]) => localStorage.setItem("adhd_sessions", JSON.stringify(s)),
  satisfaction: (): SatisfactionEntry[] => JSON.parse(localStorage.getItem("adhd_satisfaction") || "[]"),
  setSatisfaction: (s: SatisfactionEntry[]) => localStorage.setItem("adhd_satisfaction", JSON.stringify(s)),
  splashSeen: (): boolean => localStorage.getItem("adhd_splash_seen") === "true",
  setSplashSeen: () => localStorage.setItem("adhd_splash_seen", "true"),
  reminders: (): ReminderPrefs => JSON.parse(localStorage.getItem("adhd_reminders") || '{"enabled":false,"days":["Mon","Wed","Fri"],"cadence":"weekly","timesPerDay":1,"time1":"09:00","time1Period":"AM","time2":"03:00","time2Period":"PM"}'),
  setReminders: (r: ReminderPrefs) => localStorage.setItem("adhd_reminders", JSON.stringify(r)),
  quizDraft: (userId: string): { step: number; answers: QuizAnswers } | null => {
    const raw = localStorage.getItem(`adhd_quiz_draft_${userId}`)
    return raw ? JSON.parse(raw) : null
  },
  setQuizDraft: (userId: string, step: number, answers: QuizAnswers) =>
    localStorage.setItem(`adhd_quiz_draft_${userId}`, JSON.stringify({ step, answers })),
  clearQuizDraft: (userId: string) => localStorage.removeItem(`adhd_quiz_draft_${userId}`),
  updateUser: (u: AppUser) => {
    const users = STORE.users()
    const idx = users.findIndex(x => x.id === u.id)
    if (idx >= 0) users[idx] = u; else users.push(u)
    STORE.setUsers(users)
    STORE.setCurrentUser(u)
  },
}

// Tries Supabase first; falls back to localStorage on network failure.
async function doLogin(email: string, password: string): Promise<AppUser | "invalid" | "network"> {
  // Try Supabase Auth first — works even without the Edge Function deployed
  try {
    const { data, error } = await API.authSignIn(email, password)
    if (data?.user && data?.session) {
      const meta = data.user.user_metadata ?? {}
      const u: AppUser = {
        id: data.user.id,
        email: data.user.email!,
        name: meta.name ?? email.split("@")[0],
        password,
        createdAt: data.user.created_at ?? new Date().toISOString(),
        onboardingDone: meta.onboardingDone ?? false,
        quizDone: meta.quizDone ?? false,
        profile: meta.profile ?? null,
        quizResults: meta.quizResults ?? null,
        avatar: meta.avatar ?? "🧠",
      }
      STORE.updateUser(u)
      if (Array.isArray(meta.sessions) && meta.sessions.length) STORE.setSessions(meta.sessions)
      if (meta.reminders) STORE.setReminders(meta.reminders)
      return u
    }
    if (error) {
      const msg = error.message?.toLowerCase() ?? ""
      if (msg.includes("invalid login") || msg.includes("invalid credentials") || error.status === 400) {
        // Wrong password — check if a local account exists with matching credentials
        const local = STORE.users().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
        if (local) return local
        return "invalid"
      }
      if (msg.includes("email not confirmed")) {
        // Account created but email not yet confirmed — try local fallback
        const local = STORE.users().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
        if (local) return local
        return "invalid"
      }
    }
  } catch {}

  // Supabase unreachable — fall back to localStorage
  const local = STORE.users().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
  if (local) return local

  // No local account either — create one offline so the user isn't blocked
  const offlineUser: AppUser = {
    id: Date.now().toString(), email, name: email.split("@")[0], password,
    createdAt: new Date().toISOString(),
    onboardingDone: false, quizDone: false, profile: null, quizResults: null, avatar: "🧠",
  }
  STORE.updateUser(offlineUser)
  return offlineUser
}

async function doCreate(email: string, password: string): Promise<AppUser | "exists" | "error"> {
  const name = email.split("@")[0]

  // Try Supabase Auth first
  try {
    const { data, error } = await API.authSignUp(email, password, name)
    if (error) {
      const msg = error.message?.toLowerCase() ?? ""
      if (msg.includes("already registered") || msg.includes("user already exists") || error.status === 422) return "exists"
      // Other error — fall through to offline
    } else if (data?.user) {
      const u: AppUser = {
        id: data.user.id,
        email: data.user.email ?? email,
        name,
        password,
        createdAt: data.user.created_at ?? new Date().toISOString(),
        onboardingDone: false,
        quizDone: false,
        profile: null,
        quizResults: null,
        avatar: "🧠",
      }
      STORE.updateUser(u)
      // Push initial metadata so login can restore it later
      API.authUpdateMeta({ name, avatar: "🧠", onboardingDone: false, quizDone: false }).catch(() => {})
      return u
    }
  } catch {}

  // Supabase unreachable — create locally
  if (STORE.users().find(u => u.email.toLowerCase() === email.toLowerCase())) return "exists"
  const u: AppUser = {
    id: Date.now().toString(), email, name, password,
    createdAt: new Date().toISOString(),
    onboardingDone: false, quizDone: false, profile: null, quizResults: null, avatar: "🧠",
  }
  STORE.updateUser(u)
  return u
}

function todaySessions(): Session[] {
  const today = new Date().toISOString().split("T")[0]
  return STORE.sessions().filter(s => s.date === today)
}

function addSession(s: Session, userId?: string) {
  const all = STORE.sessions(); all.push(s); STORE.setSessions(all)
  if (userId) API.addSession(userId, s).catch(() => {}) // fire-and-forget
}

function updateFeedback(id: string, fb: Record<string, number>, userId?: string) {
  const all = STORE.sessions()
  const s = all.find(x => x.id === id)
  if (s) { s.feedback = fb; STORE.setSessions(all) }
  if (userId) API.updateSession(userId, id, fb, undefined).catch(() => {})
}

function updateSessionNotes(id: string, notes: string, userId?: string) {
  const all = STORE.sessions()
  const s = all.find(x => x.id === id)
  if (s) { s.notes = notes; STORE.setSessions(all) }
  if (userId) API.updateSession(userId, id, undefined, notes).catch(() => {})
}

// ── Concern-Level Color System ─────────────────────────────────────────────────

type Concern = "green" | "yellow" | "orange" | "red"

const CONCERN_META: Record<Concern, { label: string; dot: string; bg: string; text: string; border: string }> = {
  green:  { label: "Doing Well",        dot: "#3E9E6F", bg: "#EAF6EF", text: "#1F5C3F", border: "#BFE3CE" },
  yellow: { label: "Mild Concern",      dot: "#D9A833", bg: "#FBF4E2", text: "#7A5A12", border: "#EBD9A6" },
  orange: { label: "Moderate Concern",  dot: "#DE8A3D", bg: "#FBEEE0", text: "#8A4E14", border: "#EED2AF" },
  red:    { label: "High Concern",      dot: "#C0563F", bg: "#F9EAE6", text: "#8A2E1C", border: "#EBC4B9" },
}

const STATE_CONCERN: Record<CognitiveState, Concern> = {
  balanced: "green",
  "hyperfocus-productive": "green",
  "motivation-deficit": "yellow",
  "hyperfocus-unproductive": "orange",
  "fatigue-failure": "orange",
  "executive-dysfunction": "orange",
  "emotional-dysregulation": "red",
  overload: "red",
}

function ConcernBadge({ state, size = "sm" }: { state: CognitiveState; size?: "sm" | "md" }) {
  const c = CONCERN_META[STATE_CONCERN[state]]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[11px]"}`}
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      <span className="rounded-full" style={{ width: size === "md" ? 9 : 7, height: size === "md" ? 9 : 7, background: c.dot }} />
      {c.label}
    </span>
  )
}

function ConcernDot({ state }: { state: CognitiveState }) {
  const c = CONCERN_META[STATE_CONCERN[state]]
  return <span className="rounded-full flex-shrink-0" style={{ width: 9, height: 9, background: c.dot }} title={c.label} />
}

// ── Cognitive State Engine ────────────────────────────────────────────────────

// Context helpers derived from the check-in, aligned to the Phase 4 detection table.
// The variants in the spec lean heavily on these context signals (Medications = Off,
// Time = Night, Environment = Noisy/distracting), so they must feed the scoring.
function isNightish(t: TimeOfDay): boolean { return t === "evening" }               // "night" proxy
function isDistractingEnv(e: Environment): boolean { return e === "home-others" || e === "cafe" }
function isCalmEnv(e: Environment): boolean { return e === "home-solo" || e === "outside" }
function medsUnsupported(m: MedStatus): boolean { return m === "skipping" || m === "not-yet" }

// Returns the full score breakdown so callers can also surface WHY a state was inferred.
function scoreCognitiveStates(d: CheckInData): Record<CognitiveState, number> {
  const scores: Record<string, number> = {}

  // ── Cognitive Overload (Variants: high stress+low focus+high workload at night;
  //    fatigue+studying in noisy env; high stress+low motivation off-meds) ──
  let s = 0
  if (d.stress >= 5) s += 3; else if (d.stress >= 4) s += 2
  if (d.focus <= 1) s += 3; else if (d.focus <= 2) s += 2
  if (d.fatigue >= 4) s += 1
  if (d.workload >= 4) s += 1
  if (d.taskDifficulty >= 4) s += 1
  if (isNightish(d.timeOfDay)) s += 1                                    // Time = Night
  if (isDistractingEnv(d.environment) && d.currentActivity === "studying") s += 1
  if (medsUnsupported(d.meds) && d.stress >= 4 && d.motivation <= 2) s += 1
  scores["overload"] = s

  // ── Motivation Deficit ──
  s = 0
  if (d.motivation <= 1) s += 4; else if (d.motivation <= 2) s += 3
  if (d.activityFeeling === "dreading") s += 2; else if (d.activityFeeling === "bored") s += 1
  if (d.energy <= 2) s += 1
  if (d.currentActivity === "admin") s += 1                             // boring/low-reward task
  if (d.stress <= 2 && d.fatigue <= 2 && d.sleepiness <= 2) s += 1      // deficit without overload/fatigue
  scores["motivation-deficit"] = s

  // ── Hyperfocus (Productive) ──
  s = 0
  if (d.focus >= 5) s += 3; else if (d.focus >= 4) s += 2
  if (d.motivation >= 4) s += 2
  if (d.activityFeeling === "loving") s += 2; else if (d.activityFeeling === "interested") s += 1
  if (["studying", "working", "creative"].includes(d.currentActivity)) s += 1
  if (d.stress <= 2) s += 1
  if (isCalmEnv(d.environment)) s += 1                                  // quiet/structured context
  if (d.meds === "took") s += 1                                         // medication on/effective
  // Scrolling is never productive hyperfocus — hard reset regardless of other signals.
  // Without this, very high focus+motivation+loving can outscore unproductive hyperfocus
  // even while doomscrolling, causing the app to incorrectly tell the user to "protect their flow."
  if (d.currentActivity === "scrolling") s = 0
  scores["hyperfocus-productive"] = s

  // ── Hyperfocus (Unproductive) ──
  s = 0
  if (d.focus >= 4) s += 2
  if (d.currentActivity === "scrolling") s += 4
  if (d.activityFeeling === "loving" || d.activityFeeling === "interested") s += 2
  if (d.motivation <= 2) s += 1                                         // low drive for the INTENDED task
  if (d.stress >= 4) s += 1                                             // hyperfocus-as-escape under pressure
  scores["hyperfocus-unproductive"] = s

  // ── Fatigue-Induced Attention Failure ──
  s = 0
  if (d.sleepiness >= 5) s += 4; else if (d.sleepiness >= 4) s += 3
  if (d.fatigue >= 5) s += 3; else if (d.fatigue >= 4) s += 2
  if (d.energy <= 2) s += 2
  if (d.focus <= 2) s += 1
  if (d.sleep <= 2) s += 1                                              // poor sleep quality
  if (isNightish(d.timeOfDay)) s += 1                                   // unproductive circadian window
  if (medsUnsupported(d.meds)) s += 1                                   // meds off/withheld
  scores["fatigue-failure"] = s

  // ── Emotional Dysregulation ──
  s = 0
  if (d.mood === "anxious") s += 3; else if (d.mood === "low") s += 2
  if (d.stress >= 4) s += 3; else if (d.stress >= 3) s += 1
  if (d.fatigue >= 3) s += 1
  if (d.focus <= 2) s += 1
  if (d.sleep <= 2) s += 1                                              // poor sleep amplifies reactivity
  if (isDistractingEnv(d.environment) || d.environment === "office") s += 1  // social/eval pressure
  scores["emotional-dysregulation"] = s

  // ── Executive Dysfunction / Initiation Paralysis ──
  s = 0
  if (d.focus <= 2) s += 2
  if (d.stress >= 3) s += 2
  if (d.taskDifficulty >= 4) s += 2
  if (d.workload >= 4) s += 2
  if (d.motivation >= 2 && d.motivation <= 3) s += 1                    // wants to act but stuck
  if (["working", "studying", "admin"].includes(d.currentActivity)) s += 1
  if (medsUnsupported(d.meds)) s += 1                                   // arousal regulation insufficient
  scores["executive-dysfunction"] = s

  scores["balanced"] = 0
  return scores as Record<CognitiveState, number>
}

function detectCognitiveState(d: CheckInData): CognitiveState {
  const scores = scoreCognitiveStates(d)
  const entries = Object.entries(scores).filter(([k]) => k !== "balanced")
  const max = Math.max(...entries.map(([, v]) => v))
  if (max < 3) return "balanced"
  return (entries.find(([, v]) => v === max)?.[0] as CognitiveState) ?? "balanced"
}

// ── State Info + Literature ───────────────────────────────────────────────────

interface StateInfo {
  label: string; description: string; color: string; bg: string
  Icon: React.ElementType; priority: string
  literature: { title: string; body: string; cite: string }[]
}

const STATE_INFO: Record<CognitiveState, StateInfo> = {
  overload: {
    label: "Cognitive Overload", color: "#8A4A5C", bg: "#F9F0F3", Icon: AlertCircle, priority: "High priority",
    description: "Your working memory is at capacity. The best move right now is to reduce demand — not push through.",
    literature: [
      { title: "Working Memory & ADHD", body: "ADHD is associated with a 30–40% reduction in working memory capacity relative to neurotypical peers. When the system is saturated, cognitive performance degrades non-linearly — errors multiply and decision-making quality drops sharply.", cite: "Barkley (2012), Executive Functions" },
      { title: "Why You Can't Just 'Try Harder'", body: "Cognitive overload in ADHD is physiological, not motivational. The prefrontal cortex has a hard capacity ceiling that cannot be exceeded through willpower. Reducing task load is the only evidence-based strategy — not self-discipline.", cite: "Brown (2013), A New Understanding of ADHD" },
      { title: "The Role of Cortisol", body: "Chronic overload elevates cortisol, which further impairs working memory and executive function — creating a negative feedback loop. Breaking the cycle requires a genuine pause, not a shorter task.", cite: "Zylowska (2008), The Mindfulness Prescription" },
    ]
  },
  "motivation-deficit": {
    label: "Motivation Deficit", color: "#5C4E8A", bg: "#F4F2FA", Icon: Zap, priority: "High priority",
    description: "Your brain's reward circuitry is quiet. External structure and novelty can help re-engage it.",
    literature: [
      { title: "Dopamine & ADHD Motivation", body: "ADHD brains have reduced dopamine transporter availability, meaning the reward signal for future goals is weaker. Tasks only become motivating when they are novel, urgent, challenging, or interest-driven — the ADHD Motivation Equation.", cite: "Volkow et al. (2009), JAMA" },
      { title: "Interest-Based Nervous System", body: "Dr. William Dodson's research describes ADHD motivation as governed by an 'interest-based nervous system' rather than importance or deadlines. Without genuine interest or urgency, initiation is neurologically impaired — not a character flaw.", cite: "Dodson (2016), ADDitude Magazine" },
      { title: "External Reward as Compensation", body: "When intrinsic motivation is absent, external rewards (immediate, concrete, personally meaningful) can artificially bridge the dopamine gap. This is the evidence basis for token economies and reward-pairing in ADHD CBT.", cite: "Solanto (2022), Cognitive-Behavioral Therapy for ADHD" },
    ]
  },
  "hyperfocus-productive": {
    label: "Productive Hyperfocus", color: "#2D4A3E", bg: "#EEF4F1", Icon: Target, priority: "Moderate — protect this",
    description: "You're in a flow state. Protect it — but also remember to hydrate and take micro-breaks.",
    literature: [
      { title: "Hyperfocus as Strength", body: "Hyperfocus is one of ADHD's most powerful assets when channeled toward meaningful tasks. Research shows ADHD individuals in hyperfocus can sustain attention well beyond neurotypical peers — up to 6+ hours on high-interest tasks.", cite: "Hupfeld et al. (2019), Psychological Research" },
      { title: "Sustaining Hyperfocus Safely", body: "Without external cues, hyperfocus suppresses interoceptive awareness — you stop noticing hunger, thirst, and physical discomfort. Structured interruption cues (timers, alarms) preserve the session while preventing burnout.", cite: "Adan (2012), Frontiers in Psychology" },
      { title: "When to Protect It", body: "Productive hyperfocus is rare and valuable. Research on ADHD wellbeing shows these states are often followed by crashes if basic needs are neglected. Short maintenance breaks (30–60 min intervals) significantly extend productive sessions.", cite: "Ratey (2008), Spark" },
    ]
  },
  "hyperfocus-unproductive": {
    label: "Unproductive Hyperfocus", color: "#8B6A47", bg: "#F7F2EC", Icon: RefreshCw, priority: "High priority",
    description: "Your attention is locked onto something other than your intended task. A gentle redirect is needed.",
    literature: [
      { title: "The Capture Effect", body: "ADHD brains are particularly susceptible to 'attentional capture' — automatic redirection to high-stimulation stimuli. The same dopamine pathway that enables hyperfocus on interesting tasks also makes disengagement from non-productive activities neurologically difficult.", cite: "Barkley (1997), ADHD and the Nature of Self-Control" },
      { title: "Why Harsh Stopping Backfires", body: "Abruptly ending unproductive hyperfocus triggers emotional backlash in ADHD — frustration, shame, or anger that makes re-engagement with the intended task even harder. Gradual, permission-based transitions are significantly more effective.", cite: "Shaw et al. (2014), Emotional Dysregulation in ADHD" },
      { title: "Time Blindness & Scrolling", body: "Digital media is engineered to exploit ADHD reward systems. Time blindness makes it impossible to subjectively gauge how long you've been scrolling. External timers are the only reliable interrupt mechanism.", cite: "Barkley (2012), Executive Functions" },
    ]
  },
  "fatigue-failure": {
    label: "Fatigue-Induced Attention Failure", color: "#7A6E60", bg: "#F3F0EC", Icon: Bed, priority: "High priority",
    description: "Sleepiness and fatigue are interfering with sustained attention. Rest first, then task.",
    literature: [
      { title: "ADHD & Sleep Dysregulation", body: "Up to 73% of adults with ADHD report chronic sleep problems. The ADHD circadian system is often delayed by 1.5–2 hours, meaning many individuals are neurologically under-slept even when they sleep a normal number of hours.", cite: "Cortese et al. (2006), Sleep Medicine Reviews" },
      { title: "Fatigue & Executive Function", body: "Sleep deprivation compounds ADHD executive dysfunction multiplicatively, not additively. Attempting high-cognitive-demand tasks while fatigued produces error rates 3–4x higher than either condition alone.", cite: "Gruber et al. (2012), Research on ADHD" },
      { title: "The Power of Rest Breaks", body: "Brief intentional rest (10-20 min, non-sleep) restores alertness measurably within the ADHD brain. Unlike full naps, short rest periods avoid sleep inertia while recovering dopaminergic capacity.", cite: "Mednick (2006), Take a Nap!" },
    ]
  },
  "emotional-dysregulation": {
    label: "Emotional Dysregulation", color: "#4A7B6F", bg: "#EFF5F3", Icon: Heart, priority: "High priority",
    description: "Heightened emotional reactivity is disrupting your cognitive control. Regulation before tasks.",
    literature: [
      { title: "Emotional Dysregulation in ADHD", body: "Emotional dysregulation is now considered a core symptom of ADHD by leading researchers, affecting up to 70% of adults. The ADHD brain's reduced inhibition applies to emotional impulses as well as behavioral ones.", cite: "Shaw et al. (2014), American Journal of Psychiatry" },
      { title: "The Amygdala-PFC Circuit", body: "In ADHD, the amygdala (emotional processing) is less effectively modulated by the prefrontal cortex. This means emotional reactions are faster, stronger, and harder to regulate than in neurotypical brains — not a personality trait.", cite: "Posner et al. (2014), Neuroscience & Biobehavioral Reviews" },
      { title: "DBT for ADHD Emotion Regulation", body: "Dialectical Behavior Therapy (DBT) techniques — particularly affect labeling, grounding, and opposite action — show strong evidence for ADHD emotional dysregulation. These strategies bypass verbal reasoning (which is impaired during dysregulation) and work through the body.", cite: "Ramsay & Rostain (2015), CBT for Adult ADHD" },
    ]
  },
  "executive-dysfunction": {
    label: "Initiation Paralysis", color: "#3D5A80", bg: "#EFF3F8", Icon: Brain, priority: "High priority",
    description: "You know what needs doing, but starting feels impossible. This is executive dysfunction — not laziness.",
    literature: [
      { title: "Why Starting Is the Hardest Part", body: "Executive dysfunction in ADHD specifically impairs task initiation — the 'ignition system' that bridges intention to action. Brain imaging shows reduced activation in the anterior cingulate cortex, which normally catalyzes goal-directed behavior.", cite: "Fassbender et al. (2009), NeuroImage" },
      { title: "It Is Not Laziness", body: "People with ADHD often know exactly what they need to do and can describe it in detail — yet remain unable to start. This disconnect between knowledge and action is the hallmark of executive dysfunction, and it is neurological, not motivational or moral.", cite: "Brown (2013), Smart But Stuck" },
      { title: "Micro-Action Theory", body: "Research supports the 'micro-action' approach: reducing the activation energy required to begin by specifying one concrete physical action (open document, write one word). This lowers the prefrontal threshold and can trigger initiation even during paralysis states.", cite: "Solanto (2022), Cognitive-Behavioral Therapy for Adult ADHD" },
    ]
  },
  balanced: {
    label: "Balanced State", color: "#4A7B6F", bg: "#EFF5F3", Icon: CheckCircle2, priority: "Maintenance",
    description: "No strong distress signals. Here are strategies to make the most of where you are right now.",
    literature: [
      { title: "What Balanced Means for ADHD", body: "A balanced ADHD state does not mean symptoms are absent — it means the brain's regulatory systems are in relative equilibrium. This is the optimal window for structured, high-value work and habit formation.", cite: "Zylowska (2008), The Mindfulness Prescription" },
      { title: "Using Balanced States for Habit Building", body: "Research shows habits form more reliably when practiced in stable emotional and cognitive states. Balanced periods are the best time to establish routines that will carry through more dysregulated states.", cite: "Lally et al. (2010), European Journal of Social Psychology" },
      { title: "Prevention Over Treatment", body: "Balanced check-ins that occur before dysregulation allow for protective interventions — hydration, environment management, pre-task structuring. Proactive ADHD management consistently outperforms reactive management in outcome studies.", cite: "Barkley (2012), Executive Functions" },
    ]
  },
}

// ── Recommendation Pools ──────────────────────────────────────────────────────

const STATE_RECS: Record<CognitiveState, Rec[]> = {
  overload: [
    { id: "ol-microstep", title: "Break Into One Micro-Step", category: "Task Strategy", color: "#5C4E8A", Icon: List,
      brief: "Identify only the very next physical action — not the project, just one step.",
      why: "Cognitive overload stems from limited working memory being exceeded by task demands. Reducing scope to a single concrete action restores executive control.",
      howTo: "Write the absolute next physical action: not 'finish essay' but 'open document and write one sentence.' Do only that.", duration: "5 min" },
    { id: "ol-resetbreak", title: "5-Minute Reset Break", category: "Body Reset", color: "#B8864E", Icon: RefreshCw,
      brief: "Completely stop working for 5 minutes — no screens, no input.",
      why: "The ADHD brain's energetic systems deplete under sustained overload. A genuine sensory pause allows working memory resources to partially restore.",
      howTo: "Set a timer for 5 minutes. Close everything. Look out a window, lie on the floor, or sit quietly. Do not check your phone.", duration: "5 min" },
    { id: "ol-breathing", title: "4-7-8 Breathing", category: "Anxiety Relief", color: "#4A7B6F", Icon: Wind,
      brief: "Structured breathing to downregulate your stress response before returning to work.",
      why: "Extended exhale activates the parasympathetic system and lowers cortisol, reducing the physiological component of overload within 4 minutes.",
      howTo: "Inhale for 4 counts. Hold for 7. Exhale fully for 8. Repeat 4 cycles.", duration: "4 min" },
    { id: "ol-reduce", title: "Reduce Inputs Now", category: "Environment", color: "#2D4A3E", Icon: Home,
      brief: "Close everything except the one thing you're working on.",
      why: "External distractors compete for limited attentional resources and worsen working-memory load.",
      howTo: "Close every browser tab except one. Silence notifications. Put your phone in another room.", duration: "Immediate" },
  ],
  "motivation-deficit": [
    { id: "md-reward", title: "Define a Micro-Reward", category: "Motivation", color: "#B8864E", Icon: Star,
      brief: "Pair a small immediate reward with completing the next step.",
      why: "ADHD brains are driven by immediate reward salience. External reward contingency can temporarily normalize the reward pathway's role in task initiation.",
      howTo: "Before starting, decide what you'll do after 25 minutes of work. Make it specific and enjoyable. The reward must follow immediately.", duration: "Define in 2 min" },
    { id: "md-bodydouble", title: "Body Doubling", category: "Social Focus", color: "#2D4A3E", Icon: Users,
      brief: "Work alongside another person to activate focus through social presence.",
      why: "Social presence increases prefrontal activation in ADHD brains and provides accountability that compensates for motivation deficits.",
      howTo: "Open Focusmate.com, FaceTime a friend to work in parallel, or head to a library. You don't need to talk — just share space.", duration: "25–90 min" },
    { id: "md-subtask", title: "Switch to a More Engaging Piece", category: "Task Strategy", color: "#5C4E8A", Icon: Zap,
      brief: "Pivot temporarily to the most interesting part of the work.",
      why: "ADHD motivation is strongly tied to task interest. Starting with a higher-salience subtask activates dopamine that carries into less interesting work.",
      howTo: "Pick the subtask you find most interesting. Work on it for 15 min, then return to the main task.", duration: "15 min" },
    { id: "md-pomodoro", title: "25-Minute Pomodoro", category: "Task Strategy", color: "#5C4E8A", Icon: Timer,
      brief: "Time-box one task to 25 minutes to make the demand feel finite.",
      why: "Time-boxing reduces the perceived enormity of tasks and provides a built-in completion reward, increasing initiation for ADHD brains.",
      howTo: "Write ONE task only. Set timer for 25 min. Work only on that. When it rings — stop. Take a 5-min break.", duration: "30 min blocks" },
  ],
  "hyperfocus-productive": [
    { id: "hfp-checkin", title: "Set a 30-Minute Check-In Timer", category: "Wellbeing", color: "#B8864E", Icon: Clock,
      brief: "Protect this flow state while scheduling a gentle surface check.",
      why: "Productive hyperfocus can lead to neglect of basic needs. Light-touch prompting preserves the state while preventing burnout.",
      howTo: "Set a recurring timer every 30 minutes. When it fires: drink water, check posture, take 2 breaths before continuing.", duration: "Ongoing" },
    { id: "hfp-water", title: "Hydrate Before You Continue", category: "Body Reset", color: "#B8864E", Icon: Droplets,
      brief: "Drink water now — hyperfocus suppresses thirst signals.",
      why: "Hyperfocus suppresses interoceptive awareness including thirst. Even mild dehydration impairs the sustained attention you're currently leveraging.",
      howTo: "Drink a full glass of water (300ml+) before returning to your work. Set a reminder to hydrate again in 45 min.", duration: "2 min" },
    { id: "hfp-protect", title: "Protect This Session", category: "Focus Tools", color: "#2D4A3E", Icon: CheckCircle2,
      brief: "Eliminate interruption risks before going back in.",
      why: "External interruptions during hyperfocus create significant attentional switching costs and emotional frustration in ADHD.",
      howTo: "Put phone on Do Not Disturb. Close all non-essential tabs. Post a 'Do Not Disturb' signal if others are nearby.", duration: "2 min now" },
    { id: "hfp-posture", title: "Quick Posture Reset", category: "Body Reset", color: "#B8864E", Icon: Activity,
      brief: "30 seconds of movement to keep your body sustainable through the session.",
      why: "Prolonged static posture during hyperfocus increases physical tension and fatigue.",
      howTo: "Stand up. Roll shoulders. Stretch neck side to side. Shake out hands. Sit back down. Done in under 30 seconds.", duration: "30 sec" },
  ],
  "hyperfocus-unproductive": [
    { id: "hfu-onemore", title: "\"One More Minute\" Rule", category: "Redirect", color: "#4A7B6F", Icon: Clock,
      brief: "Give yourself permission for one more minute — then commit to switching.",
      why: "Harsh interruption of ADHD hyperfocus triggers emotional backlash. Low-friction transition cues are more effective.",
      howTo: "Say: 'One more minute, then I switch.' When that minute is up, close the app/tab completely.", duration: "1 min" },
    { id: "hfu-surface", title: "Surface Your Intended Task", category: "Task Strategy", color: "#5C4E8A", Icon: List,
      brief: "Write down the task you've been avoiding, specifically and concretely.",
      why: "ADHD attention drifts partly because the intended task is vague or aversive. Making it concrete and visible reduces cognitive effort to re-engage.",
      howTo: "Write: 'I need to [task] because [why it matters]. The first step is [action].' Place this where you can see it.", duration: "3 min" },
    { id: "hfu-timer", title: "Set a 5-Minute Transition Timer", category: "Timing", color: "#8B6A47", Icon: Timer,
      brief: "Give your brain a defined endpoint for the current distraction.",
      why: "ADHD time blindness makes open-ended activities feel endless. A timer externalizes time and creates a stop point.",
      howTo: "Set a timer for 5 minutes. When it rings: close whatever you're doing immediately. No negotiating.", duration: "5 min + switch" },
    { id: "hfu-acknowledge", title: "Name the Avoidance", category: "Self-Awareness", color: "#4A7B6F", Icon: Heart,
      brief: "Acknowledge why the intended task feels aversive before redirecting.",
      why: "Avoidance is often driven by emotional resistance. Naming the feeling reduces its power — a core DBT-informed ADHD strategy.",
      howTo: "Finish aloud or in writing: 'I am avoiding [task] because it feels [emotion]. What I actually need is [need].' Then redirect.", duration: "3 min" },
  ],
  "fatigue-failure": [
    { id: "ff-nap", title: "10-Minute Power Rest", category: "Body Reset", color: "#B8864E", Icon: Bed,
      brief: "A short intentional rest to restore alertness.",
      why: "Brief rest (10-20 min) significantly improves vigilance and sustained attention without causing sleep inertia.",
      howTo: "Set a timer for 10 minutes. Lie down, close your eyes, and rest. Keep the room bright to avoid deep sleep.", duration: "10 min" },
    { id: "ff-movement", title: "5-Minute Movement", category: "Body Reset", color: "#B8864E", Icon: Activity,
      brief: "Physical movement to temporarily raise arousal and alertness.",
      why: "Exercise increases norepinephrine and dopamine, directly countering the hypo-arousal state. Even 5 minutes produces measurable attention improvements.",
      howTo: "Do jumping jacks, a brisk walk, or vigorous stretching for 5 minutes. Enough to raise your heart rate slightly.", duration: "5 min" },
    { id: "ff-lightertask", title: "Switch to a Lighter Task", category: "Task Strategy", color: "#5C4E8A", Icon: List,
      brief: "Move your demanding work to a better alertness window.",
      why: "Cognitive performance is tightly linked to arousal state. Attempting high-demand work during fatigue leads to errors. Matching task to arousal is evidence-based.",
      howTo: "Defer the hard task for now. Switch to something low-cognitive: filing, organizing, gentle emails. Return when rested.", duration: "As needed" },
    { id: "ff-light", title: "Bright Light Exposure", category: "Body Reset", color: "#B8864E", Icon: Sun,
      brief: "Expose yourself to bright light to boost alertness through circadian pathways.",
      why: "Bright light suppresses melatonin and activates alerting pathways — effective for ADHD-related circadian delays.",
      howTo: "Go outside for 5-10 minutes of natural light. If indoors, sit near a bright window or use a 10,000 lux lamp.", duration: "5–10 min" },
  ],
  "emotional-dysregulation": [
    { id: "ed-grounding", title: "5-4-3-2-1 Grounding", category: "Anxiety Relief", color: "#4A7B6F", Icon: Waves,
      brief: "A sensory grounding technique to interrupt emotional flooding.",
      why: "Redirecting attention from internal reactivity to external sensory details reduces amygdala activation within 3-5 minutes.",
      howTo: "Name aloud: 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Do each one slowly.", duration: "3–5 min" },
    { id: "ed-breathing", title: "4-7-8 Breathing", category: "Anxiety Relief", color: "#4A7B6F", Icon: Wind,
      brief: "Structured breathing to shift your nervous system out of high alert.",
      why: "The extended exhale activates the parasympathetic nervous system and lowers cortisol.",
      howTo: "Inhale for 4 counts. Hold for 7. Exhale for 8. Repeat 4 cycles. Do this before any task or interaction.", duration: "4 min" },
    { id: "ed-stepaway", title: "Leave the Triggering Context", category: "Environment", color: "#2D4A3E", Icon: MapPin,
      brief: "Physically move away from the environment amplifying your distress.",
      why: "ADHD emotional dysregulation is context-sensitive. Removing yourself from the triggering setting creates space for re-regulation.",
      howTo: "Go to a different room, step outside, or take a short walk. Just change your physical location for 5-10 minutes.", duration: "5–10 min" },
    { id: "ed-label", title: "Name Your Emotion", category: "Self-Awareness", color: "#4A7B6F", Icon: Heart,
      brief: "Label what you're feeling precisely — this reduces its intensity.",
      why: "Affect labeling reduces amygdala activation and strengthens prefrontal regulatory control — a core DBT-informed intervention.",
      howTo: "Write or say aloud: 'Right now I feel [emotion] because [trigger]. What I need is [need].' Be specific.", duration: "3 min" },
  ],
  "executive-dysfunction": [
    { id: "exd-microstep", title: "What Is the First Physical Action?", category: "Task Strategy", color: "#5C4E8A", Icon: Target,
      brief: "Identify the single next physical action — not the project, not the plan.",
      why: "Executive dysfunction impairs goal-directed initiation even when the user wants to act. Making the next action concrete bypasses planning demands.",
      howTo: "Ask yourself: 'What is the very next physical thing I would do if I started right now?' Not 'work on project' — but 'open laptop' or 'write one line.' Do only that.", duration: "5 min" },
    { id: "exd-bodydouble", title: "Body Doubling", category: "Social Focus", color: "#2D4A3E", Icon: Users,
      brief: "Get a witness — someone working alongside you changes the equation.",
      why: "Social presence externalizes accountability and reduces initiation resistance by activating social-motivational circuits.",
      howTo: "Call a friend to work quietly together, open Focusmate, or go to a library. Tell them what you're about to work on.", duration: "25–90 min" },
    { id: "exd-environment", title: "Prepare Your Environment First", category: "Environment", color: "#2D4A3E", Icon: Home,
      brief: "Set up your space before trying to start — the setup is the first step.",
      why: "Environmental preparation reduces the activation energy required to begin. A ready environment is an external scaffold for executive function.",
      howTo: "Before trying to work: clear your desk, open only the one document you need, get water, put phone away.", duration: "5 min" },
    { id: "exd-talkout", title: "Say the Task Out Loud", category: "Task Strategy", color: "#5C4E8A", Icon: Users,
      brief: "Explain what you need to do as if teaching someone else.",
      why: "Verbal self-instruction externalizes working memory demands and supports metacognitive awareness.",
      howTo: "Say aloud: 'I need to [task]. The first thing I will do is [step]. It matters because [why].' The act of saying it often triggers initiation.", duration: "3 min" },
  ],
  balanced: [
    { id: "bal-pomodoro", title: "25-Minute Pomodoro", category: "Task Strategy", color: "#5C4E8A", Icon: Timer,
      brief: "A structured work block to make the most of your current steady state.",
      why: "Time-boxing provides regular dopamine rewards from completion cycles and prevents attention drift even in balanced states.",
      howTo: "Write ONE task. Set timer for 25 min. Work only on that. When it rings — take a genuine 5-min break. Repeat.", duration: "30 min blocks" },
    { id: "bal-water", title: "Drink Water First", category: "Body Reset", color: "#B8864E", Icon: Droplets,
      brief: "Hydrate before starting your session.",
      why: "Even mild dehydration (1-2%) measurably impairs working memory and sustained attention.",
      howTo: "Drink 300-500ml of water right now. Keep a glass nearby for your session.", duration: "2 min" },
    { id: "bal-brownnoise", title: "Brown Noise Background", category: "Focus Tools", color: "#7C6E52", Icon: Music,
      brief: "Add consistent ambient audio to maintain focus throughout your session.",
      why: "Consistent low-frequency noise elevates dopamine without engaging language-processing areas.",
      howTo: "Search 'brown noise' on YouTube or use Brain.fm. Set to 50-60% volume and leave it running.", duration: "Full session" },
    { id: "bal-bodydouble", title: "Body Doubling", category: "Social Focus", color: "#2D4A3E", Icon: Users,
      brief: "Work alongside someone to maintain accountability and momentum.",
      why: "Even in a stable state, ADHD brains sustain focus better with social presence.",
      howTo: "Open Focusmate.com, work alongside a friend remotely, or head to a library or café.", duration: "25–90 min" },
    { id: "bal-redirect", title: "Your Brain Is Primed — Use It", category: "Redirect", color: "#2D4A3E", Icon: Zap,
      brief: "Your cognitive conditions are good right now. This is the best window to start something meaningful — not after the scroll.",
      why: "Cognitive readiness is fleeting. Research on ADHD task-switching shows that high-focus, low-stress windows are disproportionately valuable — spending them on passive content consumption wastes the brain's peak regulatory capacity. Redirecting now costs less effort than redirecting later.",
      howTo: "Close what you're scrolling. Write down one task you've been putting off. Commit to just 10 minutes on it — starting is the only goal, not finishing. Set a timer so there's a clear endpoint.", duration: "10 min" },
  ],
}

function findRec(id: string): Rec | undefined {
  for (const pool of Object.values(STATE_RECS)) {
    const r = pool.find(x => x.id === id)
    if (r) return r
  }
}

// ── Label Maps ────────────────────────────────────────────────────────────────

const MOOD_OPTS: { id: Mood; emoji: string; label: string }[] = [
  { id: "low", emoji: "😔", label: "Low / Flat" },
  { id: "anxious", emoji: "😰", label: "Anxious / Overwhelmed" },
  { id: "neutral", emoji: "😐", label: "Neutral / Okay" },
  { id: "good", emoji: "🙂", label: "Good / Motivated" },
  { id: "great", emoji: "😄", label: "Great / Energized" },
]

const ENV_OPTS: { id: Environment; label: string; Icon: React.ElementType }[] = [
  { id: "home-solo", label: "Home (alone)", Icon: Home },
  { id: "home-others", label: "Home (with others)", Icon: Users },
  { id: "office", label: "Office / Workspace", Icon: BarChart3 },
  { id: "cafe", label: "Café / Library", Icon: Coffee },
  { id: "outside", label: "Outside / Nature", Icon: Leaf },
]

const TIME_OPTS: { id: TimeOfDay; label: string; Icon: React.ElementType }[] = [
  { id: "morning", label: "Morning (before noon)", Icon: Sun },
  { id: "midday", label: "Midday (12–2 pm)", Icon: Clock },
  { id: "afternoon", label: "Afternoon (2–6 pm)", Icon: Clock },
  { id: "evening", label: "Evening (after 6 pm)", Icon: Moon },
]

const MED_OPTS: { id: MedStatus; label: string }[] = [
  { id: "took", label: "Taken — already in my system" },
  { id: "not-yet", label: "Not yet — still need to take it" },
  { id: "skipping", label: "Skipping today" },
  { id: "none", label: "I don't take medication" },
]

const ACTIVITY_OPTS: { id: CurrentActivity; emoji: string; label: string }[] = [
  { id: "studying", emoji: "📚", label: "Studying / Reading" },
  { id: "working", emoji: "💻", label: "Deep Work / Focus" },
  { id: "creative", emoji: "🎨", label: "Creative Work" },
  { id: "admin", emoji: "📋", label: "Admin / Emails" },
  { id: "scrolling", emoji: "📱", label: "Browsing / Scrolling" },
  { id: "resting", emoji: "☕", label: "Resting / Break" },
  { id: "commuting", emoji: "🚗", label: "Commuting" },
  { id: "other", emoji: "⚡", label: "Something else" },
]

const FEELING_OPTS: { id: ActivityFeeling; emoji: string; label: string }[] = [
  { id: "dreading", emoji: "😩", label: "Dreading it" },
  { id: "bored", emoji: "😑", label: "Bored / Going through motions" },
  { id: "neutral", emoji: "😐", label: "Neutral / Fine with it" },
  { id: "interested", emoji: "🤔", label: "Interested / Engaged" },
  { id: "loving", emoji: "🤩", label: "Loving it / In the zone" },
]

const FREQ_OPTS = [
  { id: "all-time", label: "All the time" },
  { id: "a-lot", label: "A lot of the time" },
  { id: "sometimes", label: "Sometimes" },
  { id: "rarely", label: "Rarely" },
  { id: "never", label: "Never" },
]

const STRENGTHS_OPTS = ["High energy levels", "Ability to hyperfocus", "Quick problem solving", "High empathy", "Creativity", "Spontaneity", "Resilience", "Enthusiasm"]
const CONDITION_OPTS = ["Anxiety", "Depression", "Autism / ASD", "OCD", "Dyslexia", "Dyspraxia", "None", "Not sure", "Other"]
const AVATAR_OPTS = ["🧠", "⚡", "🌿", "🎯", "💫", "🦋", "🌊", "🔥", "🌸", "🎨", "🦁", "🐢"]

// ── Indonesian Translations ────────────────────────────────────────────────────

const MOOD_OPTS_ID: typeof MOOD_OPTS = [
  { id: "low",     emoji: "😔", label: "Sedih / Datar" },
  { id: "anxious", emoji: "😰", label: "Cemas / Kewalahan" },
  { id: "neutral", emoji: "😐", label: "Biasa / Oke" },
  { id: "good",    emoji: "🙂", label: "Baik / Termotivasi" },
  { id: "great",   emoji: "😄", label: "Luar Biasa / Semangat" },
]
const ENV_OPTS_ID: typeof ENV_OPTS = [
  { id: "home-solo",   label: "Rumah (sendirian)",          Icon: Home },
  { id: "home-others", label: "Rumah (dengan orang lain)",  Icon: Users },
  { id: "office",      label: "Kantor / Ruang Kerja",       Icon: BarChart3 },
  { id: "cafe",        label: "Kafe / Perpustakaan",        Icon: Coffee },
  { id: "outside",     label: "Di Luar / Alam Terbuka",     Icon: Leaf },
]
const TIME_OPTS_ID: typeof TIME_OPTS = [
  { id: "morning",   label: "Pagi (sebelum tengah hari)", Icon: Sun },
  { id: "midday",    label: "Siang (12–14)",              Icon: Clock },
  { id: "afternoon", label: "Sore (14–18)",               Icon: Clock },
  { id: "evening",   label: "Malam (setelah 18)",         Icon: Moon },
]
const MED_OPTS_ID: typeof MED_OPTS = [
  { id: "took",     label: "Sudah diminum — sudah dalam sistem saya" },
  { id: "not-yet",  label: "Belum — masih perlu diminum" },
  { id: "skipping", label: "Melewati hari ini" },
  { id: "none",     label: "Saya tidak minum obat" },
]
const ACTIVITY_OPTS_ID: typeof ACTIVITY_OPTS = [
  { id: "studying",  emoji: "📚", label: "Belajar / Membaca" },
  { id: "working",   emoji: "💻", label: "Kerja Fokus / Konsentrasi" },
  { id: "creative",  emoji: "🎨", label: "Pekerjaan Kreatif" },
  { id: "admin",     emoji: "📋", label: "Admin / Email" },
  { id: "scrolling", emoji: "📱", label: "Browsing / Scrolling" },
  { id: "resting",   emoji: "☕", label: "Istirahat / Jeda" },
  { id: "commuting", emoji: "🚗", label: "Perjalanan" },
  { id: "other",     emoji: "⚡", label: "Hal lain" },
]
const FEELING_OPTS_ID: typeof FEELING_OPTS = [
  { id: "dreading",   emoji: "😩", label: "Tidak mau melakukannya" },
  { id: "bored",      emoji: "😑", label: "Bosan / Asal-asalan" },
  { id: "neutral",    emoji: "😐", label: "Biasa / Oke" },
  { id: "interested", emoji: "🤔", label: "Tertarik / Terlibat" },
  { id: "loving",     emoji: "🤩", label: "Suka / Dalam zona" },
]
const FREQ_OPTS_ID: typeof FREQ_OPTS = [
  { id: "all-time",  label: "Selalu" },
  { id: "a-lot",     label: "Sering" },
  { id: "sometimes", label: "Kadang-kadang" },
  { id: "rarely",    label: "Jarang" },
  { id: "never",     label: "Tidak pernah" },
]

const STATE_LABEL_ID: Record<CognitiveState, string> = {
  overload:                  "Kelebihan Beban Kognitif",
  "motivation-deficit":      "Defisit Motivasi",
  "hyperfocus-productive":   "Hiperfokus Produktif",
  "hyperfocus-unproductive": "Hiperfokus Tidak Produktif",
  "fatigue-failure":         "Kegagalan Perhatian Akibat Kelelahan",
  "emotional-dysregulation": "Disregulasi Emosional",
  "executive-dysfunction":   "Kelumpuhan Inisiasi",
  balanced:                  "Kondisi Seimbang",
}
const STATE_DESC_ID: Record<CognitiveState, string> = {
  overload:                  "Memori kerja kamu sedang penuh. Langkah terbaik sekarang adalah mengurangi beban — bukan memaksakan diri.",
  "motivation-deficit":      "Sirkuit hadiah otak kamu sedang sepi. Struktur eksternal dan hal baru dapat membantu mengaktifkannya kembali.",
  "hyperfocus-productive":   "Kamu sedang dalam kondisi aliran. Jaga kondisi ini — tapi jangan lupa minum air dan istirahat sebentar.",
  "hyperfocus-unproductive": "Perhatianmu terkunci pada hal lain selain tugas yang seharusnya. Pengalihan yang lembut diperlukan.",
  "fatigue-failure":         "Kantuk dan kelelahan mengganggu kemampuan konsentrasimu. Istirahat dulu, baru bekerja.",
  "emotional-dysregulation": "Reaktivitas emosi yang tinggi mengganggu kendali kognitifmu. Regulasi dulu sebelum memulai tugas.",
  "executive-dysfunction":   "Kamu tahu apa yang harus dilakukan, tapi memulainya terasa mustahil. Ini adalah disfungsi eksekutif — bukan kemalasan.",
  balanced:                  "Tidak ada sinyal stres yang kuat. Berikut strategi untuk memaksimalkan kondisimu saat ini.",
}
const STATE_PRIORITY_ID: Record<CognitiveState, string> = {
  overload:                  "Prioritas Tinggi",
  "motivation-deficit":      "Prioritas Tinggi",
  "hyperfocus-productive":   "Sedang — jaga ini",
  "hyperfocus-unproductive": "Prioritas Tinggi",
  "fatigue-failure":         "Prioritas Tinggi",
  "emotional-dysregulation": "Prioritas Tinggi",
  "executive-dysfunction":   "Prioritas Tinggi",
  balanced:                  "Pemeliharaan",
}

type RecTrans = { title: string; category: string; brief: string; why: string; howTo: string; duration: string }
const REC_ID: Record<string, RecTrans> = {
  "ol-microstep":    { title: "Pecah Menjadi Satu Langkah Kecil",         category: "Strategi Tugas",    brief: "Identifikasi hanya tindakan fisik berikutnya — bukan proyeknya, hanya satu langkah.",                          why: "Kelebihan beban kognitif terjadi karena kapasitas memori kerja terlampaui. Mengurangi ruang lingkup ke satu tindakan konkret memulihkan kendali eksekutif.",                                            howTo: "Tulis tindakan fisik berikutnya: bukan 'selesaikan esai' tapi 'buka dokumen dan tulis satu kalimat.' Lakukan hanya itu.",                                                     duration: "5 menit" },
  "ol-resetbreak":   { title: "Jeda Reset 5 Menit",                        category: "Reset Tubuh",       brief: "Berhenti bekerja sepenuhnya selama 5 menit — tanpa layar, tanpa input.",                                     why: "Otak ADHD membutuhkan jeda sensorik nyata untuk memulihkan sumber daya memori kerja.",                                                                                           howTo: "Atur timer 5 menit. Tutup semua hal. Lihat ke luar jendela, berbaring di lantai, atau duduk diam. Jangan periksa ponselmu.",                                                 duration: "5 menit" },
  "ol-breathing":    { title: "Pernapasan 4-7-8",                           category: "Pereda Kecemasan",  brief: "Pernapasan terstruktur untuk menurunkan respons stres sebelum kembali bekerja.",                             why: "Hembusan napas panjang mengaktifkan sistem parasimpatik dan menurunkan kortisol dalam 4 menit.",                                                                                 howTo: "Hirup selama 4 hitungan. Tahan selama 7. Hembuskan penuh selama 8. Ulangi 4 siklus.",                                                                                       duration: "4 menit" },
  "ol-reduce":       { title: "Kurangi Input Sekarang",                     category: "Lingkungan",        brief: "Tutup semua kecuali satu hal yang sedang kamu kerjakan.",                                                   why: "Gangguan eksternal bersaing untuk sumber daya perhatian yang terbatas dan memperburuk beban memori kerja.",                                                                     howTo: "Tutup setiap tab browser kecuali satu. Bisukan notifikasi. Taruh ponselmu di ruangan lain.",                                                                                 duration: "Segera" },
  "md-reward":       { title: "Tentukan Hadiah Kecil",                      category: "Motivasi",          brief: "Pasangkan hadiah kecil segera dengan menyelesaikan langkah berikutnya.",                                    why: "Otak ADHD didorong oleh daya tarik hadiah segera. Kontigensi hadiah eksternal dapat sementara menormalisasi peran jalur hadiah dalam memulai tugas.",                          howTo: "Sebelum mulai, putuskan apa yang akan kamu lakukan setelah 25 menit bekerja. Buat spesifik dan menyenangkan. Hadiah harus segera menyusul.",                                duration: "Tentukan dalam 2 menit" },
  "md-bodydouble":   { title: "Body Doubling",                              category: "Fokus Sosial",      brief: "Bekerja bersama orang lain untuk mengaktifkan fokus melalui kehadiran sosial.",                             why: "Kehadiran sosial meningkatkan aktivasi prefrontal pada otak ADHD dan memberikan akuntabilitas yang mengkompensasi defisit motivasi.",                                           howTo: "Buka Focusmate.com, FaceTime teman untuk bekerja paralel, atau pergi ke perpustakaan. Kamu tidak perlu bicara — cukup berbagi ruang.",                                      duration: "25–90 menit" },
  "md-subtask":      { title: "Beralih ke Bagian yang Lebih Menarik",       category: "Strategi Tugas",    brief: "Sementara beralih ke bagian pekerjaan yang paling menarik.",                                                why: "Motivasi ADHD sangat terkait dengan minat tugas. Memulai dengan sub-tugas yang lebih menarik mengaktifkan dopamin yang berlanjut ke pekerjaan yang kurang menarik.",           howTo: "Pilih sub-tugas yang paling kamu minati. Kerjakan selama 15 menit, lalu kembali ke tugas utama.",                                                                            duration: "15 menit" },
  "md-pomodoro":     { title: "Pomodoro 25 Menit",                          category: "Strategi Tugas",    brief: "Batasi waktu satu tugas selama 25 menit agar tuntutannya terasa terbatas.",                                why: "Pembatasan waktu mengurangi persepsi besarnya tugas dan memberikan hadiah penyelesaian bawaan, meningkatkan inisiasi untuk otak ADHD.",                                        howTo: "Tulis SATU tugas saja. Atur timer 25 menit. Kerjakan hanya itu. Ketika berbunyi — berhenti. Istirahat 5 menit.",                                                             duration: "Blok 30 menit" },
  "hfp-checkin":     { title: "Atur Timer Check-in 30 Menit",               category: "Kesejahteraan",     brief: "Jaga kondisi aliran ini sambil menjadwalkan pemeriksaan ringan.",                                          why: "Hiperfokus produktif dapat menyebabkan pengabaian kebutuhan dasar. Pengingat ringan menjaga kondisi sambil mencegah kelelahan.",                                                howTo: "Atur timer berulang setiap 30 menit. Ketika berbunyi: minum air, periksa postur, ambil 2 napas sebelum melanjutkan.",                                                        duration: "Berkelanjutan" },
  "hfp-water":       { title: "Minum Air Sebelum Melanjutkan",              category: "Reset Tubuh",       brief: "Minum air sekarang — hiperfokus menekan sinyal haus.",                                                     why: "Hiperfokus menekan kesadaran interoeptif termasuk rasa haus. Bahkan dehidrasi ringan mengganggu perhatian berkelanjutan yang sedang kamu manfaatkan.",                         howTo: "Minum segelas penuh air (300ml+) sebelum kembali bekerja. Atur pengingat untuk minum lagi dalam 45 menit.",                                                                  duration: "2 menit" },
  "hfp-protect":     { title: "Lindungi Sesi Ini",                          category: "Alat Fokus",        brief: "Hilangkan risiko gangguan sebelum kembali masuk.",                                                        why: "Gangguan eksternal selama hiperfokus menciptakan biaya peralihan perhatian yang signifikan dan frustrasi emosional dalam ADHD.",                                                howTo: "Aktifkan mode senyap di ponsel. Tutup semua tab yang tidak penting. Pasang tanda 'Jangan Ganggu' jika ada orang di sekitar.",                                                duration: "2 menit sekarang" },
  "hfp-posture":     { title: "Reset Postur Cepat",                         category: "Reset Tubuh",       brief: "30 detik gerakan untuk menjaga tubuhmu berkelanjutan sepanjang sesi.",                                    why: "Postur statis berkepanjangan selama hiperfokus meningkatkan ketegangan fisik dan kelelahan.",                                                                                   howTo: "Berdiri. Putar bahu. Regangkan leher ke kiri dan kanan. Kocok tangan. Duduk kembali. Selesai dalam 30 detik.",                                                              duration: "30 detik" },
  "hfu-onemore":     { title: "Aturan 'Satu Menit Lagi'",                   category: "Pengalihan",        brief: "Beri dirimu izin satu menit lagi — lalu komitmen untuk beralih.",                                         why: "Penghentian mendadak hiperfokus ADHD memicu reaksi emosional. Isyarat transisi dengan gesekan rendah jauh lebih efektif.",                                                      howTo: "Katakan: 'Satu menit lagi, lalu aku beralih.' Ketika menit itu habis, tutup aplikasi/tab sepenuhnya.",                                                                       duration: "1 menit" },
  "hfu-surface":     { title: "Munculkan Tugas yang Dimaksud",               category: "Strategi Tugas",    brief: "Tulis tugas yang kamu hindari, secara spesifik dan konkret.",                                             why: "Perhatian ADHD melayang sebagian karena tugas yang dimaksud tidak jelas atau tidak menyenangkan. Membuatnya konkret mengurangi upaya kognitif untuk terlibat kembali.",        howTo: "Tulis: 'Saya perlu [tugas] karena [alasannya]. Langkah pertama adalah [tindakan].' Letakkan di tempat yang bisa kamu lihat.",                                               duration: "3 menit" },
  "hfu-timer":       { title: "Atur Timer Transisi 5 Menit",                category: "Waktu",             brief: "Berikan otak kamu titik akhir yang jelas untuk gangguan saat ini.",                                      why: "Kebutaan waktu ADHD membuat aktivitas terbuka terasa tidak ada habisnya. Timer mengeksternalisasi waktu dan menciptakan titik berhenti.",                                       howTo: "Atur timer 5 menit. Ketika berbunyi: tutup apapun yang kamu lakukan segera. Tidak ada negosiasi.",                                                                           duration: "5 menit + beralih" },
  "hfu-acknowledge": { title: "Beri Nama Penghindaran",                      category: "Kesadaran Diri",    brief: "Akui mengapa tugas yang dimaksud terasa tidak menyenangkan sebelum mengalihkan.",                         why: "Penghindaran sering didorong oleh resistensi emosional. Menamai perasaan mengurangi kekuatannya — strategi inti DBT.",                                                          howTo: "Selesaikan secara lisan atau tertulis: 'Saya menghindari [tugas] karena rasanya [emosi]. Yang sebenarnya saya butuhkan adalah [kebutuhan].' Kemudian alihkan.",             duration: "3 menit" },
  "ff-nap":          { title: "Istirahat Singkat 10 Menit",                  category: "Reset Tubuh",       brief: "Istirahat singkat yang disengaja untuk memulihkan kewaspadaan.",                                          why: "Istirahat singkat (10-20 menit) secara signifikan meningkatkan kewaspadaan dan perhatian berkelanjutan tanpa menyebabkan inersia tidur.",                                        howTo: "Atur timer 10 menit. Berbaring, tutup mata, dan istirahat. Biarkan ruangan terang agar tidak masuk tidur nyenyak.",                                                          duration: "10 menit" },
  "ff-movement":     { title: "Gerakan 5 Menit",                             category: "Reset Tubuh",       brief: "Gerakan fisik untuk sementara meningkatkan gairah dan kewaspadaan.",                                     why: "Olahraga meningkatkan norepinefrin dan dopamin, langsung melawan kondisi arousal rendah. Bahkan 5 menit menghasilkan peningkatan perhatian yang terukur.",                     howTo: "Lakukan jumping jack, jalan cepat, atau peregangan semangat selama 5 menit. Cukup untuk meningkatkan detak jantung sedikit.",                                                duration: "5 menit" },
  "ff-lightertask":  { title: "Beralih ke Tugas yang Lebih Ringan",          category: "Strategi Tugas",    brief: "Pindahkan pekerjaan berat ke jendela kewaspadaan yang lebih baik.",                                       why: "Kinerja kognitif sangat terkait dengan kondisi arousal. Mencoba pekerjaan tinggi-tuntutan saat kelelahan menghasilkan tingkat kesalahan yang jauh lebih tinggi.",               howTo: "Tunda tugas berat untuk sekarang. Beralih ke sesuatu yang ringan: pengarsipan, pengorganisasian, email ringan. Kembali saat sudah istirahat.",                               duration: "Sesuai kebutuhan" },
  "ff-light":        { title: "Paparan Cahaya Terang",                       category: "Reset Tubuh",       brief: "Paparkan dirimu pada cahaya terang untuk meningkatkan kewaspadaan melalui jalur sirkadian.",               why: "Cahaya terang menekan melatonin dan mengaktifkan jalur kewaspadaan — efektif untuk keterlambatan sirkadian terkait ADHD.",                                                     howTo: "Pergi ke luar 5-10 menit untuk cahaya alami. Jika di dalam, duduk dekat jendela terang atau gunakan lampu 10.000 lux.",                                                     duration: "5–10 menit" },
  "ed-grounding":    { title: "Grounding 5-4-3-2-1",                         category: "Pereda Kecemasan",  brief: "Teknik grounding sensorik untuk menghentikan banjir emosi.",                                              why: "Mengalihkan perhatian dari reaktivitas internal ke detail sensorik eksternal mengurangi aktivasi amigdala dalam 3-5 menit.",                                                     howTo: "Sebutkan dengan keras: 5 hal yang kamu lihat, 4 yang bisa kamu sentuh, 3 yang kamu dengar, 2 yang kamu cium, 1 yang kamu rasakan. Lakukan masing-masing perlahan.",         duration: "3–5 menit" },
  "ed-breathing":    { title: "Pernapasan 4-7-8",                            category: "Pereda Kecemasan",  brief: "Pernapasan terstruktur untuk mengalihkan sistem sarafmu dari siaga tinggi.",                              why: "Hembusan napas panjang mengaktifkan sistem parasimpatik dan menurunkan kortisol.",                                                                                               howTo: "Hirup selama 4 hitungan. Tahan selama 7. Hembuskan selama 8. Ulangi 4 siklus. Lakukan ini sebelum tugas atau interaksi apapun.",                                           duration: "4 menit" },
  "ed-stepaway":     { title: "Tinggalkan Konteks yang Memicu",              category: "Lingkungan",        brief: "Secara fisik menjauh dari lingkungan yang memperburuk tekananmu.",                                        why: "Disregulasi emosional ADHD sensitif terhadap konteks. Menjauh dari situasi yang memicu menciptakan ruang untuk regulasi kembali.",                                              howTo: "Pergi ke ruangan berbeda, keluar sebentar, atau jalan pendek. Cukup ubah lokasi fisikmu selama 5-10 menit.",                                                                 duration: "5–10 menit" },
  "ed-label":        { title: "Beri Nama Emosimu",                           category: "Kesadaran Diri",    brief: "Beri label tepat pada apa yang kamu rasakan — ini mengurangi intensitasnya.",                             why: "Pelabelan afek mengurangi aktivasi amigdala dan memperkuat kendali regulasi prefrontal — intervensi inti berbasis DBT.",                                                         howTo: "Tulis atau katakan keras: 'Sekarang saya merasa [emosi] karena [pemicu]. Yang saya butuhkan adalah [kebutuhan].' Jadilah spesifik.",                                         duration: "3 menit" },
  "exd-microstep":   { title: "Apa Tindakan Fisik Pertama?",                 category: "Strategi Tugas",    brief: "Identifikasi tindakan fisik berikutnya yang tunggal — bukan proyek, bukan rencana.",                     why: "Disfungsi eksekutif mengganggu inisiasi terarah meskipun pengguna ingin bertindak. Membuat tindakan berikutnya konkret melewati tuntutan perencanaan.",                          howTo: "Tanya dirimu: 'Apa hal fisik berikutnya yang akan saya lakukan jika saya mulai sekarang?' Bukan 'kerjakan proyek' — tapi 'buka laptop' atau 'tulis satu baris.' Lakukan hanya itu.", duration: "5 menit" },
  "exd-bodydouble":  { title: "Body Doubling",                               category: "Fokus Sosial",      brief: "Dapatkan saksi — seseorang yang bekerja bersamamu mengubah situasi.",                                      why: "Kehadiran sosial mengeksternalisasi akuntabilitas dan mengurangi resistensi inisiasi dengan mengaktifkan sirkuit motivasi sosial.",                                              howTo: "Hubungi teman untuk bekerja diam bersama, buka Focusmate, atau pergi ke perpustakaan. Beritahu mereka apa yang akan kamu kerjakan.",                                         duration: "25–90 menit" },
  "exd-environment": { title: "Siapkan Lingkunganmu Terlebih Dahulu",        category: "Lingkungan",        brief: "Atur ruangmu sebelum mencoba memulai — persiapannya adalah langkah pertama.",                             why: "Persiapan lingkungan mengurangi energi aktivasi yang diperlukan untuk memulai. Lingkungan yang siap adalah perancah eksternal untuk fungsi eksekutif.",                          howTo: "Sebelum mencoba bekerja: bereskan mejamu, buka hanya satu dokumen yang kamu butuhkan, ambil air, jauhkan ponsel.",                                                           duration: "5 menit" },
  "exd-talkout":     { title: "Ucapkan Tugas dengan Keras",                  category: "Strategi Tugas",    brief: "Jelaskan apa yang perlu kamu lakukan seolah-olah mengajar orang lain.",                                  why: "Instruksi diri verbal mengeksternalisasi tuntutan memori kerja dan mendukung kesadaran metakognitif.",                                                                            howTo: "Katakan keras: 'Saya perlu [tugas]. Hal pertama yang akan saya lakukan adalah [langkah]. Ini penting karena [alasan].' Tindakan mengatakannya sering memicu inisiasi.",    duration: "3 menit" },
  "bal-pomodoro":    { title: "Pomodoro 25 Menit",                           category: "Strategi Tugas",    brief: "Blok kerja terstruktur untuk memaksimalkan kondisi stabil saat ini.",                                     why: "Pembatasan waktu memberikan hadiah dopamin reguler dari siklus penyelesaian dan mencegah penyimpangan perhatian bahkan dalam kondisi seimbang.",                                howTo: "Tulis SATU tugas. Atur timer 25 menit. Kerjakan hanya itu. Ketika berbunyi — ambil jeda 5 menit yang nyata. Ulangi.",                                                        duration: "Blok 30 menit" },
  "bal-water":       { title: "Minum Air Dulu",                              category: "Reset Tubuh",       brief: "Hidrasi sebelum memulai sesimu.",                                                                         why: "Bahkan dehidrasi ringan (1-2%) secara terukur mengganggu memori kerja dan perhatian berkelanjutan.",                                                                            howTo: "Minum 300-500ml air sekarang. Simpan segelas di dekatmu selama sesi.",                                                                                                       duration: "2 menit" },
  "bal-brownnoise":  { title: "Latar Belakang Brown Noise",                  category: "Alat Fokus",        brief: "Tambahkan audio ambien konsisten untuk mempertahankan fokus sepanjang sesi.",                             why: "Suara frekuensi rendah yang konsisten meningkatkan dopamin tanpa melibatkan area pemrosesan bahasa.",                                                                            howTo: "Cari 'brown noise' di YouTube atau gunakan Brain.fm. Atur ke volume 50-60% dan biarkan berjalan.",                                                                           duration: "Sesi penuh" },
  "bal-bodydouble":  { title: "Body Doubling",                               category: "Fokus Sosial",      brief: "Bekerja bersama seseorang untuk mempertahankan akuntabilitas dan momentum.",                             why: "Bahkan dalam kondisi stabil, otak ADHD mempertahankan fokus lebih baik dengan kehadiran sosial.",                                                                               howTo: "Buka Focusmate.com, bekerja bersama teman dari jarak jauh, atau pergi ke perpustakaan atau kafe.",                                                                           duration: "25–90 menit" },
  "bal-redirect":    { title: "Otakmu Siap — Gunakan Sekarang",              category: "Pengalihan",        brief: "Kondisi kognitifmu sedang baik sekarang. Ini adalah jendela terbaik untuk memulai sesuatu yang bermakna.", why: "Kesiapan kognitif itu singkat. Jendela fokus tinggi dan stres rendah sangat berharga — menghabiskannya untuk konsumsi konten pasif membuang kapasitas regulasi puncak otak.",  howTo: "Tutup yang sedang kamu scroll. Tulis satu tugas yang sudah kamu tunda. Komitmen hanya 10 menit — memulai adalah satu-satunya tujuan. Atur timer agar ada titik akhir.",   duration: "10 menit" },
}

function getStateLabel(state: CognitiveState, lang: Lang): string {
  return lang === "id" ? STATE_LABEL_ID[state] : STATE_INFO[state].label
}
function getStateDesc(state: CognitiveState, lang: Lang): string {
  return lang === "id" ? STATE_DESC_ID[state] : STATE_INFO[state].description
}
function getStatePriority(state: CognitiveState, lang: Lang): string {
  return lang === "id" ? STATE_PRIORITY_ID[state] : STATE_INFO[state].priority
}
function getRec(rec: Rec, lang: Lang): Rec {
  if (lang !== "id") return rec
  const id = REC_ID[rec.id]
  if (!id) return rec
  return { ...rec, ...id }
}

const INITIAL_CHECKIN: CheckInData = {
  energy: 3, mood: "neutral", sleep: 3, meds: "none",
  environment: "home-solo", timeOfDay: "morning", stress: 3,
  fatigue: 3, sleepiness: 3, focus: 3, motivation: 3,
  taskDifficulty: 3, workload: 3,
  currentActivity: "working", activityFeeling: "neutral",
}

// ── UI Primitives ─────────────────────────────────────────────────────────────

function ScaleSelector({ value, onChange, low, high }: {
  value: number; onChange: (v: number) => void; low: string; high: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => onChange(n)}
            className={`flex-1 h-11 rounded-xl text-sm font-medium transition-all duration-150 ${value === n
              ? "bg-primary text-primary-foreground shadow-md scale-105"
              : "bg-card border border-border text-foreground hover:border-primary/40"}`}>
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-0.5">
        <span>{low}</span><span>{high}</span>
      </div>
    </div>
  )
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)} className="transition-transform hover:scale-110">
          <Star size={20} className={n <= value ? "fill-amber-500 text-amber-500" : "text-muted-foreground"} />
        </button>
      ))}
    </div>
  )
}

function BottomNav({ active, onChange }: { active: string; onChange: (v: View) => void }) {
  const { t } = useLang()
  const tabs: { tabId: View; Icon: React.ElementType; en: string; idLabel: string }[] = [
    { tabId: "journey",   Icon: Home,     en: "Home",     idLabel: "Beranda" },
    { tabId: "dashboard", Icon: BarChart3, en: "Progress", idLabel: "Progres" },
    { tabId: "quiz",      Icon: BookOpen,  en: "Quiz",     idLabel: "Kuis" },
    { tabId: "settings",  Icon: UserIcon,  en: "Profile",  idLabel: "Profil" },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-10 max-w-md mx-auto">
      {tabs.map(({ tabId, Icon: NavIcon, en, idLabel }) => (
        <button key={tabId} onClick={() => onChange(tabId)}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${active === tabId ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <NavIcon size={19} />
          <span className="text-[10px] font-medium">{t(en, idLabel)}</span>
        </button>
      ))}
    </div>
  )
}

function OptionButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all duration-150 ${selected
        ? "border-primary bg-primary/8 text-primary font-medium"
        : "border-border bg-card text-foreground hover:border-primary/40"}`}>
      {children}
    </button>
  )
}

// ── Splash View ───────────────────────────────────────────────────────────────

function LangToggle({ dark }: { dark?: boolean }) {
  const { lang, setLang } = useLang()
  const base = dark ? "bg-primary-foreground/10 text-primary-foreground/70" : "bg-muted text-muted-foreground"
  const active = dark ? "bg-primary-foreground/25 text-primary-foreground font-semibold" : "bg-background text-foreground font-semibold shadow-sm"
  return (
    <div className={`inline-flex rounded-full p-0.5 gap-0.5 ${base}`}>
      {(["en", "id"] as Lang[]).map(l => (
        <button key={l} onClick={() => setLang(l)}
          className={`px-3 py-1 rounded-full text-xs transition-all ${lang === l ? active : "hover:opacity-80"}`}>
          {l === "en" ? "English" : "Indonesia"}
        </button>
      ))}
    </div>
  )
}

function AppBrand({ dark = false, size = "md", showName = true }: {
  dark?: boolean
  size?: "sm" | "md" | "lg"
  showName?: boolean
}) {
  const imageSize = { sm: "w-8 h-8 rounded-lg", md: "w-9 h-9 rounded-xl", lg: "w-14 h-14 rounded-2xl" }[size]
  const nameSize = size === "lg"
    ? "text-2xl font-serif tracking-wide"
    : "text-xs font-medium tracking-widest uppercase font-mono"

  return (
    <div className="flex items-center gap-3">
      <img
        src="/recomood-logo.png"
        alt={showName ? "" : "Recomood"}
        className={`${imageSize} object-cover flex-shrink-0`}
      />
      {showName && (
        <span className={`${nameSize} ${dark ? "text-primary-foreground" : "text-primary"}`}>
          Recomood
        </span>
      )}
    </div>
  )
}

function SplashView({ onContinue }: { onContinue: () => void }) {
  const { t } = useLang()
  return (
    <div className="min-h-screen bg-primary flex flex-col px-6 py-14 max-w-md mx-auto overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex-1">
        <div className="flex items-center justify-between mb-8">
          <AppBrand dark size="lg" />
          <LangToggle dark />
        </div>
        <h1 className="text-4xl font-serif text-primary-foreground mb-5 leading-tight">
          {t("Your ADHD.", "ADHD-mu.")} <br />{t("Understood.", "Dipahami.")}
        </h1>

        {/* Tutorial video */}
        <div className="rounded-2xl overflow-hidden bg-black/30 mb-3 w-full">
          <video
            src="https://qoeuvrsvimbcvaezftdp.supabase.co/storage/v1/object/public/tutorials/Focus%20App%20Video%20Introduction%20and%20Tutorial.mp4"
            controls
            playsInline
            preload="metadata"
            className="w-full rounded-2xl"
            style={{ maxHeight: "220px", objectFit: "cover" }}
          />
        </div>

        <p className="text-primary-foreground/75 text-base leading-relaxed mb-6">
          {t(
            "Recomood is a science-backed check-in tool that reads your current cognitive and emotional state, then gives you research-proven strategies to help you manage. All recommendations will be based on what works for you, learnt through previous check-ins, to give you the best recommendation possible.",
            "Recomood adalah alat check-in berbasis sains yang membaca kondisi kognitif dan emosional kamu saat ini, lalu memberikan strategi yang terbukti secara riset. Semua rekomendasi didasarkan pada apa yang berhasil untuk kamu, dipelajari dari check-in sebelumnya."
          )}
        </p>
        <div className="space-y-3 mb-8">
          {[
            { icon: Brain,      en: "Detects 8 distinct ADHD cognitive states, including Balanced", id: "Mendeteksi 8 kondisi kognitif ADHD yang berbeda, termasuk Seimbang" },
            { icon: BookOpen,   en: "Recommendations from CBT, DBT & MBCT research",        id: "Rekomendasi dari penelitian CBT, DBT & MBCT" },
            { icon: TrendingUp, en: "Tracks patterns across multiple daily check-ins",       id: "Melacak pola dari berbagai check-in harian" },
          ].map(({ icon: Icon, en, id }) => (
            <div key={en} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={13} className="text-primary-foreground/80" />
              </div>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">{t(en, id)}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.4 }}>
        <button onClick={onContinue}
          className="w-full py-3.5 rounded-xl bg-primary-foreground text-primary text-sm font-semibold hover:opacity-90 transition-opacity">
          {t("Get Started", "Mulai")}
        </button>
        <p className="text-primary-foreground/40 text-xs text-center mt-4">
          {t("Not a medical tool. For informational and self-management purposes only.", "Bukan alat medis. Hanya untuk tujuan informasi dan manajemen diri.")}
        </p>
      </motion.div>
    </div>
  )
}

// ── Login View ────────────────────────────────────────────────────────────────

function LoginView({ onLogin, onCreateAccount, onSplash }: { onLogin: (u: AppUser) => void; onCreateAccount: () => void; onSplash: () => void }) {
  const { t } = useLang()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!email || !password) { setError(t("Please fill in all fields.", "Harap isi semua kolom.")); return }
    setLoading(true); setError("")
    const result = await doLogin(email, password)
    setLoading(false)
    if (result === "invalid") { setError(t("Incorrect email or password.", "Email atau kata sandi salah.")); return }
    onLogin(result as AppUser)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-10 max-w-md mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-10">
          <button onClick={onSplash} className="flex items-center gap-2">
            <AppBrand />
          </button>
          <LangToggle />
        </div>
        <h1 className="text-3xl font-serif text-foreground mb-1">{t("Welcome back.", "Selamat datang kembali.")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("Log in to continue your Recomood journey.", "Masuk untuk melanjutkan perjalanan Recomood-mu.")}</p>
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-3.5 text-muted-foreground" />
            <input type="email" placeholder={t("Email address", "Alamat email")} value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-3.5 text-muted-foreground" />
            <input type={showPw ? "text" : "password"} placeholder={t("Password", "Kata sandi")} value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") submit() }}
              className="w-full bg-card border border-border rounded-xl pl-10 pr-11 py-3 text-sm outline-none focus:border-primary transition-colors" />
            <button onClick={() => setShowPw(s => !s)} className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-destructive mb-4 flex items-center gap-1.5"><AlertCircle size={13} />{error}</p>}
        <button onClick={submit} disabled={loading} className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity mb-4 disabled:opacity-60">
          {loading ? t("Signing in…", "Masuk…") : t("Log In", "Masuk")}
        </button>
        <p className="text-sm text-center text-muted-foreground">
          {t("No account?", "Belum punya akun?")}{" "}
          <button onClick={onCreateAccount} className="text-primary font-medium hover:underline">{t("Create one", "Daftar")}</button>
        </p>
      </motion.div>
    </div>
  )
}

// ── Create Account View ───────────────────────────────────────────────────────

function CreateAccountView({ onCreated, onBack }: { onCreated: (u: AppUser) => void; onBack: () => void }) {
  const { t } = useLang()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!email || !password || !confirm) { setError(t("Please fill in all fields.", "Harap isi semua kolom.")); return }
    if (!email.includes("@") || !email.includes(".")) { setError(t("Please enter a valid email address.", "Masukkan alamat email yang valid.")); return }
    if (password.length < 6) { setError(t("Password must be at least 6 characters.", "Kata sandi minimal 6 karakter.")); return }
    if (password !== confirm) { setError(t("Passwords don't match.", "Kata sandi tidak cocok.")); return }
    setLoading(true); setError("")
    const result = await doCreate(email, password)
    setLoading(false)
    if (result === "exists") { setError(t("An account with this email already exists.", "Akun dengan email ini sudah ada.")); return }
    if (result === "error") { setError(t("Something went wrong. Please try again.", "Terjadi kesalahan. Coba lagi.")); return }
    onCreated(result as AppUser)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6 py-10 max-w-md mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={16} /> {t("Back", "Kembali")}
          </button>
          <LangToggle />
        </div>
        <h1 className="text-3xl font-serif text-foreground mb-1">{t("Create your account.", "Buat akunmu.")}</h1>
        <p className="text-sm text-muted-foreground mb-8">{t("Your data stays on your device. No selling, no sharing.", "Datamu tersimpan di perangkatmu. Tidak dijual, tidak dibagikan.")}</p>
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-3.5 text-muted-foreground" />
            <input type="email" placeholder={t("Email address", "Alamat email")} value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-3.5 text-muted-foreground" />
            <input type={showPw ? "text" : "password"} placeholder={t("Password (min 6 chars)", "Kata sandi (min 6 karakter)")} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-10 pr-11 py-3 text-sm outline-none focus:border-primary transition-colors" />
            <button onClick={() => setShowPw(s => !s)} className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground">
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-3.5 text-muted-foreground" />
            <input type="password" placeholder={t("Confirm password", "Konfirmasi kata sandi")} value={confirm} onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
          </div>
        </div>
        {error && <p className="text-xs text-destructive mb-4 flex items-center gap-1.5"><AlertCircle size={13} />{error}</p>}
        <button onClick={submit} disabled={loading} className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity mb-4 disabled:opacity-60">
          {loading ? t("Creating account…", "Membuat akun…") : t("Create Account", "Buat Akun")}
        </button>
        <p className="text-sm text-center text-muted-foreground">
          {t("Already have an account?", "Sudah punya akun?")}{" "}
          <button onClick={onBack} className="text-primary font-medium hover:underline">{t("Log in", "Masuk")}</button>
        </p>
      </motion.div>
    </div>
  )
}

// ── Onboarding View ───────────────────────────────────────────────────────────

interface OBData {
  name: string; gender: string; age: string
  diagnosis: string; adhdKnowledge: string; peakTime: string
  busyness: string; timeLoss: string; workDistraction: string
  moodShifts: boolean | null; strengths: string[]; coConditions: string[]
}

function OnboardingView({ user, onComplete }: { user: AppUser; onComplete: (profile: OnboardingProfile) => void }) {
  const TOTAL = 12
  const [step, setStep] = useState(-1)
  const [moodChoice, setMoodChoice] = useState<"no" | "unsure" | "yes" | "">("")
  const [d, setD] = useState<OBData>({
    name: user.name || "", gender: "", age: "",
    diagnosis: "", adhdKnowledge: "", peakTime: "",
    busyness: "", timeLoss: "", workDistraction: "", moodShifts: null, strengths: [], coConditions: [],
  })

  function toggle(arr: string[], item: string) {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
  }

  function canAdvance() {
    if (step === 0) return d.name.trim().length > 0
    if (step === 1) return !!d.gender
    if (step === 2) return !!d.age
    if (step === 3) return !!d.diagnosis
    if (step === 4) return !!d.adhdKnowledge
    if (step === 5) return !!d.peakTime
    if (step === 6) return !!d.busyness
    if (step === 7) return !!d.timeLoss
    if (step === 8) return !!d.workDistraction
    if (step === 9) return moodChoice !== ""
    if (step === 10) return d.strengths.length > 0
    return true
  }

  function finish() {
    const profile: OnboardingProfile = { ...d, moodShifts: moodChoice === "yes", coConditions: d.coConditions.length ? d.coConditions : ["None"] }
    onComplete(profile)
  }

  const hdr = (sub?: string) => (
    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 font-mono">{sub || `${step + 1} of ${TOTAL}`}</p>
  )

  const questions: React.ReactNode[] = [
    <div key="name" className="space-y-5">
      {hdr()}
      <div><h2 className="text-2xl font-serif text-foreground">What should we call you?</h2>
        <p className="text-sm text-muted-foreground mt-1.5">This personalizes your experience.</p></div>
      <input autoFocus type="text" placeholder="Your name or nickname"
        value={d.name} onChange={e => setD(p => ({ ...p, name: e.target.value }))}
        className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm outline-none focus:border-primary transition-colors" />
    </div>,

    <div key="gender" className="space-y-5">
      {hdr()}
      <div><h2 className="text-2xl font-serif text-foreground">What is your biological sex?</h2>
        <p className="text-sm text-muted-foreground mt-1.5">ADHD presents differently across sexes. This helps us tailor results.</p></div>
      <div className="space-y-2">
        {["Male", "Female", "Intersex", "Prefer not to say"].map(opt => (
          <OptionButton key={opt} selected={d.gender === opt} onClick={() => setD(p => ({ ...p, gender: opt }))}>{opt}</OptionButton>
        ))}
      </div>
    </div>,

    <div key="age" className="space-y-5">
      {hdr()}
      <div><h2 className="text-2xl font-serif text-foreground">How old are you?</h2>
        <p className="text-sm text-muted-foreground mt-1.5">Age affects how ADHD symptoms present and which strategies work best.</p></div>
      <div className="space-y-2">
        {["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"].map(opt => (
          <OptionButton key={opt} selected={d.age === opt} onClick={() => setD(p => ({ ...p, age: opt }))}>{opt}</OptionButton>
        ))}
      </div>
    </div>,

    <div key="diagnosis" className="space-y-5">
      {hdr()}
      <div><h2 className="text-2xl font-serif text-foreground">Have you ever been diagnosed with ADHD?</h2>
        <p className="text-sm text-muted-foreground mt-1.5">Everyone is welcome, diagnosis or not.</p></div>
      <div className="space-y-2">
        {["I'm diagnosed by a doctor", "I'm self-diagnosed", "I suspect I might have ADHD", "I haven't been diagnosed or I do not have ADHD", "Prefer not to say"].map(opt => (
          <OptionButton key={opt} selected={d.diagnosis === opt} onClick={() => setD(p => ({ ...p, diagnosis: opt }))}>{opt}</OptionButton>
        ))}
      </div>
    </div>,

    <div key="knowledge" className="space-y-5">
      {hdr()}
      <div><h2 className="text-2xl font-serif text-foreground">How strong is your knowledge of ADHD?</h2></div>
      <div className="space-y-2">
        {["I know very little about ADHD", "I know the basics, but that's about it", "I have a good understanding", "I'm an expert in all things ADHD"].map(opt => (
          <OptionButton key={opt} selected={d.adhdKnowledge === opt} onClick={() => setD(p => ({ ...p, adhdKnowledge: opt }))}>{opt}</OptionButton>
        ))}
      </div>
    </div>,

    <div key="peak" className="space-y-5">
      {hdr()}
      <div><h2 className="text-2xl font-serif text-foreground">What time of day do you feel most focused?</h2></div>
      <div className="space-y-2">
        {[{ id: "morning", label: "Morning", emoji: "🌅" }, { id: "afternoon", label: "Afternoon", emoji: "☀️" }, { id: "evening", label: "Evening", emoji: "🌙" }, { id: "varies", label: "It varies", emoji: "🔀" }].map(opt => (
          <OptionButton key={opt.id} selected={d.peakTime === opt.id} onClick={() => setD(p => ({ ...p, peakTime: opt.id }))}>{opt.emoji} {opt.label}</OptionButton>
        ))}
      </div>
    </div>,

    <div key="busy" className="space-y-5">
      {hdr()}
      <div><h2 className="text-2xl font-serif text-foreground">How busy are you on an average day?</h2></div>
      <div className="space-y-2">
        {["Very busy, I have almost no downtime", "Busy, but I find moments to relax", "Not too busy, my schedule's flexible"].map(opt => (
          <OptionButton key={opt} selected={d.busyness === opt} onClick={() => setD(p => ({ ...p, busyness: opt }))}>{opt}</OptionButton>
        ))}
      </div>
    </div>,

    <div key="timeloss" className="space-y-5">
      {hdr()}
      <div><h2 className="text-2xl font-serif text-foreground">How often do you lose track of time when you find something interesting?</h2></div>
      <div className="space-y-2">
        {FREQ_OPTS.map(opt => (
          <OptionButton key={opt.id} selected={d.timeLoss === opt.id} onClick={() => setD(p => ({ ...p, timeLoss: opt.id }))}>{opt.label}</OptionButton>
        ))}
      </div>
    </div>,

    <div key="distract" className="space-y-5">
      {hdr()}
      <div><h2 className="text-2xl font-serif text-foreground">How often do you get distracted while working or studying?</h2></div>
      <div className="space-y-2">
        {FREQ_OPTS.map(opt => (
          <OptionButton key={opt.id} selected={d.workDistraction === opt.id} onClick={() => setD(p => ({ ...p, workDistraction: opt.id }))}>{opt.label}</OptionButton>
        ))}
      </div>
    </div>,

    <div key="mood" className="space-y-5">
      {hdr()}
      <div><h2 className="text-2xl font-serif text-foreground">Do sudden mood swings ever catch you off guard?</h2>
        <p className="text-sm text-foreground/60 mt-1.5">A "mood swing" means a fast, unexpected shift in how you feel — for example going from calm to frustrated or tearful in minutes.</p></div>
      <div className="space-y-2">
        {[{ id: "no", label: "No" }, { id: "unsure", label: "Not sure" }, { id: "yes", label: "Yes" }].map(opt => (
          <OptionButton key={opt.id} selected={moodChoice === opt.id} onClick={() => setMoodChoice(opt.id as "no" | "unsure" | "yes")}>{opt.label}</OptionButton>
        ))}
      </div>
    </div>,

    <div key="strengths" className="space-y-5">
      {hdr()}
      <div><h2 className="text-2xl font-serif text-foreground">Which of these are your greatest strengths?</h2>
        <p className="text-sm text-muted-foreground mt-1.5">Choose as many as you like.</p></div>
      <div className="space-y-2">
        {STRENGTHS_OPTS.map(opt => (
          <button key={opt} onClick={() => setD(p => ({ ...p, strengths: toggle(p.strengths, opt) }))}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${d.strengths.includes(opt) ? "border-primary bg-primary/8 text-primary font-medium" : "border-border bg-card text-foreground hover:border-primary/40"}`}>
            {opt}{d.strengths.includes(opt) && <Check size={15} className="text-primary" />}
          </button>
        ))}
      </div>
    </div>,

    <div key="coconditions" className="space-y-5">
      {hdr(`${step + 1} of ${TOTAL} — Optional`)}
      <div><h2 className="text-2xl font-serif text-foreground">Any other conditions that impact your life?</h2>
        <p className="text-sm text-muted-foreground mt-1.5">This helps us tailor results. You can skip this.</p></div>
      <div className="space-y-2">
        {CONDITION_OPTS.map(opt => (
          <button key={opt} onClick={() => setD(p => {
            const exclusive = opt === "None" || opt === "Not sure";
            if (exclusive) {
              const already = p.coConditions.includes(opt);
              return { ...p, coConditions: already ? [] : [opt] };
            }
            const without = p.coConditions.filter(c => c !== "None" && c !== "Not sure");
            return { ...p, coConditions: toggle(without, opt) };
          })}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${d.coConditions.includes(opt) ? "border-primary bg-primary/8 text-primary font-medium" : "border-border bg-card text-foreground hover:border-primary/40"}`}>
            {opt}{d.coConditions.includes(opt) && <Check size={15} className="text-primary" />}
          </button>
        ))}
      </div>
    </div>,
  ]

  if (step === -1) return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-10 pb-4 max-w-md mx-auto">
      <div className="mb-8"><AppBrand /></div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Sparkles size={26} className="text-primary" />
        </div>
        <h1 className="text-3xl font-serif text-foreground mb-3 leading-tight">Welcome to Recomood, {user.name || "friend"}.</h1>
        <p className="text-sm text-foreground/75 leading-relaxed mb-6">Recomood is a calm, science-backed companion for managing ADHD day to day. Let's set a few things up so your recommendations are tailored to you.</p>

        <div className="bg-primary/6 border border-primary/15 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-primary" />
            <p className="text-sm font-bold text-foreground">What Recomood does</p>
          </div>
          <ul className="space-y-2">
            {["Reads how you feel right now and suggests research-backed strategies", "Tracks your patterns over time so you learn what helps", "Gives you plain-language education about ADHD"].map(t => (
              <li key={t} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                <span className="text-primary mt-0.5 flex-shrink-0">•</span>{t}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-accent flex-shrink-0" />
            <p className="text-sm font-bold text-foreground">Your answers power your recommendations</p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">Every question we ask — your age, gender, diagnosis, strengths, and more — is used exclusively to personalise the strategies and insights we surface for <em>you</em>. Nothing is shared. The more honest your answers, the more useful Recomood becomes.</p>
        </div>

        <div className="border border-[#EBC4B9] rounded-2xl p-4 bg-[#f9f7e6]">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} style={{ color: "#8A2E1C" }} />
            <p className="text-sm font-bold" style={{ color: "#8A2E1C" }}>What Recomood does not do</p>
          </div>
          <ul className="space-y-2">
            {["It does not diagnose ADHD or any condition", "It does not replace a doctor, therapist, or medication", "It is a self-management and learning tool only"].map(t => (
              <li key={t} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: "#8A2E1C" }}>
                <span className="mt-0.5 flex-shrink-0">•</span>{t}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
      <div className="sticky bottom-0 bg-background pt-4 pb-2">
        <button onClick={() => setStep(0)}
          className="w-full flex items-center justify-center gap-1.5 h-12 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.99]">
          Let's get started <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-10 pb-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <AppBrand size="sm" />
        <div className="flex gap-1">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= step ? "bg-primary w-4" : "bg-muted w-2"}`} />
          ))}
        </div>
      </div>
      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="flex-1">
        {questions[step]}
      </motion.div>
      <div className="sticky bottom-0 bg-background pt-4 pb-2 flex gap-3">
        <button onClick={() => setStep(s => s - 1)}
          className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={15} /> Back
        </button>
        <button onClick={() => step < TOTAL - 1 ? setStep(s => s + 1) : finish()}
          disabled={!canAdvance() && step < TOTAL - 1}
          className={`flex-1 flex items-center justify-center gap-1.5 h-12 rounded-xl text-sm font-semibold transition-all active:scale-[0.99] ${canAdvance() || step === TOTAL - 1
            ? "bg-primary text-primary-foreground hover:opacity-90"
            : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
          {step < TOTAL - 1 ? (<>Continue <ChevronRight size={15} /></>) : "Finish Setup"}
        </button>
      </div>
    </div>
  )
}

// ── Journey View ──────────────────────────────────────────────────────────────

function calcStreak(sessions: Session[]): number {
  if (!sessions.length) return 0
  const dates = [...new Set(sessions.map(s => s.date))].sort().reverse()
  let streak = 0
  const today = new Date().toISOString().split("T")[0]
  let cur = today
  for (const d of dates) {
    if (d === cur) { streak++; const dt = new Date(cur); dt.setDate(dt.getDate() - 1); cur = dt.toISOString().split("T")[0] }
    else break
  }
  return streak
}

function JourneyView({ user, onStart, onSetView }: { user: AppUser; onStart: () => void; onSetView: (v: View) => void }) {
  const { lang, t } = useLang()
  const sessions = todaySessions()
  const allSessions = STORE.sessions()
  const now = new Date()
  const dateStr = now.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { weekday: "long", month: "long", day: "numeric" })
  const hour = now.getHours()
  const greeting = lang === "id"
    ? (hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat malam")
    : (hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening")
  const streak = calcStreak(allSessions)

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{dateStr}</p>
            <h1 className="text-2xl font-serif text-foreground mt-0.5">{greeting}, {user.profile?.name || user.name}.</h1>
          </div>
          <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-xl">
            {user.avatar || "🧠"}
          </div>
        </div>

        {streak > 0 && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
            <span className="text-lg">🔥</span>
            <div>
              <p className="text-sm font-medium text-foreground">{t(`${streak}-day streak`, `Streak ${streak} hari`)}</p>
              <p className="text-xs text-muted-foreground">{t("Keep checking in daily", "Terus check-in setiap hari")}</p>
            </div>
          </div>
        )}

        <button onClick={onStart}
          className="w-full bg-primary text-primary-foreground rounded-2xl px-5 py-5 text-left hover:opacity-95 transition-opacity mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-primary-foreground/70 mb-1">
                {sessions.length === 0
                  ? t("First check-in today", "Check-in pertama hari ini")
                  : t(`Check-in #${sessions.length + 1} today`, `Check-in ke-${sessions.length + 1} hari ini`)}
              </p>
              <p className="text-lg font-serif text-primary-foreground">{t("How are you right now?", "Bagaimana keadaanmu sekarang?")}</p>
              <p className="text-xs text-primary-foreground/65 mt-1">{t("~2 min · Get personalized strategies", "~2 menit · Dapatkan strategi yang dipersonalisasi")}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
              <ChevronRight size={18} className="text-primary-foreground" />
            </div>
          </div>
        </button>

        {sessions.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">{t("Today's check-ins", "Check-in hari ini")}</p>
            <div className="space-y-2.5">
              {sessions.slice().reverse().map(s => {
                const info = STATE_INFO[s.cognitiveState]
                const time = new Date(s.time).toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", { hour: "numeric", minute: "2-digit" })
                return (
                  <div key={s.id} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 relative" style={{ background: info.bg }}>
                      <info.Icon size={14} style={{ color: info.color }} />
                      <span className="absolute -top-1 -right-1 rounded-full ring-2 ring-card" style={{ width: 9, height: 9, background: CONCERN_META[STATE_CONCERN[s.cognitiveState]].dot }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{getStateLabel(s.cognitiveState, lang)}</p>
                      <p className="text-xs text-foreground/60">{time} · {t("Energy", "Energi")} {s.checkIn.energy}/5</p>
                    </div>
                    <div className="text-xs font-mono text-foreground/60">{s.checkIn.focus}/5 {t("focus", "fokus")}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          <button onClick={() => onSetView("when-to-use")}
            className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-3.5 flex items-center gap-3 hover:border-primary/30 transition-colors text-left">
            <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{t("When should I use this app?", "Kapan sebaiknya pakai app ini?")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("Best moments to check in", "Waktu terbaik untuk check-in")}</p>
            </div>
            <ChevronRight size={15} className="text-muted-foreground flex-shrink-0" />
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={() => onSetView("resources")}
              className="bg-card border border-border rounded-xl px-4 py-4 text-left hover:border-primary/30 transition-colors flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <BookOpen size={17} className="text-accent" />
                <ChevronRight size={13} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">{t("Learn about ADHD", "Pelajari ADHD")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("Research & resources", "Riset & sumber daya")}</p>
            </button>
            <button onClick={() => onSetView("how-it-works")}
              className="bg-card border border-border rounded-xl px-4 py-4 text-left hover:border-primary/30 transition-colors flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <Shield size={17} className="text-primary" />
                <ChevronRight size={13} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">{t("How it works", "Cara kerja app")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("Science & trust", "Sains & kepercayaan")}</p>
            </button>
          </div>
        </div>
      </div>
      <BottomNav active="journey" onChange={onSetView} />
    </div>
  )
}

// ── Check-In View ─────────────────────────────────────────────────────────────

function CheckInView({ onComplete, onBack }: { onComplete: (d: CheckInData) => void; onBack: () => void }) {
  const { lang, t } = useLang()
  const TOTAL = 10
  const [step, setStep] = useState(0)
  const [d, setD] = useState<CheckInData>(() => {
    const hour = new Date().getHours()
    const timeOfDay: TimeOfDay = hour < 12 ? "morning" : hour < 14 ? "midday" : hour < 18 ? "afternoon" : "evening"
    return { ...INITIAL_CHECKIN, timeOfDay }
  })

  function next() { if (step < TOTAL - 1) setStep(s => s + 1); else onComplete(d) }
  function prev() { if (step > 0) setStep(s => s - 1); else onBack() }

  const moodOpts  = lang === "id" ? MOOD_OPTS_ID  : MOOD_OPTS
  const medOpts   = lang === "id" ? MED_OPTS_ID   : MED_OPTS
  const envOpts   = lang === "id" ? ENV_OPTS_ID   : ENV_OPTS
  const actOpts   = lang === "id" ? ACTIVITY_OPTS_ID : ACTIVITY_OPTS
  const feelOpts  = lang === "id" ? FEELING_OPTS_ID  : FEELING_OPTS

  const steps: React.ReactNode[] = [
    <div key="energy" className="space-y-5">
      <div>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">{t("Physical state", "Kondisi fisik")}</p>
        <h2 className="text-2xl font-serif text-foreground">{t("Energy level", "Tingkat energi")}</h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {lang === "id"
            ? <>Dorongan dan kesiapan umum untuk melakukan sesuatu — <span className="text-foreground font-medium">bukan</span> soal kelelahan atau kantuk. Pikirkan: apakah tubuh dan pikiranmu terasa berenergi dan mau bergerak, atau datar dan enggan?</>
            : <>Your overall drive and readiness to do things — <span className="text-foreground font-medium">not</span> about tiredness or sleep urge. Think: does your body and mind feel charged up and willing to go, or flat and reluctant?</>}
        </p>
        <div className="mt-3 bg-muted/60 border border-border rounded-xl px-3 py-2.5 space-y-1.5">
          <p className="text-xs text-muted-foreground">
            {lang === "id"
              ? <><span className="font-semibold text-foreground">Energi</span> = kapasitas dan dorongan untuk bertindak. Kamu bisa berenergi rendah tanpa merasa mengantuk (misalnya kelelahan tapi tetap tegang).</>
              : <><span className="font-semibold text-foreground">Energy</span> = your capacity and drive to act. You can have low energy but not feel sleepy (e.g. burnt out but wired).</>}
          </p>
        </div>
      </div>
      <ScaleSelector value={d.energy} onChange={v => setD(p => ({ ...p, energy: v }))} low={t("Completely flat", "Sangat datar")} high={t("Fully charged", "Penuh energi")} />
    </div>,
    <div key="mood" className="space-y-5">
      <div>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">{t("Mental state", "Kondisi mental")}</p>
        <h2 className="text-2xl font-serif text-foreground">{t("Current mood", "Suasana hati saat ini")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("What's your emotional tone right now?", "Bagaimana nada emosimu sekarang?")}</p>
      </div>
      <div className="space-y-2">
        {moodOpts.map(opt => (
          <OptionButton key={opt.id} selected={d.mood === opt.id} onClick={() => setD(p => ({ ...p, mood: opt.id }))}>
            {opt.emoji} {opt.label}
          </OptionButton>
        ))}
      </div>
    </div>,
    <div key="sleep" className="space-y-5">
      <div>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">{t("Physical state", "Kondisi fisik")}</p>
        <h2 className="text-2xl font-serif text-foreground">{t("Sleep quality last night", "Kualitas tidur semalam")}</h2>
        <p className="text-sm text-muted-foreground mt-1.5">{t("Consider both sleep quality (uninterrupted, restful sleep) and total hours — a short night counts as poor even if you slept deeply.", "Pertimbangkan keduanya: kualitas tidur (tidak terputus, nyenyak) dan total jam tidur — malam yang singkat tetap dihitung buruk meski tidurmu nyenyak.")}</p>
      </div>
      <ScaleSelector value={d.sleep} onChange={v => setD(p => ({ ...p, sleep: v }))} low={t("Very poor", "Sangat buruk")} high={t("Excellent", "Sangat baik")} />
    </div>,
    <div key="meds" className="space-y-5">
      <div><h2 className="text-2xl font-serif text-foreground">{t("Medication status", "Status obat")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("If you take ADHD medication, how's that going today?", "Jika kamu minum obat ADHD, bagaimana hari ini?")}</p></div>
      <div className="space-y-2">
        {medOpts.map(opt => (
          <OptionButton key={opt.id} selected={d.meds === opt.id} onClick={() => setD(p => ({ ...p, meds: opt.id }))}>{opt.label}</OptionButton>
        ))}
      </div>
    </div>,
    <div key="fatigue" className="space-y-5">
      <div>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">{t("Physical & mental state", "Kondisi fisik & mental")}</p>
        <h2 className="text-2xl font-serif text-foreground">{t("Fatigue & Sleepiness", "Kelelahan & Kantuk")}</h2>
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {lang === "id"
            ? <>Ini adalah <span className="text-foreground font-medium">dua hal berbeda</span> — nilai secara terpisah.</>
            : <>These are <span className="text-foreground font-medium">two different things</span> — rate them separately.</>}
        </p>
        <div className="mt-3 bg-muted/60 border border-border rounded-xl px-3 py-2.5 space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {lang === "id"
              ? <><span className="font-semibold text-foreground">Kelelahan</span> = perasaan habis, terkuras di tubuh atau pikiran — seperti sudah kehabisan bahan bakar. Kamu bisa kelelahan tanpa merasa mengantuk.</>
              : <><span className="font-semibold text-foreground">Fatigue</span> = a worn-out, depleted feeling in your body or mind — like you've been running on empty. You can be fatigued without feeling sleepy.</>}
          </p>
          <div className="border-t border-border/60 pt-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === "id"
                ? <><span className="font-semibold text-foreground">Kantuk</span> = dorongan untuk menutup mata dan tidur. Kamu bisa mengantuk tanpa kelelahan (misalnya setelah makan besar), atau kelelahan tapi tidak mengantuk (misalnya kelelahan karena cemas).</>
                : <><span className="font-semibold text-foreground">Sleepiness</span> = the urge to close your eyes and sleep. You can feel sleepy without being fatigued (e.g. after a big meal), or fatigued but not sleepy at all (e.g. anxious exhaustion).</>}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">{t("Fatigue", "Kelelahan")} <span className="text-xs font-normal text-muted-foreground">— {t("physical & mental wear", "kelelahan fisik & mental")}</span></p>
          <p className="text-xs text-muted-foreground mb-2.5">{t("Body heavy, limbs tired, or brain worn through from effort — the feeling of having been running on empty", "Tubuh berat, anggota badan lelah, atau otak aus dari upaya — perasaan sudah kehabisan bahan bakar")}</p>
          <ScaleSelector value={6 - d.fatigue} onChange={v => setD(p => ({ ...p, fatigue: 6 - v }))} low={t("Completely depleted", "Benar-benar terkuras")} high={t("Not fatigued", "Tidak lelah")} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">{t("Sleepiness", "Kantuk")} <span className="text-xs font-normal text-muted-foreground">— {t("urge to sleep", "dorongan untuk tidur")}</span></p>
          <p className="text-xs text-muted-foreground mb-2.5">{t("The pull to close your eyes — distinct from fatigue", "Dorongan untuk menutup mata — berbeda dari kelelahan")}</p>
          <ScaleSelector value={6 - d.sleepiness} onChange={v => setD(p => ({ ...p, sleepiness: 6 - v }))} low={t("Falling asleep", "Hampir tidur")} high={t("Wide awake", "Sangat terjaga")} />
        </div>
      </div>
    </div>,
    <div key="focus" className="space-y-5">
      <div>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">{t("Mental state", "Kondisi mental")}</p>
        <h2 className="text-2xl font-serif text-foreground">{t("Focus & Motivation", "Fokus & Motivasi")}</h2>
      </div>
      <div className="space-y-4">
        <div><p className="text-sm font-medium text-foreground mb-2">{t("Ability to focus / attention", "Kemampuan fokus / perhatian")}</p>
          <ScaleSelector value={d.focus} onChange={v => setD(p => ({ ...p, focus: v }))} low={t("Can't focus at all", "Tidak bisa fokus sama sekali")} high={t("Laser sharp", "Sangat tajam")} /></div>
        <div><p className="text-sm font-medium text-foreground mb-2">{t("Motivation to do tasks", "Motivasi untuk mengerjakan tugas")}</p>
          <ScaleSelector value={d.motivation} onChange={v => setD(p => ({ ...p, motivation: v }))} low={t("Zero motivation", "Nol motivasi")} high={t("Highly driven", "Sangat termotivasi")} /></div>
      </div>
    </div>,
    <div key="stress" className="space-y-5">
      <div><h2 className="text-2xl font-serif text-foreground">{t("Stress & Workload", "Stres & Beban Kerja")}</h2></div>
      <div className="space-y-4">
        <div><p className="text-sm font-medium text-foreground mb-2">{t("Stress level", "Tingkat stres")}</p>
          <ScaleSelector value={6 - d.stress} onChange={v => setD(p => ({ ...p, stress: 6 - v }))} low={t("Very stressed", "Sangat stres")} high={t("Very relaxed", "Sangat santai")} /></div>
        <div><p className="text-sm font-medium text-foreground mb-2">{t("Perceived workload", "Beban kerja yang dirasakan")}</p>
          <ScaleSelector value={6 - d.workload} onChange={v => setD(p => ({ ...p, workload: 6 - v }))} low={t("Overwhelming", "Sangat memberatkan")} high={t("Very light", "Sangat ringan")} /></div>
        <div><p className="text-sm font-medium text-foreground mb-2">{t("Task difficulty", "Kesulitan tugas")}</p>
          <ScaleSelector value={6 - d.taskDifficulty} onChange={v => setD(p => ({ ...p, taskDifficulty: 6 - v }))} low={t("Very hard", "Sangat sulit")} high={t("Very easy", "Sangat mudah")} /></div>
      </div>
    </div>,
    <div key="env" className="space-y-5">
      <div><h2 className="text-2xl font-serif text-foreground">{t("Where are you right now?", "Di mana kamu sekarang?")}</h2></div>
      <div className="space-y-2">
        {envOpts.map(opt => (
          <OptionButton key={opt.id} selected={d.environment === opt.id} onClick={() => setD(p => ({ ...p, environment: opt.id }))}>
            <span className="flex items-center gap-2.5"><opt.Icon size={15} className="text-muted-foreground" />{opt.label}</span>
          </OptionButton>
        ))}
      </div>
    </div>,
    <div key="activity" className="space-y-5">
      <div><h2 className="text-2xl font-serif text-foreground">{t("What are you doing (or about to do)?", "Apa yang sedang (atau akan) kamu lakukan?")}</h2></div>
      <div className="grid grid-cols-2 gap-2">
        {actOpts.map(opt => (
          <button key={opt.id} onClick={() => setD(p => ({ ...p, currentActivity: opt.id }))}
            className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm transition-all ${d.currentActivity === opt.id ? "border-primary bg-primary/8 text-primary font-medium" : "border-border bg-card text-foreground hover:border-primary/40"}`}>
            <span>{opt.emoji}</span><span className="text-xs">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>,
    <div key="feeling" className="space-y-5">
      <div><h2 className="text-2xl font-serif text-foreground">{t("How do you feel about what you're doing?", "Bagaimana perasaanmu tentang yang sedang kamu lakukan?")}</h2></div>
      <div className="space-y-2">
        {feelOpts.map(opt => (
          <OptionButton key={opt.id} selected={d.activityFeeling === opt.id} onClick={() => setD(p => ({ ...p, activityFeeling: opt.id }))}>
            {opt.emoji} {opt.label}
          </OptionButton>
        ))}
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-6 pb-3 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={16} /> {step === 0 ? t("Cancel", "Batal") : t("Back", "Kembali")}
        </button>
        <p className="text-xs text-muted-foreground font-mono">{step + 1} / {TOTAL}</p>
      </div>
      <div className="w-full bg-muted rounded-full h-1 mb-6">
        <div className="bg-primary h-1 rounded-full transition-all duration-300" style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
      </div>
      <motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }} className="flex-1">
        {steps[step]}
      </motion.div>
      <div className="sticky bottom-0 bg-background pt-4 pb-2 -mx-5 px-5 border-t border-border/50">
        <button onClick={next}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.99]">
          {step < TOTAL - 1 ? (<>{t("Continue", "Lanjut")} <ChevronRight size={15} /></>) : (<><CheckCircle2 size={15} /> {t("Analyse my state", "Analisis kondisiku")}</>)}
        </button>
      </div>
    </div>
  )
}

// ── Processing View ───────────────────────────────────────────────────────────

function ProcessingView({ state }: { state: CognitiveState }) {
  const { t } = useLang()
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-14 h-14 rounded-full border-2 border-primary/20 border-t-primary mx-auto mb-6" />
        <h2 className="text-xl font-serif text-foreground mb-2">{t("Analysing your state…", "Menganalisis kondisimu…")}</h2>
        <p className="text-sm text-muted-foreground">{t("Matching your check-in to the research database", "Mencocokkan check-in dengan database riset")}</p>
      </motion.div>
    </div>
  )
}

// ── Recommendations View ──────────────────────────────────────────────────────

function toBullets(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean)
}

function RecsView({ cognitiveState, recs, initialFeedback = {}, initialNotes = "", readOnly = false, onDone, onBack }: {
  cognitiveState: CognitiveState; recs: Rec[]
  initialFeedback?: Record<string, number>; initialNotes?: string; readOnly?: boolean
  onDone: (feedback: Record<string, number>, notes: string) => void
  onBack?: () => void
}) {
  const { lang, t } = useLang()
  const rawInfo = STATE_INFO[cognitiveState]
  const info = {
    ...rawInfo,
    label: getStateLabel(cognitiveState, lang),
    description: getStateDesc(cognitiveState, lang),
    priority: getStatePriority(cognitiveState, lang),
  }
  const concern = CONCERN_META[STATE_CONCERN[cognitiveState]]
  const translatedRecs = recs.map(r => getRec(r, lang))
  const [expandedRecs, setExpandedRecs] = useState<Set<string>>(new Set())
  const allExpanded = recs.length > 0 && recs.every(r => expandedRecs.has(r.id))
  function toggleAllRecs() {
    setExpandedRecs(allExpanded ? new Set() : new Set(recs.map(r => r.id)))
  }
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    const d: Record<string, boolean> = {}
    Object.keys(initialFeedback).forEach(k => { if (initialFeedback[k]) d[k] = true })
    return d
  })
  const [feedback, setFeedback] = useState<Record<string, number>>(initialFeedback)
  const [notes, setNotes] = useState(initialNotes)
  const [showLiterature, setShowLiterature] = useState(false)

  return (
    <div className="min-h-screen bg-background pb-8 max-w-md mx-auto">
      <div className="px-5 pt-8 pb-5" style={{ background: info.bg }}>
        {readOnly && onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-foreground/60 mb-4 hover:text-foreground transition-colors">
            <ChevronLeft size={16} /> {t("Back to history", "Kembali ke riwayat")}
          </button>
        )}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: info.color + "22" }}>
            <info.Icon size={20} style={{ color: info.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1"><ConcernBadge state={cognitiveState} size="md" /></div>
            <h1 className="text-2xl font-serif text-foreground">{info.label}</h1>
          </div>
        </div>
        <p className="text-sm text-foreground/75 leading-relaxed mb-3">{info.description}</p>
        <button onClick={() => setShowLiterature(s => !s)}
          className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
          style={{ color: info.color }}>
          <BookOpen size={13} />
          {showLiterature ? t("Hide research", "Sembunyikan riset") : t("What does the research say?", "Apa kata riset?")}
          {showLiterature ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {showLiterature && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-3 overflow-hidden">
            {info.literature.map((lit, i) => (
              <div key={i} className="bg-white/60 rounded-xl p-3.5 border border-white/80">
                <p className="text-sm font-semibold text-foreground mb-1.5">{lit.title}</p>
                <p className="text-xs text-foreground/70 leading-relaxed mb-1.5">{lit.body}</p>
                <p className="text-[10px] text-muted-foreground/70 font-mono italic">{lit.cite}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="px-5 pt-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-foreground/60 font-mono uppercase tracking-widest">{t("Try one of these strategies", "Coba salah satu strategi ini")}</p>
          <button onClick={toggleAllRecs} className="text-xs font-medium text-primary hover:text-primary/70 transition-colors flex items-center gap-1">
            {allExpanded ? <><ChevronsUp size={12} /> {t("Collapse all", "Tutup semua")}</> : <><ChevronsDown size={12} /> {t("Expand all", "Buka semua")}</>}
          </button>
        </div>
        {translatedRecs.map(rec => {
          const isOpen = expandedRecs.has(rec.id)
          const isDone = done[rec.id]
          return (
            <div key={rec.id} className={`bg-card border rounded-xl overflow-hidden transition-all ${isDone ? "border-primary/40" : "border-border"}`}>
              <div className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: rec.color + "15" }}>
                    {isDone ? <CheckCircle2 size={17} style={{ color: rec.color }} /> : <rec.Icon size={16} style={{ color: rec.color }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{rec.title}</p>
                    <p className="text-xs text-foreground/55 mt-0.5">{rec.category} · {rec.duration}</p>
                    <p className="text-xs text-foreground/70 mt-1.5 leading-relaxed">{rec.brief}</p>
                  </div>
                </div>

                {isOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden mt-3 pt-3 border-t border-border space-y-3">
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">{t("Steps", "Langkah")}</p>
                      <ul className="space-y-1.5">
                        {toBullets(rec.howTo).map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                            <span className="text-primary mt-0.5 flex-shrink-0">•</span>{b}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">{t("Why it helps", "Mengapa ini membantu")}</p>
                      <p className="text-xs text-foreground/70 leading-relaxed">{rec.why}</p>
                    </div>
                  </motion.div>
                )}

                {!readOnly && (
                  <div className="flex items-center gap-2 mt-3">
                    {!isDone ? (
                      <>
                        <button onClick={() => setExpandedRecs(s => { const n = new Set(s); isOpen ? n.delete(rec.id) : n.add(rec.id); return n })}
                          className="flex-1 h-10 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 hover:opacity-90"
                          style={{ background: rec.color }}>
                          {isOpen ? t("Hide steps", "Sembunyikan langkah") : t("Try this", "Coba ini")}
                        </button>
                        <button onClick={() => { setDone(d => ({ ...d, [rec.id]: true })); setExpandedRecs(s => { const n = new Set(s); n.add(rec.id); return n }) }}
                          className="h-10 px-3 rounded-xl text-sm font-medium border border-border text-foreground hover:border-primary/40 transition-all active:scale-95 flex items-center gap-1.5">
                          <Check size={14} /> {t("Done", "Selesai")}
                        </button>
                      </>
                    ) : (
                      <div className="w-full bg-muted/50 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-foreground">{t("How did it go?", "Bagaimana hasilnya?")}</span>
                        <StarRating value={feedback[rec.id] || 0} onChange={n => setFeedback(f => ({ ...f, [rec.id]: n }))} />
                      </div>
                    )}
                  </div>
                )}

                {readOnly && feedback[rec.id] > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-foreground/60">{t("Your rating:", "Penilaianmu:")}</span>
                    <StarRating value={feedback[rec.id]} onChange={() => {}} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-5 mt-6 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <PenLine size={14} className="text-primary" />
            <p className="text-sm font-semibold text-foreground">{t("Journal note", "Catatan jurnal")} {!readOnly && <span className="text-muted-foreground font-normal">({t("optional", "opsional")})</span>}</p>
          </div>
          {readOnly ? (
            <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground/80 leading-relaxed min-h-[3rem]">
              {notes || <span className="text-muted-foreground italic">{t("No note was added for this check-in.", "Tidak ada catatan untuk check-in ini.")}</span>}
            </div>
          ) : (
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder={t("How are you feeling? What's on your mind? Anything you want to remember about this moment…", "Bagaimana perasaanmu? Apa yang ada di pikiranmu? Hal apa yang ingin kamu ingat tentang momen ini…")}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none" />
          )}
        </div>

        <button onClick={() => onDone(feedback, notes)}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.99]">
          {readOnly ? t("Close report", "Tutup laporan") : t("Save & finish", "Simpan & selesai")}
        </button>
      </div>
    </div>
  )
}

// ── Quiz View ─────────────────────────────────────────────────────────────────

function calcQuizResults(a: QuizAnswers): QuizResults {
  const freqScore = (f: string) => ({ "all-time": 4, "a-lot": 3, "sometimes": 2, "rarely": 1, "never": 0 }[f] ?? 0)

  // Attention: procrastination, distractibility, task-initiation failure, careless mistakes
  const attn = freqScore(a.procrastinate) + freqScore(a.distractedAtWork) + freqScore(a.taskInitiation) + Math.max(0, a.carelessMistakes - 1)
  // Executive function: difficulty unwinding, daily disorganisation, initiation paralysis, racing thoughts
  const exec = freqScore(a.hardToUnwind) + freqScore(a.startOrganized) + freqScore(a.taskInitiation) + Math.max(0, a.racingThoughts - 1)
  // Emotional: emotional derailment, failure avoidance
  const emo = freqScore(a.emotionalDerail) + freqScore(a.avoidFailure)
  // Impulsivity / error-prone: careless mistakes
  const soc = Math.max(0, a.carelessMistakes - 1)

  const total = attn + exec + emo + soc
  const totalMax = 16 + 15 + 8 + 4
  const score = Math.round((total / totalMax) * 100)
  const level: "low" | "moderate" | "high" | "very-high" =
    score >= 80 ? "very-high" : score >= 60 ? "high" : score >= 30 ? "moderate" : "low"

  return {
    score, level,
    attentionScore: Math.min(10, Math.round((attn / 16) * 10)),
    executiveScore: Math.min(10, Math.round((exec / 15) * 10)),
    emotionalScore: Math.min(10, Math.round((emo / 8) * 10)),
    socialScore: Math.min(10, Math.round((soc / 4) * 10)),
    powerNap: a.powerNap,
    noisePreference: a.noisePreference,
    bodyDoubling: a.bodyDoubling,
    exerciseHelps: a.exerciseHelps,
  }
}

const BLANK_QUIZ: QuizAnswers = {
  powerNap: "", taskInitiation: "", noisePreference: "", bodyDoubling: null, exerciseHelps: null,
  procrastinate: "", startOrganized: "", hardToUnwind: "", distractedAtWork: "",
  emotionalDerail: "", avoidFailure: "", racingThoughts: 0, carelessMistakes: 0,
}

function QuizView({ user, onResults, onSkip, onSetView, onSaveExit }: { user: AppUser; onResults: (r: QuizResults) => void; onSkip: () => void; onSetView: (v: View) => void; onSaveExit: () => void }) {
  const { lang, t } = useLang()
  const TOTAL = 13
  const draft = STORE.quizDraft(user.id)
  const [step, setStep] = useState(draft ? draft.step : -1)
  const [a, setA] = useState<QuizAnswers>(draft ? draft.answers : BLANK_QUIZ)
  const hasDraft = !!draft

  function answer(updates: Partial<QuizAnswers>) {
    setA(prev => {
      const next = { ...prev, ...updates }
      STORE.setQuizDraft(user.id, step, next)
      return next
    })
  }

  function goToStep(s: number) {
    setStep(s)
    if (s >= 0) STORE.setQuizDraft(user.id, s, a)
  }

  function canNext(): boolean {
    if (step === 0)  return !!a.powerNap
    if (step === 1)  return !!a.taskInitiation
    if (step === 2)  return !!a.noisePreference
    if (step === 3)  return a.bodyDoubling !== null
    if (step === 4)  return a.exerciseHelps !== null
    if (step === 5)  return !!a.procrastinate
    if (step === 6)  return !!a.startOrganized
    if (step === 7)  return !!a.hardToUnwind
    if (step === 8)  return !!a.distractedAtWork
    if (step === 9)  return !!a.emotionalDerail
    if (step === 10) return !!a.avoidFailure
    if (step === 11) return a.racingThoughts > 0
    if (step === 12) return a.carelessMistakes > 0
    return true
  }

  const freqOpts = lang === "id" ? FREQ_OPTS_ID : FREQ_OPTS

  const FreqQ = ({ label, sub, field }: { label: string; sub?: string; field: keyof QuizAnswers }) => (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">{t("How often does this happen to you?", "Seberapa sering ini terjadi padamu?")}</p>
        <h2 className="text-xl font-serif text-foreground leading-snug">{label}</h2>
        {sub && <p className="text-sm text-muted-foreground mt-1.5">{sub}</p>}
      </div>
      <div className="space-y-2">
        {freqOpts.map(opt => (
          <OptionButton key={opt.id} selected={a[field] === opt.id} onClick={() => answer({ [field]: opt.id })}>{opt.label}</OptionButton>
        ))}
      </div>
    </div>
  )

  const YesNoQ = ({ label, sub, field }: { label: string; sub?: string; field: keyof QuizAnswers }) => (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-serif text-foreground leading-snug">{label}</h2>
        {sub && <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{sub}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <OptionButton selected={a[field] === false} onClick={() => answer({ [field]: false })}>{t("No", "Tidak")}</OptionButton>
        <OptionButton selected={a[field] === true} onClick={() => answer({ [field]: true })}>{t("Yes", "Ya")}</OptionButton>
      </div>
    </div>
  )

  const ScaleQ = ({ label, field }: { label: string; field: keyof QuizAnswers }) => (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-muted-foreground/70 font-mono mb-2">{t("How much do you relate to this?", "Seberapa banyak kamu merasakan ini?")}</p>
        <p className="text-base text-foreground italic leading-relaxed border-l-2 border-accent pl-3">{label}</p>
      </div>
      <ScaleSelector value={a[field] as number} onChange={v => answer({ [field]: v })} low={t("Not at all", "Sama sekali tidak")} high={t("Completely", "Sepenuhnya")} />
    </div>
  )

  const questions: React.ReactNode[] = [
    // Q1 — Power nap
    <div key="powerNap" className="space-y-5">
      <div>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">{t("Rest strategy personalisation", "Personalisasi strategi istirahat")}</p>
        <h2 className="text-xl font-serif text-foreground leading-snug">{t("When you try to take a short power nap (10–20 min), what usually happens?", "Ketika kamu mencoba tidur siang singkat (10–20 menit), apa yang biasanya terjadi?")}</h2>
        <p className="text-sm text-muted-foreground mt-1.5">{t("Your answer directly affects which rest strategies we recommend.", "Jawabanmu langsung memengaruhi strategi istirahat yang kami rekomendasikan.")}</p>
      </div>
      <div className="space-y-2">
        {(lang === "id" ? [
          { id: "refreshed", label: "Saya bangun segar dan siap" },
          { id: "oversleep", label: "Saya tidak bisa berhenti — berubah jadi tidur berjam-jam" },
          { id: "cantSleep", label: "Saya kesulitan tidur sama sekali" },
          { id: "depends", label: "Tergantung harinya" },
        ] : [
          { id: "refreshed", label: "I wake up refreshed and ready to go" },
          { id: "oversleep", label: "I can't stop — it turns into hours of sleep" },
          { id: "cantSleep", label: "I struggle to fall asleep at all" },
          { id: "depends", label: "It depends on the day" },
        ]).map(opt => (
          <OptionButton key={opt.id} selected={a.powerNap === opt.id} onClick={() => answer({ powerNap: opt.id })}>{opt.label}</OptionButton>
        ))}
      </div>
    </div>,

    // Q2 — Task initiation
    <FreqQ key="taskInitiation" field="taskInitiation"
      label={t("How often do you find it nearly impossible to START a task — even when you genuinely want to do it?", "Seberapa sering kamu merasa hampir mustahil untuk MEMULAI tugas — bahkan saat kamu benar-benar ingin melakukannya?")}
      sub={t("Think about times you sat down to work but couldn't make yourself begin, no matter how hard you tried. This is called initiation paralysis and is very common in ADHD.", "Pikirkan saat kamu duduk untuk bekerja tapi tidak bisa memulai. Ini disebut kelumpuhan inisiasi, dan sangat umum pada ADHD.")} />,

    // Q3 — Noise preference
    <div key="noisePreference" className="space-y-5">
      <div>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">{t("Focus environment personalisation", "Personalisasi lingkungan fokus")}</p>
        <h2 className="text-xl font-serif text-foreground leading-snug">{t("When you need to focus, what tends to help most?", "Ketika kamu perlu fokus, apa yang paling membantu?")}</h2>
        <p className="text-sm text-muted-foreground mt-1.5">{t("We use this to decide when to suggest background noise vs silence.", "Kami menggunakan ini untuk memutuskan kapan menyarankan kebisingan latar vs ketenangan.")}</p>
      </div>
      <div className="space-y-2">
        {(lang === "id" ? [
          { id: "noise", label: "🎵 Kebisingan latar atau musik membantu fokus saya" },
          { id: "silence", label: "🔇 Saya butuh ketenangan total untuk berkonsentrasi" },
          { id: "depends", label: "🔀 Tergantung tugas atau suasana hati saya" },
        ] : [
          { id: "noise", label: "🎵 Background noise or music helps me focus" },
          { id: "silence", label: "🔇 I need complete silence to concentrate" },
          { id: "depends", label: "🔀 It depends on the task or my mood" },
        ]).map(opt => (
          <OptionButton key={opt.id} selected={a.noisePreference === opt.id} onClick={() => answer({ noisePreference: opt.id })}>{opt.label}</OptionButton>
        ))}
      </div>
    </div>,

    // Q4 — Body doubling
    <YesNoQ key="bodyDoubling" field="bodyDoubling"
      label={t("Does working near other people — even strangers sitting silently in a café — help you focus better?", "Apakah bekerja dekat orang lain — bahkan orang asing yang diam di kafe — membantumu lebih fokus?")}
      sub={t("This is called 'body doubling'. It works for many people with ADHD because social presence activates focus circuits. Your answer helps us decide when to suggest it.", "Ini disebut 'body doubling'. Efektif untuk banyak orang dengan ADHD karena kehadiran sosial mengaktifkan sirkuit fokus.")} />,

    // Q5 — Exercise
    <YesNoQ key="exerciseHelps" field="exerciseHelps"
      label={t("Does short physical activity (a 5-min walk, jumping jacks, stretching) noticeably improve your focus or mood?", "Apakah aktivitas fisik singkat (jalan 5 menit, lompat, peregangan) nyata meningkatkan fokus atau suasana hatimu?")}
      sub={t("Brief movement temporarily raises dopamine and norepinephrine. If it works for you, we'll suggest it more often during low-energy or low-focus states.", "Gerakan singkat sementara meningkatkan dopamin dan norepinefrin. Jika efektif bagimu, kami akan lebih sering menyarankannya saat energi atau fokus rendah.")} />,

    // Q6 — Procrastination
    <FreqQ key="procrastinate" field="procrastinate" label={t("How often do you put things off until the last minute?", "Seberapa sering kamu menunda pekerjaan sampai menit terakhir?")} />,

    // Q7 — Daily organisation
    <FreqQ key="startOrganized" field="startOrganized" label={t("How often do you start the day determined to get organised, and end it feeling defeated?", "Seberapa sering kamu memulai hari dengan tekad untuk terorganisir, tapi mengakhirinya dengan rasa kecewa?")} />,

    // Q8 — Difficulty unwinding
    <FreqQ key="hardToUnwind" field="hardToUnwind" label={t("Do you find it difficult to fully switch off and relax when you have free time?", "Apakah kamu merasa sulit untuk benar-benar bersantai dan rileks saat punya waktu luang?")} />,

    // Q9 — Distractibility at work
    <FreqQ key="distractedAtWork" field="distractedAtWork" label={t("Are you easily distracted by activity or noise around you when working?", "Apakah kamu mudah terganggu oleh aktivitas atau suara di sekitarmu saat bekerja?")} />,

    // Q10 — Emotional derailment
    <FreqQ key="emotionalDerail" field="emotionalDerail"
      label={t("How often do sudden emotional shifts — frustration, overwhelm, or anxiety — completely derail what you were doing?", "Seberapa sering perubahan emosi tiba-tiba — frustrasi, kewalahan, atau cemas — sepenuhnya menggagalkan apa yang sedang kamu lakukan?")}
      sub={t("Think about times when a feeling hijacked your plans mid-task. This affects which emotional regulation strategies we suggest.", "Pikirkan saat emosi mengambil alih rencanamu di tengah tugas. Ini memengaruhi strategi regulasi emosi yang kami sarankan.")} />,

    // Q11 — Failure avoidance
    <FreqQ key="avoidFailure" field="avoidFailure"
      label={t("When you start something new, how often do 'what if I fail' thoughts make it hard to keep going — even after you've already started?", "Saat memulai sesuatu yang baru, seberapa sering pikiran 'bagaimana kalau gagal' membuatmu sulit melanjutkan — bahkan setelah sudah mulai?")}
      sub={t("Think about times you second-guessed yourself or quietly backed out because the fear felt bigger than moving forward.", "Pikirkan saat kamu meragukan diri sendiri atau diam-diam mundur karena rasa takut terasa lebih besar dari melanjutkan.")} />,

    // Q12 — Racing thoughts / sleep
    <ScaleQ key="racingThoughts" field="racingThoughts" label={t("I struggle to fall asleep at night because of racing thoughts.", "Saya kesulitan tidur di malam hari karena pikiran yang terus berlari.")} />,

    // Q13 — Careless mistakes
    <ScaleQ key="carelessMistakes" field="carelessMistakes" label={t("I make careless mistakes when working on boring or difficult tasks.", "Saya membuat kesalahan ceroboh saat mengerjakan tugas yang membosankan atau sulit.")} />,
  ]

  if (step === -1) return (
    <div className="min-h-screen bg-background flex flex-col px-5 py-8 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-8">
        <AppBrand size="sm" showName={false} />
        <button onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground">
          {user.quizDone ? t("View results", "Lihat hasil") : t("Skip for now", "Lewati dulu")}
        </button>
      </div>
      <BottomNav active="quiz" onChange={onSetView} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col justify-center pb-20">
        <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mb-6">
          <Brain size={26} className="text-accent" />
        </div>
        <h1 className="text-3xl font-serif text-foreground mb-3">{t("ADHD Trait Profile", "Profil Sifat ADHD")}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          {t("This 13-question assessment explores how ADHD traits show up in your daily life — covering attention, emotion, executive function, and social experiences.", "Penilaian 13 pertanyaan ini mengeksplorasi bagaimana sifat ADHD muncul dalam kehidupan harianmu — mencakup perhatian, emosi, fungsi eksekutif, dan pengalaman sosial.")}
        </p>
        <div className="bg-muted/60 border border-border rounded-xl px-4 py-3.5 mb-4">
          <p className="text-xs font-semibold text-foreground mb-1">{t("How is this different from the sign-up questions?", "Apa bedanya dengan pertanyaan pendaftaran?")}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {lang === "id"
              ? <>Pertanyaan pendaftaran mengumpulkan info latar belakang dasar (usia, diagnosis, dll.). <span className="text-foreground font-medium">Kuis ini lebih mendalam</span> — memetakan pola sifat ADHD spesifikmu agar app dapat menyesuaikan rekomendasi dengan cara kerja otakmu.</>
              : <>The sign-up questions collected basic background info (age, diagnosis, etc.). <span className="text-foreground font-medium">This quiz goes deeper</span> — it maps your specific ADHD trait patterns so the app can shape its recommendations to match how <em>your</em> brain actually works.</>}
          </p>
        </div>
        <p className="text-xs text-muted-foreground/70 leading-relaxed mb-8">
          {t("Not a clinical diagnostic tool. Takes ~3 minutes.", "Bukan alat diagnostik klinis. Membutuhkan ~3 menit.")}
        </p>
        <div className="grid grid-cols-2 gap-2 mb-8">
          {[
            { label: t("13 questions", "13 pertanyaan"), icon: List },
            { label: t("~3 minutes", "~3 menit"), icon: Clock },
            { label: t("Attention & focus", "Perhatian & fokus"), icon: Target },
            { label: t("Emotion & social", "Emosi & sosial"), icon: Heart },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5">
              <Icon size={13} className="text-primary" /><span className="text-xs text-foreground">{label}</span>
            </div>
          ))}
        </div>
        {hasDraft && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Clock size={13} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">{t("Quiz in progress", "Kuis sedang berjalan")}</p>
              <p className="text-xs text-muted-foreground">{t(`Paused at question ${draft!.step + 1} of ${TOTAL}`, `Dijeda di pertanyaan ${draft!.step + 1} dari ${TOTAL}`)}</p>
            </div>
          </div>
        )}
        {hasDraft ? (
          <button onClick={() => setStep(draft!.step)} className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            {t(`Resume quiz — Q${draft!.step + 1}`, `Lanjutkan kuis — P${draft!.step + 1}`)}
          </button>
        ) : (
          <button onClick={() => { setA(BLANK_QUIZ); goToStep(0) }} className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            {user.quizDone ? t("Retake quiz", "Ikuti ulang kuis") : t("Start quiz", "Mulai kuis")}
          </button>
        )}
        {hasDraft && (
          <button onClick={() => { STORE.clearQuizDraft(user.id); setA(BLANK_QUIZ); goToStep(0) }}
            className="w-full mt-2 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t("Start over instead", "Mulai ulang dari awal")}
          </button>
        )}
        {!hasDraft && user.quizDone && (
          <button onClick={onSkip} className="w-full mt-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t("View previous results", "Lihat hasil sebelumnya")}
          </button>
        )}
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 py-8 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => step > 0 ? goToStep(step - 1) : goToStep(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={16} /> {t("Back", "Kembali")}
        </button>
        <p className="text-xs text-muted-foreground font-mono">{step + 1} / {TOTAL}</p>
        <button onClick={() => { STORE.setQuizDraft(user.id, step, a); onSaveExit() }}
          className="text-xs text-accent font-medium hover:text-accent/80 transition-colors">
          {t("Save & exit", "Simpan & keluar")}
        </button>
      </div>
      <div className="w-full bg-muted rounded-full h-1 mb-7">
        <div className="bg-accent h-1 rounded-full transition-all duration-300" style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
      </div>
      <motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }} className="flex-1">
        {questions[step]}
      </motion.div>
      <div className="sticky bottom-0 bg-background pt-4 pb-2 -mx-5 px-5 border-t border-border/50">
        <button onClick={() => { if (step < TOTAL - 1) { goToStep(step + 1) } else { STORE.clearQuizDraft(user.id); onResults(calcQuizResults(a)) } }}
          disabled={!canNext()}
          className={`w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-semibold transition-all active:scale-[0.99] ${canNext() ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
          {step < TOTAL - 1 ? (<>{t("Continue", "Lanjut")} <ChevronRight size={15} /></>) : t("See my results", "Lihat hasilku")}
        </button>
      </div>
    </div>
  )
}

// ── Quiz Results View ─────────────────────────────────────────────────────────

function Gauge({ score }: { score: number }) {
  const cx = 100, cy = 95, r = 75
  const clampedScore = Math.max(0, Math.min(100, score))
  const angle = Math.PI * (1 - clampedScore / 100)
  const sx = cx + r * Math.cos(angle)
  const sy = cy - r * Math.sin(angle)
  const trackD = "M 25 95 A 75 75 0 1 0 175 95"
  const activeD = clampedScore <= 0 ? "" : clampedScore >= 100 ? trackD : `M 25 95 A 75 75 0 ${angle < Math.PI / 2 ? 1 : 0} 0 ${sx.toFixed(2)} ${sy.toFixed(2)}`
  const col = score >= 80 ? "#C0392B" : score >= 60 ? "#E67E22" : score >= 30 ? "#27AE60" : "#27AE60"

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 100" className="w-44">
        <path d={trackD} fill="none" stroke="#E8E3DA" strokeWidth="12" strokeLinecap="round" />
        {activeD && <path d={activeD} fill="none" stroke={col} strokeWidth="12" strokeLinecap="round" />}
        <text x="100" y="92" textAnchor="middle" fontSize="22" fontWeight="600" fill="#1E1A14" fontFamily="Georgia, serif">
          {score}%
        </text>
      </svg>
    </div>
  )
}

function QuizResultsView({ results, onContinue, onSetView }: { results: QuizResults; onContinue: () => void; onSetView: (v: View) => void }) {
  const { lang, t } = useLang()
  const levelColor = { low: "#27AE60", moderate: "#F39C12", high: "#E67E22", "very-high": "#C0392B" }[results.level]
  const levelLabel = lang === "id"
    ? { low: "Rendah", moderate: "Sedang", high: "Tinggi", "very-high": "Sangat Tinggi" }[results.level]
    : { low: "Low", moderate: "Moderate", high: "High", "very-high": "Very High" }[results.level]

  const domains = [
    { label: t("Attention", "Perhatian"), score: results.attentionScore, color: "#5C4E8A" },
    { label: t("Executive", "Eksekutif"), score: results.executiveScore, color: "#3D5A80" },
    { label: t("Emotional", "Emosional"), score: results.emotionalScore, color: "#4A7B6F" },
    { label: t("Social", "Sosial"), score: results.socialScore, color: "#B8864E" },
  ]

  const legendItems = lang === "id"
    ? [{ l: "Rendah", c: "#27AE60" }, { l: "Sedang", c: "#F39C12" }, { l: "Tinggi", c: "#E67E22" }, { l: "Sangat Tinggi", c: "#C0392B" }]
    : [{ l: "Low", c: "#27AE60" }, { l: "Moderate", c: "#F39C12" }, { l: "High", c: "#E67E22" }, { l: "Very High", c: "#C0392B" }]

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      <BottomNav active="quiz" onChange={onSetView} />
      <div className="px-5 pt-8">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">{t("Your ADHD trait profile", "Profil sifat ADHD-mu")}</p>
        <h1 className="text-2xl font-serif text-foreground mb-5">
          {lang === "id"
            ? <>Kamu menunjukkan sifat ADHD <span style={{ color: levelColor }}>{levelLabel?.toLowerCase()}</span>.</>
            : <>You show <span style={{ color: levelColor }}>{levelLabel?.toLowerCase()}</span> ADHD-related traits.</>}
        </h1>

        <div className="bg-card border border-border rounded-2xl p-5 mb-5 flex flex-col items-center">
          <Gauge score={results.score} />
          <div className="flex gap-3 mt-3 text-xs flex-wrap justify-center">
            {legendItems.map(({ l, c }) => (
              <div key={l} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: c }} /><span className="text-muted-foreground">{l}</span></div>
            ))}
          </div>
        </div>

        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">{t("Domain breakdown", "Rincian domain")}</p>
        <div className="bg-card border border-border rounded-2xl p-4 mb-5">
          <ResponsiveContainer width="100%" height={150}>
            <BarChart id="qr-domains" data={domains} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#7A6E60" }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "#7A6E60" }} />
              <Tooltip formatter={(v) => [`${v}/10`]} contentStyle={{ borderRadius: "8px", border: "1px solid #E8E3DA", fontSize: "12px" }} />
              <Bar key="qr-domains-score" dataKey="score" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {domains.map((d, i) => <Cell key={`domain-cell-${i}`} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-accent/8 border border-accent/20 rounded-xl p-4 mb-5">
          <p className="text-sm font-semibold text-foreground mb-1.5">{t("What happens next?", "Apa yang terjadi selanjutnya?")}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{t("These results will immediately filter and personalise your check-in recommendations — strategies that don't match your patterns won't be shown.", "Hasil ini akan langsung memfilter dan mempersonalisasi rekomendasi check-in-mu — strategi yang tidak cocok dengan polamu tidak akan ditampilkan.")}</p>
        </div>

        <button onClick={onContinue}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          {t("Start a check-in", "Mulai check-in")}
        </button>
      </div>
    </div>
  )
}

// ── Dashboard View ────────────────────────────────────────────────────────────

function DashboardView({ user, onNewCheckin, onSetView }: { user: AppUser; onNewCheckin: () => void; onSetView: (v: View) => void }) {
  const { lang, t } = useLang()
  const allSessions = STORE.sessions()
  const totalCheckins = allSessions.length
  const streak = calcStreak(allSessions)
  const [trendRange, setTrendRange] = useState<7 | 14 | 30>(7)
  const [activeTab, setActiveTab] = useState<"overview" | "patterns" | "strategies">("overview")

  // ── Stat Summaries ──
  const recent7 = allSessions.filter(s => Date.now() - new Date(s.time).getTime() <= 7 * 864e5)
  const avg7Energy = recent7.length ? +(recent7.reduce((a, s) => a + s.checkIn.energy, 0) / recent7.length).toFixed(1) : 0
  const avg7Focus  = recent7.length ? +(recent7.reduce((a, s) => a + s.checkIn.focus,  0) / recent7.length).toFixed(1) : 0

  // ── Trend Chart ──
  const trendData = Array.from({ length: trendRange }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (trendRange - 1 - i))
    const ds = d.toISOString().split("T")[0]
    const day = allSessions.filter(s => s.date === ds)
    const avg = (key: keyof CheckInData) => day.length ? +(day.reduce((a, s) => a + (s.checkIn[key] as number), 0) / day.length).toFixed(1) : undefined
    return {
      label: d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
      energy: avg("energy"),
      focus:  avg("focus"),
      stress: avg("stress"),
    }
  })

  // ── Activity Calendar — week-aligned (Mon → Sun), last 5 complete weeks + current partial ──
  const calendarCells = (() => {
    const today = new Date()
    const dow = today.getDay() // 0=Sun, 1=Mon…
    const daysSinceMon = dow === 0 ? 6 : dow - 1
    const thisMonday = new Date(today); thisMonday.setDate(today.getDate() - daysSinceMon)
    const start = new Date(thisMonday); start.setDate(thisMonday.getDate() - 28) // 4 full weeks back
    const cells: { ds: string; count: number }[] = []
    const cur = new Date(start)
    while (cur <= today) {
      const ds = cur.toISOString().split("T")[0]
      cells.push({ ds, count: allSessions.filter(s => s.date === ds).length })
      cur.setDate(cur.getDate() + 1)
    }
    return cells
  })()

  // ── State Frequency ──
  const stateFreq: Record<string, number> = {}
  allSessions.forEach(s => { stateFreq[s.cognitiveState] = (stateFreq[s.cognitiveState] || 0) + 1 })
  const pieData = Object.entries(stateFreq)
    .sort(([, a], [, b]) => b - a)
    .map(([state, count]) => ({
      name: STATE_INFO[state as CognitiveState]?.label ?? state,
      value: count,
      color: STATE_INFO[state as CognitiveState]?.color ?? "#999",
      pct: Math.round((count / (totalCheckins || 1)) * 100),
    }))

  // ── Mood Distribution ──
  const moodCounts: Record<Mood, number> = { low: 0, anxious: 0, neutral: 0, good: 0, great: 0 }
  allSessions.forEach(s => { moodCounts[s.checkIn.mood]++ })
  const moodBars = [...MOOD_OPTS].reverse().map(m => ({
    ...m,
    count: moodCounts[m.id],
    pct: totalCheckins ? Math.round((moodCounts[m.id] / totalCheckins) * 100) : 0,
  })).filter(m => m.count > 0)

  // ── Time-of-Day Patterns ──
  const timePatterns = TIME_OPTS.map(t => {
    const sess = allSessions.filter(s => s.checkIn.timeOfDay === t.id)
    if (!sess.length) return null
    return {
      label: t.label.split(" ")[0],
      energy: +(sess.reduce((a, s) => a + s.checkIn.energy, 0) / sess.length).toFixed(1),
      focus:  +(sess.reduce((a, s) => a + s.checkIn.focus,  0) / sess.length).toFixed(1),
      count: sess.length,
    }
  }).filter(Boolean) as { label: string; energy: number; focus: number; count: number }[]

  // ── Day-of-Week Patterns ──
  const DOW_LABELS = lang === "id"
    ? ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const dowPatterns = DOW_LABELS.map((day, i) => {
    const jsDay = (i + 1) % 7 // Mon=1 … Sun=0
    const sess = allSessions.filter(s => new Date(s.time).getDay() === jsDay)
    return {
      day,
      energy: sess.length ? +(sess.reduce((a, s) => a + s.checkIn.energy, 0) / sess.length).toFixed(1) : 0,
      focus:  sess.length ? +(sess.reduce((a, s) => a + s.checkIn.focus,  0) / sess.length).toFixed(1) : 0,
      count: sess.length,
    }
  })

  // ── 14-day mini-series helper ──
  const build14d = (key: keyof CheckInData | "concern") =>
    Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i))
      const ds = d.toISOString().split("T")[0]
      const day = allSessions.filter(s => s.date === ds)
      // Use month/day so labels are unique across 14 days (weekday names repeat)
      const label = d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })
      if (!day.length) return { label, v: undefined as number | undefined }
      const val = key === "concern"
        ? day.reduce((a, s) => {
            const c = STATE_CONCERN[s.cognitiveState]
            return a + (c === "green" ? 1 : c === "yellow" ? 2 : c === "orange" ? 3 : 4)
          }, 0) / day.length
        : day.reduce((a, s) => a + (s.checkIn[key] as number), 0) / day.length
      return { label, v: +val.toFixed(1) }
    })

  const sleepSeries   = build14d("sleep")
  const concernSeries = build14d("concern")

  // ── Strategy Effectiveness ──
  const stratMap: Record<string, { total: number; count: number; rec: Rec }> = {}
  allSessions.forEach(s => {
    Object.entries(s.feedback ?? {}).forEach(([id, rating]) => {
      const rec = findRec(id); if (!rec) return
      if (!stratMap[id]) stratMap[id] = { total: 0, count: 0, rec }
      stratMap[id].total += rating; stratMap[id].count++
    })
  })
  const topStrategies = Object.values(stratMap)
    .map(({ total, count, rec }) => ({ rec, avg: +(total / count).toFixed(1), count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5)

  const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  allSessions.forEach(s => Object.values(s.feedback ?? {}).forEach(r => { ratingDist[r] = (ratingDist[r] ?? 0) + 1 }))
  const ratingDistData = [1, 2, 3, 4, 5].map(r => ({ star: `${r}★`, count: ratingDist[r] ?? 0, r }))

  const catMap: Record<string, { total: number; count: number }> = {}
  allSessions.forEach(s => {
    Object.entries(s.feedback ?? {}).forEach(([id, rating]) => {
      const rec = findRec(id); if (!rec) return
      if (!catMap[rec.category]) catMap[rec.category] = { total: 0, count: 0 }
      catMap[rec.category].total += rating; catMap[rec.category].count++
    })
  })
  const catData = Object.entries(catMap)
    .map(([cat, { total, count }]) => ({ cat, avg: +(total / count).toFixed(1) }))
    .sort((a, b) => b.avg - a.avg)

  const hasData = totalCheckins > 0
  const CHART_STYLE = { borderRadius: "8px", border: "1px solid #E8E3DA", fontSize: "11px", background: "#FDFAF5" }
  const TICK = { fontSize: 9, fill: "#7A6E60" }

  // ── Shared Legend Row ──
  const Legend2 = ({ items }: { items: { color: string; label: string }[] }) => (
    <div className="flex gap-4 mt-2 flex-wrap">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-24 max-w-md mx-auto">
      <div className="px-5 pt-8 pb-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-0.5">{t("Your progress", "Perkembanganmu")}</p>
            <h1 className="text-2xl font-serif text-foreground">{t("Dashboard", "Dasbor")}</h1>
          </div>
          <button onClick={() => onSetView("history")}
            className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
            <History size={13} /> {t("View history", "Lihat riwayat")}
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: t("Check-ins", "Check-in"), value: totalCheckins.toString(), sub: t("total", "total") },
            { label: t("Streak", "Streak"),    value: streak.toString(), sub: streak === 1 ? t("day 🔥", "hari 🔥") : t("days 🔥", "hari 🔥") },
            { label: t("Energy", "Energi"),    value: avg7Energy ? avg7Energy.toFixed(1) : "—", sub: t("7d avg", "rata 7h") },
            { label: t("Focus", "Fokus"),     value: avg7Focus  ? avg7Focus.toFixed(1)  : "—", sub: t("7d avg", "rata 7h") },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-card border border-border rounded-xl px-2 py-3 text-center">
              <p className="text-base font-bold text-foreground leading-none mb-1">{value}</p>
              <p className="text-[9px] text-muted-foreground font-mono leading-tight uppercase tracking-wide">{sub}</p>
            </div>
          ))}
        </div>

        {!hasData ? (
          /* Empty state */
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={24} className="text-primary" />
            </div>
            <h2 className="text-lg font-serif text-foreground mb-2">{t("No data yet", "Belum ada data")}</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-xs mx-auto">
              {t("Complete your first check-in to start seeing patterns, trends, and insights here.", "Selesaikan check-in pertamamu untuk mulai melihat pola, tren, dan wawasan di sini.")}
            </p>
            <button onClick={onNewCheckin}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              {t("Start first check-in", "Mulai check-in pertama")}
            </button>
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="flex gap-1 bg-muted rounded-xl p-1 mb-5">
              {(["overview", "patterns", "strategies"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors capitalize ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {tab === "overview" ? t("Overview", "Ikhtisar") : tab === "patterns" ? t("Patterns", "Pola") : t("Strategies", "Strategi")}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <div className="space-y-4">

                {/* Trend: Energy / Focus / Stress */}
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{t("Trend", "Tren")}</p>
                    <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
                      {([7, 14, 30] as const).map(r => (
                        <button key={r} onClick={() => setTrendRange(r)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${trendRange === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                          {r}d
                        </button>
                      ))}
                    </div>
                  </div>
                  {trendData.some(d => d.energy !== undefined) ? (
                    <SvgMultiArea
                      data={trendData}
                      series={[
                        { key: "energy", color: "#2D4A3E", opacity: 0.12, strokeWidth: 2 },
                        { key: "focus",  color: "#B8864E", opacity: 0.12, strokeWidth: 2 },
                        { key: "stress", color: "#C0563F", opacity: 0.08, strokeWidth: 1.5, dash: "4 2" },
                      ]}
                      domain={[0, 5]}
                      height={140}
                    />
                  ) : (
                    <div className="h-28 flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">{t("More check-ins needed", "Perlu lebih banyak check-in")}</p>
                    </div>
                  )}
                  <Legend2 items={[{ color: "#2D4A3E", label: t("Energy", "Energi") }, { color: "#B8864E", label: t("Focus", "Fokus") }, { color: "#C0563F", label: t("Stress", "Stres") }]} />
                </div>

                {/* Activity Calendar */}
                <div className="bg-card border border-border rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">{t("Check-in activity", "Aktivitas check-in")}</p>
                  <div className="grid gap-[3px]" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                    {(lang === "id" ? ["S", "S", "R", "K", "J", "S", "M"] : ["M", "T", "W", "T", "F", "S", "S"]).map((d, i) => (
                      <div key={i} className="text-center text-[9px] text-muted-foreground font-mono pb-1">{d}</div>
                    ))}
                    {calendarCells.map(({ ds, count }) => {
                      const bg = count === 0 ? "#EDE8DF" : count === 1 ? "#9BBDB5" : count === 2 ? "#5A8F85" : "#2D4A3E"
                      return (
                        <div key={ds} title={`${ds}: ${count} check-in${count !== 1 ? "s" : ""}`}
                          className="rounded-sm aspect-square transition-transform hover:scale-110 cursor-default"
                          style={{ background: bg }} />
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5 justify-end">
                    <span className="text-[9px] text-muted-foreground">{t("Less", "Sedikit")}</span>
                    {["#EDE8DF", "#9BBDB5", "#5A8F85", "#2D4A3E"].map(c => (
                      <div key={c} className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
                    ))}
                    <span className="text-[9px] text-muted-foreground">{t("More", "Banyak")}</span>
                  </div>
                </div>

                {/* State Distribution: donut + list */}
                {pieData.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">{t("State distribution", "Distribusi kondisi")}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {(() => {
                          const r = 46, ri = 28, cx = 48, cy = 48, stroke = 2
                          const total = pieData.reduce((s, d) => s + d.value, 0)
                          let angle = -Math.PI / 2
                          const slices = pieData.map(d => {
                            const sweep = (d.value / total) * 2 * Math.PI
                            const a0 = angle, a1 = angle + sweep
                            angle = a1
                            const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0)
                            const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1)
                            const xi0 = cx + ri * Math.cos(a0), yi0 = cy + ri * Math.sin(a0)
                            const xi1 = cx + ri * Math.cos(a1), yi1 = cy + ri * Math.sin(a1)
                            const lg = sweep > Math.PI ? 1 : 0
                            const path = `M ${x0} ${y0} A ${r} ${r} 0 ${lg} 1 ${x1} ${y1} L ${xi1} ${yi1} A ${ri} ${ri} 0 ${lg} 0 ${xi0} ${yi0} Z`
                            return { path, color: d.color, name: d.name }
                          })
                          return (
                            <svg width={96} height={96}>
                              {slices.map((s, i) => (
                                <path key={i} d={s.path} fill={s.color} stroke="#FDFAF5" strokeWidth={stroke} />
                              ))}
                            </svg>
                          )
                        })()}
                      </div>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        {pieData.slice(0, 5).map(({ name, pct, color }) => (
                          <div key={name} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                            <p className="text-[11px] text-foreground flex-1 truncate leading-tight">{name}</p>
                            <span className="text-[11px] font-mono text-muted-foreground flex-shrink-0">{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Concern level bar below the donut */}
                    <div className="mt-4 pt-3 border-t border-border space-y-2">
                      {Object.entries(stateFreq).sort(([, a], [, b]) => b - a).slice(0, 4).map(([state, count]) => {
                        const info = STATE_INFO[state as CognitiveState]
                        const pct = Math.round((count / (totalCheckins || 1)) * 100)
                        return (
                          <div key={state} className="flex items-center gap-2.5">
                            <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 relative" style={{ background: info.bg }}>
                              <info.Icon size={10} style={{ color: info.color }} />
                              <span className="absolute -top-0.5 -right-0.5 rounded-full ring-1 ring-card"
                                style={{ width: 6, height: 6, background: CONCERN_META[STATE_CONCERN[state as CognitiveState]].dot }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between mb-0.5">
                                <span className="text-[11px] text-foreground">{info.label}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">{pct}%</span>
                              </div>
                              <div className="h-1 bg-muted rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: info.color }} />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Mood Distribution */}
                {moodBars.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">{t("Mood distribution", "Distribusi suasana hati")}</p>
                    <div className="space-y-2.5">
                      {moodBars.map(m => (
                        <div key={m.id} className="flex items-center gap-2.5">
                          <span className="text-base flex-shrink-0">{m.emoji}</span>
                          <p className="text-[11px] text-foreground w-20 flex-shrink-0 truncate">{m.label.split(" /")[0]}</p>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${m.pct}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground w-7 text-right">{m.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PATTERNS TAB ── */}
            {activeTab === "patterns" && (
              <div className="space-y-4">

                {/* Time of Day */}
                {timePatterns.length >= 2 ? (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">{t("Avg by time of day", "Rata-rata per waktu")}</p>
                    <p className="text-[10px] text-muted-foreground/70 mb-3">{t("When are you sharpest?", "Kapan kamu paling tajam?")}</p>
                    <SvgGroupedBar
                      data={timePatterns}
                      series={[
                        { key: "energy", color: "#2D4A3E" },
                        { key: "focus",  color: "#B8864E" },
                      ]}
                      domain={[0, 5]}
                      height={140}
                      maxBarW={22}
                    />
                    <Legend2 items={[{ color: "#2D4A3E", label: t("Energy", "Energi") }, { color: "#B8864E", label: t("Focus", "Fokus") }]} />
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-2xl p-5 text-center">
                    <Clock size={20} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">{t("Check in at different times of day to reveal your energy patterns.", "Check-in di waktu yang berbeda untuk mengungkap pola energimu.")}</p>
                  </div>
                )}

                {/* Day of Week */}
                {dowPatterns.some(d => d.count > 0) && (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">{t("Avg by day of week", "Rata-rata per hari")}</p>
                    <p className="text-[10px] text-muted-foreground/70 mb-3">{t("Your best and hardest days", "Hari terbaikmu dan terberatmu")}</p>
                    <SvgGroupedBar
                      data={dowPatterns}
                      xKey="day"
                      series={[
                        { key: "energy", color: "#2D4A3E" },
                        { key: "focus",  color: "#B8864E" },
                      ]}
                      domain={[0, 5]}
                      height={130}
                      maxBarW={16}
                    />
                    <Legend2 items={[{ color: "#2D4A3E", label: t("Energy", "Energi") }, { color: "#B8864E", label: t("Focus", "Fokus") }]} />
                  </div>
                )}

                {/* Sleep Quality — 14d */}
                {sleepSeries.some(d => d.v !== undefined) && (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">{t("Sleep quality — last 14 days", "Kualitas tidur — 14 hari terakhir")}</p>
                    <p className="text-[10px] text-muted-foreground/70 mb-3">{t("1 = poor · 5 = excellent", "1 = buruk · 5 = sangat baik")}</p>
                    <SvgMultiArea
                      data={sleepSeries.map(d => ({ ...d, sleepVal: d.v }))}
                      series={[{ key: "sleepVal", color: "#5C4E8A", opacity: 0.12, strokeWidth: 2 }]}
                      domain={[0, 5]}
                      height={110}
                    />
                  </div>
                )}

                {/* Concern Level — 14d */}
                {concernSeries.some(d => d.v !== undefined) && (
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">{t("Concern level — last 14 days", "Tingkat kekhawatiran — 14 hari terakhir")}</p>
                    <p className="text-[10px] text-muted-foreground/70 mb-3">{t("1 = doing well · 4 = high concern", "1 = baik-baik saja · 4 = kekhawatiran tinggi")}</p>
                    <SvgMultiArea
                      data={concernSeries.map(d => ({ ...d, concernVal: d.v }))}
                      series={[{ key: "concernVal", color: "#C0563F", opacity: 0.1, strokeWidth: 2 }]}
                      domain={[1, 4]}
                      height={110}
                    />
                    <div className="flex items-center justify-between mt-2">
                      {(lang === "id"
                      ? [{ label: "1 — Baik-baik saja", bg: "#EAF6EF", dot: "#3E9E6F" }, { label: "2 — Ringan", bg: "#FBF4E2", dot: "#D9A833" }, { label: "3 — Sedang", bg: "#FBEEE0", dot: "#DE8A3D" }, { label: "4 — Tinggi", bg: "#F9EAE6", dot: "#C0563F" }]
                      : [{ label: "1 — Doing well", bg: "#EAF6EF", dot: "#3E9E6F" }, { label: "2 — Mild", bg: "#FBF4E2", dot: "#D9A833" }, { label: "3 — Moderate", bg: "#FBEEE0", dot: "#DE8A3D" }, { label: "4 — High", bg: "#F9EAE6", dot: "#C0563F" }]
                    ).map(({ label, bg, dot }) => (
                        <div key={label} className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
                          <span className="text-[9px] text-muted-foreground hidden sm:block">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── STRATEGIES TAB ── */}
            {activeTab === "strategies" && (
              <div className="space-y-4">
                {topStrategies.length > 0 ? (
                  <>
                    {/* Top-rated list */}
                    <div className="bg-card border border-border rounded-2xl p-4">
                      <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">{t("Your top strategies", "Strategi terbaikmu")}</p>
                      <div className="space-y-3.5">
                        {topStrategies.map(({ rec, avg, count }, idx) => (
                          <div key={rec.id} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0 mt-0.5"
                              style={{ background: rec.color }}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground leading-snug">{rec.title}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{rec.category} · {count} {t(`rating${count !== 1 ? "s" : ""}`, "penilaian")}</p>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <Star size={11} className="fill-amber-500 text-amber-500" />
                              <span className="text-xs font-bold font-mono text-foreground">{avg}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rating Distribution */}
                    {ratingDistData.some(d => d.count > 0) && (
                      <div className="bg-card border border-border rounded-2xl p-4">
                        <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">{t("Rating distribution", "Distribusi penilaian")}</p>
                        <p className="text-[10px] text-muted-foreground/70 mb-3">{t("How you rated your strategies", "Bagaimana kamu menilai strategimu")}</p>
                        {(() => {
                          const maxCount = Math.max(...ratingDistData.map(d => d.count), 1)
                          return (
                            <div className="flex items-end gap-1.5 h-24 mt-2">
                              {ratingDistData.map((entry, i) => {
                                const pct = entry.count / maxCount
                                const fill = entry.r >= 4 ? "#2D4A3E" : entry.r === 3 ? "#B8864E" : "#C4B9AC"
                                return (
                                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    {entry.count > 0 && (
                                      <span className="text-[8px] text-muted-foreground font-mono">{entry.count}</span>
                                    )}
                                    <div className="w-full rounded-t-[3px]" style={{ height: `${Math.max(pct * 72, entry.count > 0 ? 4 : 0)}px`, background: fill }} />
                                    <span className="text-[9px] text-muted-foreground">{entry.star}</span>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })()}
                        <div className="flex gap-3 mt-2">
                          {(lang === "id"
                            ? [{ color: "#2D4A3E", label: "Membantu (4–5★)" }, { color: "#B8864E", label: "Netral (3★)" }, { color: "#C4B9AC", label: "Tidak membantu (1–2★)" }]
                            : [{ color: "#2D4A3E", label: "Helpful (4–5★)" }, { color: "#B8864E", label: "Neutral (3★)" }, { color: "#C4B9AC", label: "Unhelpful (1–2★)" }]
                          ).map(({ color, label }) => (
                            <div key={label} className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                              <span className="text-[9px] text-muted-foreground">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Avg rating by category */}
                    {catData.length > 0 && (
                      <div className="bg-card border border-border rounded-2xl p-4">
                        <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">{t("Avg rating by category", "Rata-rata per kategori")}</p>
                        <div className="space-y-2.5">
                          {catData.map(({ cat, avg }) => (
                            <div key={cat} className="flex items-center gap-2.5">
                              <p className="text-[11px] text-foreground w-24 flex-shrink-0 leading-tight">{cat}</p>
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(+avg / 5) * 100}%` }} />
                              </div>
                              <div className="flex items-center gap-0.5 flex-shrink-0 w-9">
                                <Star size={9} className="fill-amber-500 text-amber-500" />
                                <span className="text-[10px] font-mono text-foreground">{avg}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-card border border-border rounded-2xl p-8 text-center">
                    <Star size={24} className="text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">{t("No ratings yet", "Belum ada penilaian")}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      {t("Rate your strategies after each check-in and Recomood will show you what works best for your brain.", "Nilai strategimu setelah setiap check-in dan Recomood akan menampilkan yang paling cocok untuk otakmu.")}
                    </p>
                  </div>
                )}
              </div>
            )}

            <button onClick={onNewCheckin}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity mt-5">
              {t("New check-in", "Check-in baru")}
            </button>
          </>
        )}
      </div>
      <BottomNav active="dashboard" onChange={onSetView} />
    </div>
  )
}

// ── History View ──────────────────────────────────────────────────────────────

function HistoryView({ onBack, onOpen }: { onBack: () => void; onOpen: (s: Session) => void }) {
  const { lang, t } = useLang()
  const allSessions = STORE.sessions().slice().reverse()
  const [range, setRange] = useState<"7" | "30" | "all">("all")
  const [filter, setFilter] = useState<CognitiveState | "all">("all")

  const now = Date.now()
  const rangeMs = range === "7" ? 7 * 864e5 : range === "30" ? 30 * 864e5 : Infinity
  const inRange = allSessions.filter(s => now - new Date(s.time).getTime() <= rangeMs)
  const filtered = filter === "all" ? inRange : inRange.filter(s => s.cognitiveState === filter)

  return (
    <div className="min-h-screen bg-background pb-10 max-w-md mx-auto">
      <div className="px-5 pt-8 pb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 hover:text-foreground transition-colors">
          <ChevronLeft size={16} /> {t("Back", "Kembali")}
        </button>
        <h1 className="text-2xl font-serif text-foreground mb-1">{t("Check-in history", "Riwayat check-in")}</h1>
        <p className="text-sm text-foreground/60 mb-4">{t("Tap any check-in to reopen its full report.", "Ketuk check-in mana pun untuk membuka laporan lengkapnya.")}</p>

        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-3">
          {(([["7", t("Last 7 days", "7 hari terakhir")], ["30", t("Last 30 days", "30 hari terakhir")], ["all", t("All time", "Semua waktu")]] as ["7" | "30" | "all", string][])
          ).map(([id, label]) => (
            <button key={id} onClick={() => setRange(id)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${range === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button onClick={() => setFilter("all")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}>
            {t("All", "Semua")} ({inRange.length})
          </button>
          {(Object.entries(STATE_INFO) as [CognitiveState, StateInfo][]).map(([state, info]) => {
            const count = inRange.filter(s => s.cognitiveState === state).length
            if (!count) return null
            return (
              <button key={state} onClick={() => setFilter(state)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === state ? "text-white" : "bg-card border border-border text-muted-foreground"}`}
                style={filter === state ? { background: info.color } : {}}>
                {info.label.split(" ")[0]} ({count})
              </button>
            )
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <History size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">{t("No check-ins in this range yet.", "Belum ada check-in dalam rentang ini.")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => {
              const info = STATE_INFO[s.cognitiveState]
              const date = new Date(s.time)
              const dateStr = date.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { month: "short", day: "numeric", year: "numeric" })
              const timeStr = date.toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", { hour: "numeric", minute: "2-digit" })
              return (
                <button key={s.id} onClick={() => onOpen(s)}
                  className="w-full text-left bg-card border border-border rounded-xl px-4 py-4 transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99]">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 relative" style={{ background: info.bg }}>
                      <info.Icon size={15} style={{ color: info.color }} />
                      <span className="absolute -top-1 -right-1 rounded-full ring-2 ring-card" style={{ width: 9, height: 9, background: CONCERN_META[STATE_CONCERN[s.cognitiveState]].dot }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{info.label}</p>
                        <p className="text-xs text-muted-foreground flex-shrink-0 font-mono">{timeStr}</p>
                      </div>
                      <p className="text-xs text-foreground/55 mt-0.5">{dateStr}</p>
                      <div className="mt-2"><ConcernBadge state={s.cognitiveState} /></div>
                      <div className="flex gap-4 mt-2.5">
                        {[{ label: t("Energy", "Energi"), val: s.checkIn.energy }, { label: t("Focus", "Fokus"), val: s.checkIn.focus }, { label: t("Stress", "Stres"), val: s.checkIn.stress }].map(({ label, val }) => (
                          <div key={label}>
                            <p className="text-xs font-semibold text-foreground">{val}/5</p>
                            <p className="text-[10px] text-foreground/50">{label}</p>
                          </div>
                        ))}
                        <div>
                          <p className="text-xs font-semibold text-foreground capitalize">{s.checkIn.mood}</p>
                          <p className="text-[10px] text-foreground/50">{t("Mood", "Suasana hati")}</p>
                        </div>
                      </div>
                      {s.notes && (
                        <div className="mt-2.5 flex items-start gap-1.5 bg-muted/50 rounded-lg px-2.5 py-2">
                          <PenLine size={11} className="text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2">{s.notes}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs font-medium text-primary">
                        {t("View report", "Lihat laporan")} <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Resources View ────────────────────────────────────────────────────────────

interface ArticleRes { title: string; source: string; desc: string; tag: string; url: string; takeaways: string[] }
interface VideoRes { title: string; creator: string; duration: string; desc: string; tag: string; url: string }
interface BookRes { title: string; author: string; desc: string; url: string }

const ADHD_RESOURCES: { articles: ArticleRes[]; videos: VideoRes[]; books: BookRes[] } = {
  articles: [
    { title: "What Is ADHD?", source: "CDC", tag: "Foundational", url: "https://www.cdc.gov/adhd/about/index.html",
      desc: "Overview of ADHD symptoms, types, and diagnosis from leading health authorities.",
      takeaways: ["ADHD has 3 types: inattentive, hyperactive, and combined.", "It's a brain-based condition, not a lack of willpower.", "Diagnosis needs symptoms across more than one setting."] },
    { title: "ADHD & Executive Function", source: "Russell Barkley, PhD", tag: "Research", url: "https://www.additudemag.com/adhd-executive-function-disorder/",
      desc: "Why ADHD is best understood as a disorder of self-regulation, not just attention.",
      takeaways: ["ADHD affects the brain's 'management system'.", "It's about doing what you know, not knowing what to do.", "Working memory and time-awareness are commonly affected."] },
    { title: "Rejection Sensitive Dysphoria", source: "William Dodson, MD", tag: "Emotional", url: "https://www.additudemag.com/rejection-sensitive-dysphoria-adhd-emotional-dysregulation/",
      desc: "The ADHD-specific emotional sensitivity to rejection — why it's intense and what helps.",
      takeaways: ["RSD is sudden, intense pain from real or perceived rejection.", "It affects nearly everyone with ADHD.", "Naming it reduces shame and self-blame."] },
    { title: "Women & Girls with ADHD", source: "ADDitude Magazine", tag: "Identity", url: "https://www.additudemag.com/adhd-in-women-symptoms/",
      desc: "Why ADHD is underdiagnosed in women and how symptoms differ.",
      takeaways: ["Girls more often show inattentive, quieter symptoms.", "Many are diagnosed late, in adulthood.", "Masking can hide struggles for years."] },
    { title: "ADHD & Sleep", source: "Cortese et al., Sleep Medicine Reviews", tag: "Sleep", url: "https://www.additudemag.com/adhd-sleep-disturbances-symptoms/",
      desc: "73% of adults with ADHD report chronic sleep problems.",
      takeaways: ["The ADHD body clock often runs 1–2 hours late.", "Poor sleep worsens focus and mood the next day.", "Consistent wake times help more than early bedtimes."] },
    { title: "The ADHD Advantage: Hyperfocus", source: "Hupfeld et al., Psychological Research", tag: "Strengths", url: "https://www.additudemag.com/understanding-adhd-hyperfocus/",
      desc: "When channeled intentionally, hyperfocus is one of ADHD's most powerful traits.",
      takeaways: ["Hyperfocus can sustain attention for hours.", "It works best on high-interest tasks.", "Timers help you exit before burning out."] },
  ],
  videos: [
    { title: "30 Essential Ideas About ADHD", creator: "Russell Barkley", duration: "3 hrs", tag: "Must-watch", url: "https://www.youtube.com/results?search_query=Russell+Barkley+30+Essential+Ideas+about+ADHD",
      desc: "The definitive lecture series on modern ADHD science." },
    { title: "ADHD as Executive Function Disorder", creator: "Russell Barkley", duration: "45 min", tag: "Science", url: "https://www.youtube.com/results?search_query=Barkley+ADHD+executive+function+disorder",
      desc: "Why ADHD isn't a knowledge problem, but a performance problem." },
    { title: "How to ADHD", creator: "Jessica McCabe", duration: "Various", tag: "Practical", url: "https://www.youtube.com/@HowtoADHD",
      desc: "Approachable, research-backed videos on practical ADHD strategies." },
    { title: "ADHD & Rejection Sensitive Dysphoria", creator: "ADDitude Magazine", duration: "60 min", tag: "Emotional", url: "https://www.youtube.com/results?search_query=ADDitude+rejection+sensitive+dysphoria+webinar",
      desc: "Expert webinar on emotional dysregulation and RSD in ADHD adults." },
    { title: "The Mindfulness Prescription for ADHD", creator: "Lidia Zylowska, MD", duration: "30 min", tag: "Mindfulness", url: "https://www.youtube.com/results?search_query=Zylowska+mindfulness+prescription+ADHD",
      desc: "How mindfulness helps ADHD brains regulate attention and emotion." },
  ],
  books: [
    { title: "Taking Charge of Adult ADHD", author: "Russell A. Barkley", desc: "The most evidence-based practical guide for adults with ADHD.", url: "https://www.google.com/search?q=Taking+Charge+of+Adult+ADHD+Barkley" },
    { title: "A New Understanding of ADHD", author: "Thomas E. Brown, PhD", desc: "Reframes ADHD through executive function impairment with case studies.", url: "https://www.google.com/search?q=A+New+Understanding+of+ADHD+Thomas+Brown" },
    { title: "Smart But Stuck", author: "Thomas E. Brown, PhD", desc: "For high-achieving adults whose ADHD creates invisible barriers.", url: "https://www.google.com/search?q=Smart+But+Stuck+Thomas+Brown" },
    { title: "The Mindfulness Prescription for Adult ADHD", author: "Lidia Zylowska, MD", desc: "Practical 8-week mindfulness program with strong clinical evidence.", url: "https://www.google.com/search?q=Mindfulness+Prescription+for+Adult+ADHD+Zylowska" },
    { title: "Cognitive-Behavioral Therapy for Adult ADHD", author: "Mary Solanto, PhD", desc: "The clinical textbook behind this app's CBT strategies.", url: "https://www.google.com/search?q=Cognitive+Behavioral+Therapy+for+Adult+ADHD+Solanto" },
  ],
}

function CopyTitleButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); e.preventDefault()
        navigator.clipboard?.writeText(title).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }).catch(() => {})
      }}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 active:scale-95">
      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy title</>}
    </button>
  )
}

function ResourcesView({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"articles" | "videos" | "books">("articles")
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background pb-10 max-w-md mx-auto">
      <div className="px-5 pt-8 pb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 hover:text-foreground transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-serif text-foreground mb-1">Learn about ADHD</h1>
        <p className="text-sm text-foreground/70 mb-5 leading-relaxed">Tap any card to open it. Short, skimmable summaries — no long reads required.</p>

        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-5">
          {(["articles", "videos", "books"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "articles" && (
          <div className="space-y-3">
            {ADHD_RESOURCES.articles.map(a => {
              const open = expanded === a.title
              return (
                <div key={a.title} className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
                  <a href={a.url} target="_blank" rel="noopener noreferrer"
                    className="block px-4 py-4 active:bg-muted/40 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-semibold text-foreground leading-snug">{a.title}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono flex-shrink-0">{a.tag}</span>
                    </div>
                    <p className="text-xs text-foreground/70 mb-2 leading-relaxed">{a.desc}</p>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                      <ExternalLink size={12} /> Open article
                    </div>
                  </a>
                  <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
                    <button onClick={() => setExpanded(open ? null : a.title)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 active:scale-95">
                      {open ? <>Hide summary <ChevronUp size={12} /></> : <>Read more <ChevronDown size={12} /></>}
                    </button>
                    <CopyTitleButton title={a.title} />
                  </div>
                  {open && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-4 pb-4 overflow-hidden">
                      <div className="bg-muted/50 rounded-xl p-3.5 border border-border">
                        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Key takeaways</p>
                        <ul className="space-y-1.5">
                          {a.takeaways.map(t => (
                            <li key={t} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                              <span className="text-primary mt-0.5 flex-shrink-0">•</span>{t}
                            </li>
                          ))}
                        </ul>
                        <p className="text-[10px] text-muted-foreground/70 font-mono mt-3">{a.source}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tab === "videos" && (
          <div className="space-y-3">
            {ADHD_RESOURCES.videos.map(v => (
              <a key={v.title} href={v.url} target="_blank" rel="noopener noreferrer"
                className="block bg-card border border-border rounded-xl px-4 py-4 transition-all hover:border-primary/40 hover:shadow-md active:bg-muted/40">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-semibold text-foreground leading-snug">{v.title}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-mono flex-shrink-0">{v.tag}</span>
                </div>
                <p className="text-xs text-foreground/70 mb-2 leading-relaxed">{v.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-muted-foreground/70 font-mono">{v.creator}</p>
                    <span className="text-muted-foreground/40">·</span>
                    <p className="text-[10px] text-muted-foreground/70 font-mono">{v.duration}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary"><ExternalLink size={12} /> Watch</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {tab === "books" && (
          <div className="space-y-3">
            {ADHD_RESOURCES.books.map(b => (
              <div key={b.title} className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
                <a href={b.url} target="_blank" rel="noopener noreferrer" className="block px-4 py-4 active:bg-muted/40 transition-colors">
                  <p className="text-sm font-semibold text-foreground mb-0.5">{b.title}</p>
                  <p className="text-[10px] text-muted-foreground/70 font-mono mb-1.5">{b.author}</p>
                  <p className="text-xs text-foreground/70 leading-relaxed mb-2">{b.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary"><ExternalLink size={12} /> Find this book</span>
                </a>
                <div className="px-4 pb-3"><CopyTitleButton title={b.title} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── When To Use View ──────────────────────────────────────────────────────────

function WhenToUseView({ onBack }: { onBack: () => void }) {
  const { lang, t } = useLang()
  const moments = lang === "id" ? [
    { emoji: "😵", title: "Kamu terjebak dan tidak tahu harus mulai dari mana", body: "Ketika segalanya terasa luar biasa dan kamu tidak bisa memilih langkah pertama, check-in membantu app mengidentifikasi kondisimu dan memberimu tindakan awal yang konkret." },
    { emoji: "🌀", title: "Otakmu terasa berantakan atau berkabut", body: "Pikiran berlari, tidak bisa fokus, melompat-lompat antartab — check-in 2 menit memotong keributan dan menampilkan satu strategi yang paling mungkin membantu sekarang." },
    { emoji: "📉", title: "Energi atau suasana hatimu berubah tiba-tiba", body: "Menyadari kamu jadi datar, mudah tersinggung, atau cemas di tengah hari? Check-in untuk memahami mengapa, dan dapatkan strategi reset yang sesuai dengan penurunan itu." },
    { emoji: "⏰", title: "Sebelum tugas yang biasanya menggagalkanmu", body: "Proyek besar? Rapat yang kamu takuti? Check-in cepat sebelumnya mempersiapkanmu dengan alat fokus yang tepat sebelum gesekan bahkan dimulai." },
    { emoji: "🌙", title: "Pada waktu jangkar harian yang rutin", body: "Pagi, makan siang, atau akhir hari — check-in yang konsisten membangun gambaran polamu dari waktu ke waktu, membuat rekomendasi semakin cerdas semakin sering kamu menggunakannya." },
    { emoji: "🔁", title: "Ketika kamu sudah mencoba tapi terhenti", body: "Sudah duduk untuk bekerja, tidak bisa mulai, lalu pergi? Kembalilah dan check-in. Terkadang menamai kondisi adalah satu-satunya hal yang membuatmu bisa bergerak lagi." },
  ] : [
    { emoji: "😵", title: "You're stuck and don't know where to start", body: "When everything feels overwhelming and you can't pick a first step, a check-in helps the app identify your state and give you a concrete starting action." },
    { emoji: "🌀", title: "Your brain feels scattered or foggy", body: "Racing thoughts, can't focus, jumping between tabs — a 2-minute check-in cuts through the noise and surfaces the one strategy most likely to help right now." },
    { emoji: "📉", title: "Your energy or mood has shifted unexpectedly", body: "Notice you've gone flat, irritable, or anxious mid-day? Check in to understand why, and get a reset strategy matched to that specific dip." },
    { emoji: "⏰", title: "Before a task that usually derails you", body: "Big project? Meeting you're dreading? A quick check-in beforehand primes you with the right focus tools before the friction even starts." },
    { emoji: "🌙", title: "At a regular daily anchor time", body: "Morning, lunch, or end-of-day — consistent check-ins build a picture of your patterns over time, making the recommendations smarter the more you use it." },
    { emoji: "🔁", title: "When you've already tried and stalled", body: "Sat down to work, couldn't start, walked away? Come back and check in. Sometimes naming the state is the only thing that gets you unstuck." },
  ]
  return (
    <div className="min-h-screen bg-background pb-10 max-w-md mx-auto">
      <div className="px-5 pt-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 hover:text-foreground transition-colors">
          <ChevronLeft size={16} /> {t("Back", "Kembali")}
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
            <Sparkles size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-serif text-foreground">{t("When to use this app", "Kapan menggunakan app ini")}</h1>
            <p className="text-xs text-foreground/60">{t("Best moments to check in with yourself", "Waktu terbaik untuk check-in dengan dirimu")}</p>
          </div>
        </div>
        <div className="space-y-3">
          {moments.map(({ emoji, title, body }) => (
            <div key={title} className="bg-card border border-border rounded-xl px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-foreground/50 text-center mt-6 leading-relaxed">
          {t("There's no wrong time to check in. Even one a day builds meaningful self-awareness over time.", "Tidak ada waktu yang salah untuk check-in. Bahkan satu kali sehari membangun kesadaran diri yang bermakna dari waktu ke waktu.")}
        </p>
      </div>
    </div>
  )
}

// ── How It Works View ─────────────────────────────────────────────────────────

function HowItWorksView({ onBack }: { onBack: () => void }) {
  const { lang, t } = useLang()
  const sections = lang === "id" ? [
    { icon: Brain, title: "Ilmu di balik check-in", body: "Setiap check-in menangkap 15 variabel: energi, suasana hati, tidur, fokus, motivasi, stres, kelelahan, kantuk, beban kerja, kesulitan tugas, aktivitas saat ini, dan perasaan terhadap aktivitas. Ini diproses melalui sistem penilaian berbobot yang mendeteksi 8 kondisi kognitif berbeda yang masing-masing memerlukan strategi intervensi yang berbeda." },
    { icon: Target, title: "Bagaimana kondisi terdeteksi", body: "Mesin deteksi menilai inputmu terhadap 8 kondisi kognitif ADHD: Beban Kognitif, Defisit Motivasi, Hyperfocus Produktif, Hyperfocus Tidak Produktif, Kegagalan Perhatian Akibat Kelelahan, Disregulasi Emosi, Disfungsi Eksekutif atau Kelumpuhan Inisiasi, dan Seimbang. Tujuh profil pertama dinilai, lalu profil dengan skor tertinggi dipilih. Jika tidak ada profil yang melebihi ambang batas, kamu diklasifikasikan sebagai Seimbang." },
    { icon: BookOpen, title: "Dari mana rekomendasi berasal", body: "Setiap rekomendasi diambil dari penelitian klinis yang telah ditinjau sejawat: Terapi Perilaku Kognitif untuk ADHD Dewasa (Solanto, 2022), Terapi Kognitif Berbasis Kesadaran (Zylowska, 2008), teknik regulasi emosi DBT (Ramsay & Rostain, 2015), dan penelitian neurosains oleh Barkley, Brown, Ratey, dan Posner." },
    { icon: Shield, title: "Privasimu", body: "Semua data — check-in, profil, hasil kuis, dan riwayat — disimpan secara eksklusif di localStorage browser-mu. Tidak ada yang dikirimkan ke mana pun. Tidak ada akun di cloud. Menghapus akunmu menghapus segalanya secara permanen." },
    { icon: AlertCircle, title: "Apa yang bukan app ini", body: "Recomood adalah alat manajemen diri dan psikoedukasi. Ini bukan instrumen diagnostik, perawatan medis, atau layanan klinis. Ini tidak menggantikan diagnosis profesional, terapi, atau manajemen pengobatan. Jika kamu dalam kesusahan, silakan hubungi profesional kesehatan mental." },
    { icon: Award, title: "Mengapa kami mempercayai penelitian", body: "Kami hanya menyertakan strategi yang diuji dalam uji coba terkontrol acak atau tinjauan sistematis dengan populasi ADHD, dan kami mengutip setiap sumber dalam detail rekomendasi agar kamu bisa memverifikasinya sendiri." },
  ] : [
    { icon: Brain, title: "The science behind check-ins", body: "Each check-in captures 15 variables across energy, mood, sleep, focus, motivation, stress, fatigue, sleepiness, workload, task difficulty, current activity, and activity feelings. These are processed through a weighted scoring system detecting 8 distinct cognitive states that each require different intervention strategies." },
    { icon: Target, title: "How states are detected", body: "The detection engine identifies 8 ADHD cognitive states: Cognitive Overload, Motivation Deficit, Productive Hyperfocus, Unproductive Hyperfocus, Fatigue-Induced Attention Failure, Emotional Dysregulation, Executive Dysfunction or Initiation Paralysis, and Balanced. The first seven profiles are scored and the highest-scoring profile is selected. If no profile exceeds the threshold, you're classified as Balanced." },
    { icon: BookOpen, title: "Where recommendations come from", body: "Every recommendation is drawn from peer-reviewed clinical research: Cognitive Behavioral Therapy for Adult ADHD (Solanto, 2022), Mindfulness-Based Cognitive Therapy (Zylowska, 2008), Dialectical Behavior Therapy emotion regulation techniques (Ramsay & Rostain, 2015), and neuroscience research by Barkley, Brown, Ratey, and Posner." },
    { icon: Shield, title: "Your privacy", body: "All data — check-ins, profile, quiz results, and history — is stored exclusively in your browser's localStorage. Nothing is transmitted anywhere. There is no account in the cloud. Deleting your account removes everything permanently." },
    { icon: AlertCircle, title: "What this app is not", body: "Recomood is a self-management and psychoeducation tool. It is not a diagnostic instrument, medical treatment, or clinical service. It does not replace professional diagnosis, therapy, or medication management. If you are in distress, please contact a mental health professional." },
    { icon: Award, title: "Why we trust the research", body: "We only include strategies tested in randomized controlled trials or systematic reviews with ADHD populations, and we cite each source within the recommendation detail so you can verify it yourself." },
  ]

  return (
    <div className="min-h-screen bg-background pb-10 max-w-md mx-auto">
      <div className="px-5 pt-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 hover:text-foreground transition-colors">
          <ChevronLeft size={16} /> {t("Back", "Kembali")}
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Shield size={18} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-serif text-foreground">{t("How Recomood works", "Cara kerja Recomood")}</h1>
            <p className="text-xs text-muted-foreground">{t("Science, trust, and transparency", "Sains, kepercayaan, dan transparansi")}</p>
          </div>
        </div>
        <div className="space-y-3">
          {sections.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-card border border-border rounded-xl px-4 py-4">
              <div className="flex items-center gap-2.5 mb-2">
                <Icon size={15} className="text-primary flex-shrink-0" />
                <p className="text-sm font-semibold text-foreground">{title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-primary/6 border border-primary/15 rounded-xl px-4 py-4">
          <p className="text-xs text-foreground font-semibold mb-2">{t("Research sources", "Sumber penelitian")}</p>
          <div className="space-y-1">
            {["Barkley, R.A. (2012). Executive Functions. Guilford Press.", "Brown, T.E. (2013). A New Understanding of ADHD. Routledge.", "Solanto, M.V. (2022). CBT for Adult ADHD. Guilford Press.", "Zylowska, L. (2008). The Mindfulness Prescription. Trumpeter.", "Ramsay & Rostain (2015). CBT for Adult ADHD. Routledge.", "Ratey, J.J. (2008). Spark. Little, Brown."].map(ref => (
              <p key={ref} className="text-[10px] text-muted-foreground font-mono leading-relaxed">{ref}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Satisfaction View ─────────────────────────────────────────────────────────

function SatisfactionView({ user, onBack }: { user: AppUser; onBack: () => void }) {
  const { lang, t } = useLang()
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState("")
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const past = STORE.satisfaction()

  function submit() {
    if (!rating) return
    const entry: SatisfactionEntry = { id: Date.now().toString(), date: new Date().toISOString(), rating, comment, category }
    STORE.setSatisfaction([...past, entry])
    API.addSatisfaction(user.id, entry).catch(() => {})
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 max-w-md mx-auto text-center">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <ThumbsUp size={24} className="text-primary" />
      </div>
      <h2 className="text-xl font-serif text-foreground mb-2">{t("Thank you!", "Terima kasih!")}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t("Your feedback helps make Recomood better for everyone with ADHD.", "Masukan kamu membantu membuat Recomood lebih baik untuk semua orang dengan ADHD.")}</p>
      <button onClick={onBack} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
        {t("Back to profile", "Kembali ke profil")}
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-10 max-w-md mx-auto">
      <div className="px-5 pt-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 hover:text-foreground transition-colors">
          <ChevronLeft size={16} /> {t("Back", "Kembali")}
        </button>
        <h1 className="text-2xl font-serif text-foreground mb-1">{t("Share your feedback", "Bagikan masukanmu")}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t("Your experience matters. Tell us what's working and what's not.", "Pengalamanmu berarti. Ceritakan apa yang berjalan baik dan apa yang tidak.")}</p>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">{t("Overall rating", "Penilaian keseluruhan")}</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">{t("What's this about?", "Ini tentang apa?")}</p>
            <div className="flex flex-wrap gap-2">
              {(lang === "id"
                ? ["Check-in", "Rekomendasi", "Kuis", "Dasbor", "Desain app", "Hal lain"]
                : ["Check-ins", "Recommendations", "Quiz", "Dashboard", "App design", "Something else"]
              ).map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${category === cat ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">{t("Tell us more", "Ceritakan lebih lanjut")} <span className="text-muted-foreground font-normal">({t("optional", "opsional")})</span></p>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
              placeholder={t("What could be improved? What do you love? What's missing?", "Apa yang bisa ditingkatkan? Apa yang kamu suka? Apa yang kurang?")}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors resize-none" />
          </div>
          <button onClick={submit} disabled={!rating}
            className={`w-full h-12 rounded-xl text-sm font-medium transition-all ${rating ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
            {t("Submit feedback", "Kirim masukan")}
          </button>
        </div>

        {past.length > 0 && (
          <div className="mt-8">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">{t(`Previous feedback (${past.length})`, `Masukan sebelumnya (${past.length})`)}</p>
            <div className="space-y-2">
              {past.slice().reverse().slice(0, 3).map(entry => (
                <div key={entry.id} className="bg-card border border-border rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(n => <Star key={n} size={12} className={n <= entry.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground"} />)}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">{new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                  {entry.comment && <p className="text-xs text-muted-foreground leading-relaxed">{entry.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Edit Profile View ─────────────────────────────────────────────────────────

function EditProfileView({ user, onSave, onBack }: { user: AppUser; onSave: (u: AppUser) => void; onBack: () => void }) {
  const { lang, t } = useLang()
  const p = user.profile
  const [name, setName] = useState(p?.name || user.name)
  const [gender, setGender] = useState(p?.gender || "")
  const [age, setAge] = useState(p?.age || "")
  const [peakTime, setPeakTime] = useState(p?.peakTime || "")
  const [adhdKnowledge, setAdhdKnowledge] = useState(p?.adhdKnowledge || "")
  const [avatar, setAvatar] = useState(user.avatar || "🧠")
  const [saved, setSaved] = useState(false)

  function save() {
    const updatedProfile: OnboardingProfile = {
      ...(p || { diagnosis: "", busyness: "", timeLoss: "", workDistraction: "", moodShifts: null, strengths: [], coConditions: [] }),
      name, gender, age, peakTime, adhdKnowledge,
    }
    const updated: AppUser = { ...user, name, avatar, profile: updatedProfile }
    STORE.updateUser(updated)
    onSave(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background pb-10 max-w-md mx-auto">
      <div className="px-5 pt-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 hover:text-foreground transition-colors">
          <ChevronLeft size={16} /> {t("Back", "Kembali")}
        </button>
        <h1 className="text-2xl font-serif text-foreground mb-5">{t("Edit profile", "Edit profil")}</h1>

        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-foreground mb-3">{t("Profile avatar", "Avatar profil")}</p>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_OPTS.map(em => (
              <button key={em} onClick={() => setAvatar(em)}
                className={`h-10 w-10 rounded-xl text-xl flex items-center justify-center transition-all ${avatar === em ? "bg-primary/10 ring-2 ring-primary" : "bg-muted hover:bg-secondary"}`}>
                {em}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl px-4 py-3.5 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{t("Total check-ins", "Total check-in")}</p>
            <p className="text-xl font-semibold text-foreground">{STORE.sessions().length}</p>
          </div>
          <Activity size={20} className="text-muted-foreground" />
        </div>

        <div className="space-y-4 mb-5">
          <div>
            <p className="text-sm font-medium text-foreground mb-1.5">{t("Display name", "Nama tampilan")}</p>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-1.5">{t("Biological sex", "Jenis kelamin biologis")}</p>
            <div className="grid grid-cols-2 gap-2">
              {(lang === "id"
                ? ["Laki-laki", "Perempuan", "Interseks", "Tidak ingin menyebutkan"]
                : ["Male", "Female", "Intersex", "Prefer not to say"]
              ).map((opt, i) => {
                const val = ["Male", "Female", "Intersex", "Prefer not to say"][i]
                return <OptionButton key={val} selected={gender === val} onClick={() => setGender(val)}>{opt}</OptionButton>
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-1.5">{t("Age range", "Rentang usia")}</p>
            <div className="grid grid-cols-2 gap-2">
              {(lang === "id"
                ? ["Di bawah 18", "18–24", "25–34", "35–44", "45–54", "55+"]
                : ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"]
              ).map((opt, i) => {
                const val = ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"][i]
                return <OptionButton key={val} selected={age === val} onClick={() => setAge(val)}>{opt}</OptionButton>
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-1.5">{t("Peak focus time", "Waktu fokus terbaik")}</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "morning", label: lang === "id" ? "🌅 Pagi" : "🌅 Morning" },
                { id: "afternoon", label: lang === "id" ? "☀️ Siang" : "☀️ Afternoon" },
                { id: "evening", label: lang === "id" ? "🌙 Malam" : "🌙 Evening" },
                { id: "varies", label: lang === "id" ? "🔀 Bervariasi" : "🔀 Varies" },
              ].map(opt => (
                <OptionButton key={opt.id} selected={peakTime === opt.id} onClick={() => setPeakTime(opt.id)}>{opt.label}</OptionButton>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-1.5">{t("ADHD knowledge level", "Tingkat pengetahuan ADHD")}</p>
            <div className="space-y-1.5">
              {(lang === "id" ? [
                "Saya tahu sangat sedikit tentang ADHD",
                "Saya tahu dasarnya, tapi hanya itu",
                "Saya memiliki pemahaman yang baik",
                "Saya ahli dalam semua hal tentang ADHD",
              ] : [
                "I know very little about ADHD",
                "I know the basics, but that's about it",
                "I have a good understanding",
                "I'm an expert in all things ADHD",
              ]).map((opt, i) => {
                const val = ["I know very little about ADHD", "I know the basics, but that's about it", "I have a good understanding", "I'm an expert in all things ADHD"][i]
                return <OptionButton key={val} selected={adhdKnowledge === val} onClick={() => setAdhdKnowledge(val)}>{opt}</OptionButton>
              })}
            </div>
          </div>
        </div>

        <button onClick={save}
          className={`w-full h-12 rounded-xl text-sm font-medium transition-all ${saved ? "bg-primary/70 text-primary-foreground" : "bg-primary text-primary-foreground hover:opacity-90"}`}>
          {saved ? `✓ ${t("Saved!", "Tersimpan!")}` : t("Save changes", "Simpan perubahan")}
        </button>
      </div>
    </div>
  )
}

// ── Reminders View ────────────────────────────────────────────────────────────

function RemindersView({ onBack, userId }: { onBack: () => void; userId?: string }) {
  const { lang, t } = useLang()
  const [prefs, setPrefs] = useState<ReminderPrefs>(() => {
    const stored = STORE.reminders()
    const defaults: ReminderPrefs = { enabled: false, days: ["Mon","Wed","Fri"], cadence: "weekly", timesPerDay: 1, time1: "09:00", time1Period: "AM", time2: "03:00", time2Period: "PM" }
    return { ...defaults, ...stored, days: stored.days ?? defaults.days }
  })
  const [saved, setSaved] = useState(false)

  function save(next: ReminderPrefs) {
    setPrefs(next)
    STORE.setReminders(next)
    if (userId) API.saveReminders(userId, next).catch(() => {})
    API.authUpdateMeta({ reminders: next }).catch(() => {})
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
    if (next.enabled && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {})
    }
  }

  const ALL_DAYS = lang === "id"
    ? ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const ALL_DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  function toggleDay(dayIdx: number) {
    const enDay = ALL_DAYS_EN[dayIdx]
    const days = prefs.days.includes(enDay) ? prefs.days.filter(d => d !== enDay) : [...prefs.days, enDay]
    save({ ...prefs, days })
  }

  function TimeRow({ timeKey, periodKey }: { timeKey: "time1" | "time2"; periodKey: "time1Period" | "time2Period" }) {
    const label = timeKey === "time1" ? t("First reminder", "Pengingat pertama") : t("Second reminder", "Pengingat kedua")
    return (
      <div>
        <p className="text-xs text-muted-foreground mb-2">{label}</p>
        <div className="flex gap-2">
          <input
            type="time"
            value={prefs[timeKey]}
            onChange={e => save({ ...prefs, [timeKey]: e.target.value })}
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
          <div className="flex rounded-xl border border-border overflow-hidden">
            {(["AM", "PM"] as const).map(p => (
              <button key={p} onClick={() => save({ ...prefs, [periodKey]: p })}
                className={`px-3 py-2.5 text-sm font-medium transition-colors ${prefs[periodKey] === p ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-10 max-w-md mx-auto">
      <div className="px-5 pt-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5 hover:text-foreground transition-colors">
          <ChevronLeft size={16} /> {t("Back", "Kembali")}
        </button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
            <Bell size={18} className="text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-serif text-foreground">{t("Check-in reminders", "Pengingat check-in")}</h1>
            <p className="text-xs text-foreground/60">{t("Gentle nudges to check in with yourself", "Dorongan lembut untuk check-in dengan dirimu")}</p>
          </div>
        </div>

        {/* Enable toggle */}
        <div className="bg-card border border-border rounded-xl px-4 py-4 flex items-center justify-between mt-5 mb-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{t("Enable reminders", "Aktifkan pengingat")}</p>
            <p className="text-xs text-foreground/60 mt-0.5">{t("Get a nudge to complete a check-in", "Dapatkan dorongan untuk menyelesaikan check-in")}</p>
          </div>
          <button onClick={() => save({ ...prefs, enabled: !prefs.enabled })}
            className={`w-12 h-7 rounded-full transition-colors relative ${prefs.enabled ? "bg-primary" : "bg-muted"}`}>
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${prefs.enabled ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <div className={`space-y-4 transition-opacity ${prefs.enabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>

          {/* Days of week */}
          <div className="bg-card border border-border rounded-xl px-4 py-4">
            <p className="text-sm font-semibold text-foreground mb-3">{t("Reminder days", "Hari pengingat")}</p>
            <div className="grid grid-cols-7 gap-1.5">
              {ALL_DAYS.map((day, idx) => (
                <button key={day} onClick={() => toggleDay(idx)}
                  className={`py-2 rounded-lg text-xs font-medium transition-all ${prefs.days.includes(ALL_DAYS_EN[idx]) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
                  {day}
                </button>
              ))}
            </div>
            {prefs.days.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">{t("Pick at least one day.", "Pilih setidaknya satu hari.")}</p>
            )}
          </div>

          {/* Cadence */}
          <div className="bg-card border border-border rounded-xl px-4 py-4">
            <p className="text-sm font-semibold text-foreground mb-3">{t("Cadence", "Frekuensi")}</p>
            <div className="grid grid-cols-2 gap-2">
              {(["weekly", "biweekly"] as const).map((id) => {
                const label = id === "weekly" ? t("Weekly", "Mingguan") : t("Bi-weekly", "Dua mingguan")
                return (
                <button key={id} onClick={() => save({ ...prefs, cadence: id })}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${prefs.cadence === id ? "border-primary bg-primary/8 text-primary" : "border-border bg-background text-foreground hover:border-primary/40"}`}>
                  {label}
                </button>
                )
              })}
            </div>
            {prefs.cadence === "biweekly" && (
              <p className="text-xs text-muted-foreground mt-2">{t("You'll be reminded on your chosen days every other week.", "Kamu akan diingatkan pada hari yang dipilih setiap dua minggu.")}</p>
            )}
          </div>

          {/* Times per day */}
          <div className="bg-card border border-border rounded-xl px-4 py-4">
            <p className="text-sm font-semibold text-foreground mb-3">{t("Times per day", "Berapa kali per hari")}</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {([1, 2] as const).map(n => (
                <button key={n} onClick={() => save({ ...prefs, timesPerDay: n })}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${prefs.timesPerDay === n ? "border-primary bg-primary/8 text-primary" : "border-border bg-background text-foreground hover:border-primary/40"}`}>
                  {n === 1 ? t("Once", "Sekali") : t("Twice", "Dua kali")}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <TimeRow timeKey="time1" periodKey="time1Period" />
              {prefs.timesPerDay === 2 && <TimeRow timeKey="time2" periodKey="time2Period" />}
            </div>
          </div>
        </div>

        {saved && (
          <div className="mt-4 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-primary" />
            <p className="text-sm text-foreground">{t("Reminder settings saved.", "Pengaturan pengingat tersimpan.")}</p>
          </div>
        )}

        <p className="text-xs text-foreground/50 text-center mt-6 leading-relaxed">
          {t("Reminders use your browser's notifications. Keep this app open in a tab or add it to your home screen to receive them.", "Pengingat menggunakan notifikasi browser-mu. Biarkan app ini terbuka di tab atau tambahkan ke layar beranda untuk menerimanya.")}
        </p>
      </div>
    </div>
  )
}

// ── Settings View ─────────────────────────────────────────────────────────────

function SettingsView({ user, onLogout, onDeleteAccount, onSetView, onUserUpdated }: {
  user: AppUser; onLogout: () => void; onDeleteAccount: () => void
  onSetView: (v: View) => void; onUserUpdated: (u: AppUser) => void
}) {
  const { t } = useLang()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const totalCheckins = STORE.sessions().length
  const streak = calcStreak(STORE.sessions())

  function handleDelete() {
    const users = STORE.users().filter(u => u.id !== user.id)
    STORE.setUsers(users)
    STORE.setCurrentUser(null)
    localStorage.removeItem("adhd_sessions")
    API.deleteAccount(user.id, user.email).catch(() => {})
    onDeleteAccount()
  }

  const navItems = [
    { icon: Edit3, label: t("Edit profile", "Edit profil"), desc: t("Name, avatar, age, focus time", "Nama, avatar, usia, waktu fokus"), action: () => onSetView("edit-profile") },
    { icon: History, label: t("Check-in history", "Riwayat check-in"), desc: t("Reopen any past report", "Buka laporan sebelumnya"), action: () => onSetView("history") },
    { icon: Bell, label: t("Reminders", "Pengingat"), desc: t("Schedule check-in nudges", "Atur jadwal pengingat check-in"), action: () => onSetView("reminders") },
    { icon: MessageSquare, label: t("Share feedback", "Kirim masukan"), desc: t("Tell us what you think", "Beritahu kami pendapatmu"), action: () => onSetView("satisfaction") },
  ]

  return (
    <div className="min-h-screen bg-background pb-24 max-w-md mx-auto">
      <div className="px-5 pt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl">
            {user.avatar || "🧠"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-serif text-foreground truncate">{user.profile?.name || user.name}</h1>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            {user.profile && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {user.profile.diagnosis?.split(" ").slice(0, 3).join(" ")}
                {user.profile.age ? ` · ${user.profile.age}` : ""}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-card border border-border rounded-xl px-3 py-3 text-center">
            <p className="text-lg font-semibold text-foreground">{totalCheckins}</p>
            <p className="text-[10px] text-muted-foreground">{t("Check-ins", "Check-in")}</p>
          </div>
          <div className="bg-card border border-border rounded-xl px-3 py-3 text-center">
            <p className="text-lg font-semibold text-foreground">{streak}🔥</p>
            <p className="text-[10px] text-muted-foreground">{t("Day streak", "Hari beruntun")}</p>
          </div>
          <div className="bg-card border border-border rounded-xl px-3 py-3 text-center">
            <p className="text-lg font-semibold text-foreground capitalize">{user.profile?.peakTime || "—"}</p>
            <p className="text-[10px] text-muted-foreground">{t("Peak time", "Waktu puncak")}</p>
          </div>
        </div>

        {user.quizResults && (
          <button onClick={() => onSetView("quiz-results")}
            className="w-full bg-card border border-border rounded-xl px-4 py-3.5 flex items-center justify-between mb-4 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Brain size={15} className="text-accent" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">ADHD Trait Profile</p>
                <p className="text-xs text-muted-foreground">{user.quizResults.score}% · {user.quizResults.level === "very-high" ? "Very High" : user.quizResults.level.charAt(0).toUpperCase() + user.quizResults.level.slice(1)} traits</p>
              </div>
            </div>
            <ChevronRight size={15} className="text-muted-foreground" />
          </button>
        )}

        <div className="space-y-2 mb-5">
          {navItems.map(({ icon: Icon, label, desc, action }) => (
            <button key={label} onClick={action}
              className="w-full flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5 hover:border-primary/30 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl px-4 py-3.5 flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🌐</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t("Language", "Bahasa")}</p>
              <p className="text-xs text-muted-foreground">{t("Switch app language", "Ganti bahasa aplikasi")}</p>
            </div>
          </div>
          <LangToggle />
        </div>

        <div className="space-y-2.5">
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
            <LogOut size={15} className="text-muted-foreground" />
            <span className="text-sm text-foreground">{t("Log out", "Keluar")}</span>
          </button>

          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/8 transition-colors">
              <Trash2 size={15} className="text-destructive" />
              <span className="text-sm text-destructive">{t("Delete account & all data", "Hapus akun & semua data")}</span>
            </button>
          ) : (
            <div className="bg-destructive/8 border border-destructive/20 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-destructive leading-relaxed">{t("This will permanently delete your account, all check-ins, and all data. This cannot be undone.", "Ini akan menghapus akunmu, semua check-in, dan semua data secara permanen. Tindakan ini tidak dapat dibatalkan.")}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors">
                  {t("Cancel", "Batal")}
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-lg bg-destructive text-white text-sm font-medium hover:opacity-90 transition-opacity">
                  {t("Yes, delete everything", "Ya, hapus semuanya")}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          {t("All data stored locally on your device. Nothing shared.", "Semua data tersimpan di perangkatmu. Tidak ada yang dibagikan.")}
        </p>
      </div>
      <BottomNav active="settings" onChange={onSetView} />
    </div>
  )
}

// ── Pattern-Based Recommendation Engine ───────────────────────────────────────
// Scores each rec for a state against the user's history, then returns the top 3.
// Factors: past feedback ratings, recent overuse, time-of-day vs peak focus time,
// and current activity (used to surface the scrolling-redirect rec when relevant).
function selectPersonalizedRecs(
  state: CognitiveState,
  allSessions: Session[],
  profile: OnboardingProfile | null,
  quizResults: QuizResults | null,
  checkIn: CheckInData | null = null
): Rec[] {
  const pool = STATE_RECS[state]
  if (!pool?.length) return []

  // Last 10 sessions with this same cognitive state
  const stateSessions = allSessions.filter(s => s.cognitiveState === state).slice(-10)
  const lastSession = allSessions[allSessions.length - 1]
  const hour = new Date().getHours()

  // Is current time within the user's self-reported peak focus window?
  const peak = profile?.peakTime
  const inPeakWindow =
    peak === "morning" ? hour < 12 :
    peak === "afternoon" ? hour >= 12 && hour < 17 :
    peak === "evening" ? hour >= 17 : true

  // Count how many times each rec has been rated 1★ across ALL sessions (any state).
  const globalOneStar: Record<string, number> = {}
  allSessions.forEach(s => {
    Object.entries(s.feedback ?? {}).forEach(([id, rating]) => {
      if (rating === 1) globalOneStar[id] = (globalOneStar[id] ?? 0) + 1
    })
  })

  const scored = pool.map(rec => {
    let score = 100
    let tried = false

    // Quiz-based pre-filtering — suppress recs that the quiz says won't work.
    if (quizResults) {
      // Power nap: suppress if user can't sleep or always oversleeps
      if (rec.id === "ff-nap" && (quizResults.powerNap === "cantSleep" || quizResults.powerNap === "oversleep")) {
        score -= 200
      }
      // Body doubling recs: boost if it works, suppress if not
      if (rec.id === "body-double" || rec.id === "virtual-cowork") {
        if (quizResults.bodyDoubling === false) score -= 200
        else if (quizResults.bodyDoubling === true) score += 40
      }
      // Noise / ambient sound recs
      if (rec.id === "brown-noise" || rec.id === "focus-music") {
        if (quizResults.noisePreference === "silence") score -= 150
        else if (quizResults.noisePreference === "noise") score += 30
      }
      // Exercise / movement recs
      if (rec.category === "Body Reset" && (rec.id === "micro-walk" || rec.id === "movement-break")) {
        if (quizResults.exerciseHelps === false) score -= 100
        else if (quizResults.exerciseHelps === true) score += 30
      }
    }

    // Activity-aware scoring for the scrolling-redirect rec.
    // bal-redirect should only surface when the user is actually scrolling right now —
    // it's irrelevant (and confusing) at any other time.
    if (rec.id === "bal-redirect") {
      if (checkIn?.currentActivity === "scrolling") score += 150  // guarantee it surfaces
      else score -= 200                                            // hide it entirely
    }

    // Global 1-star suppression: 3+ one-star ratings across all sessions → bury it.
    if ((globalOneStar[rec.id] ?? 0) >= 3) score -= 200

    // Feedback history: reward high ratings, suppress low ones
    stateSessions.forEach(s => {
      const fb = s.feedback?.[rec.id]
      if (fb === undefined) return
      tried = true
      if (fb >= 4) score += 25        // worked well → strongly prefer
      else if (fb === 3) score += 5   // neutral
      else if (fb <= 2) score -= 40   // didn't help → suppress significantly
    })

    // Explicit "didn't work multiple times in a row" rule.
    // Walk this state's sessions newest-first and count the unbroken streak of
    // low ratings (≤2) for this rec. A rec that has failed the last 2+ times it
    // was rated gets pushed to the bottom so a genuinely different strategy
    // surfaces instead. A single 4-5★ anywhere in the streak breaks it.
    let failStreak = 0
    for (let i = stateSessions.length - 1; i >= 0; i--) {
      const fb = stateSessions[i].feedback?.[rec.id]
      if (fb === undefined) continue          // not rated that session → skip, keep looking
      if (fb <= 2) failStreak++
      else break                               // a neutral/positive rating breaks the streak
    }
    if (failStreak >= 2) score -= 60 + (failStreak - 2) * 25  // repeated failures → strongly avoid

    // Encourage variety: gently boost strategies the user has never tried for this state.
    if (!tried) score += 8

    // Slight penalty for being in the most recent session (avoid back-to-back repeats)
    if (lastSession?.recIds?.includes(rec.id)) score -= 20

    // Off-peak hours: prefer restorative/lighter recs over demanding task strategies
    if (!inPeakWindow) {
      if (rec.category === "Task Strategy") score -= 12
      if (rec.category === "Body Reset" || rec.category === "Anxiety Relief") score += 10
    }

    return { rec, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.rec)
}

// ── Scroll Hint ───────────────────────────────────────────────────────────────

function ScrollHint({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    function check() {
      if (!el) return
      const scrollable = el.scrollHeight > el.clientHeight + 10
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 48
      setShow(scrollable && !atBottom)
    }
    check()
    el.addEventListener("scroll", check, { passive: true })
    window.addEventListener("resize", check, { passive: true })
    return () => {
      el.removeEventListener("scroll", check)
      window.removeEventListener("resize", check)
    }
  }, [containerRef])

  return (
    <div className={`pointer-events-none fixed bottom-24 left-0 right-0 flex justify-center z-50 transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}>
      <motion.div
        animate={show ? { y: [0, 5, 0] } : {}}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        className="flex flex-col items-center gap-0.5"
      >
        <ChevronDown size={18} className="text-foreground/30" />
        <ChevronDown size={14} className="text-foreground/15 -mt-2.5" />
      </motion.div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("adhd_lang") as Lang) ?? "en")
  function setLang(l: Lang) { setLangState(l); localStorage.setItem("adhd_lang", l) }

  const [user, setUser] = useState<AppUser | null>(() => STORE.currentUser())
  const [view, setView] = useState<View>(() => {
    const u = STORE.currentUser()
    if (!u) return STORE.splashSeen() ? "login" : "splash"
    if (!u.onboardingDone) return "onboarding"
    return "journey"
  })
  const [checkInData, setCheckInData] = useState<CheckInData>(INITIAL_CHECKIN)
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>("balanced")
  const [activeRecs, setActiveRecs] = useState<Rec[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null)
  const [pastSession, setPastSession] = useState<Session | null>(null)

  // On mount: restore Supabase Auth session even if localStorage was cleared
  useEffect(() => {
    API.authGetSession().then(({ data: { session } }) => {
      if (!session?.user) return
      const authUser = session.user
      const meta = authUser.user_metadata ?? {}
      const localUser = STORE.currentUser()

      if (!localUser) {
        // localStorage was cleared — restore from Supabase Auth metadata
        const restored: AppUser = {
          id: authUser.id,
          email: authUser.email!,
          name: meta.name ?? authUser.email!.split("@")[0],
          password: "",
          createdAt: authUser.created_at ?? new Date().toISOString(),
          onboardingDone: meta.onboardingDone ?? false,
          quizDone: meta.quizDone ?? false,
          profile: meta.profile ?? null,
          quizResults: meta.quizResults ?? null,
          avatar: meta.avatar ?? "🧠",
        }
        STORE.updateUser(restored)
        if (Array.isArray(meta.sessions) && meta.sessions.length) STORE.setSessions(meta.sessions)
        if (meta.reminders) STORE.setReminders(meta.reminders)
        setUser(restored)
        setView(restored.onboardingDone ? "journey" : "onboarding")
      }
    }).catch(() => {})
  }, [])

  // Push user data to Supabase Auth metadata so it can be restored after localStorage loss
  function syncMeta(u: AppUser, sessions?: unknown[], reminders?: unknown) {
    const payload: Record<string, unknown> = {
      name: u.name,
      avatar: u.avatar,
      onboardingDone: u.onboardingDone,
      quizDone: u.quizDone,
      profile: u.profile,
      quizResults: u.quizResults,
    }
    if (sessions !== undefined) payload.sessions = sessions.slice(-50) // keep last 50
    if (reminders !== undefined) payload.reminders = reminders
    API.authUpdateMeta(payload).catch(() => {})
  }

  useEffect(() => {
    if (view === "processing") {
      const state = detectCognitiveState(checkInData)
      const allSessions = STORE.sessions()
      const recs = selectPersonalizedRecs(state, allSessions, user?.profile ?? null, user?.quizResults ?? null, checkInData)
      setCognitiveState(state)
      setActiveRecs(recs)
      const session: Session = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        time: new Date().toISOString(),
        checkIn: checkInData,
        cognitiveState: state,
        recIds: recs.map(r => r.id),
        feedback: {},
      }
      addSession(session, user?.id)
      setCurrentSessionId(session.id)
      const t = setTimeout(() => setView("recommendations"), 2600)
      return () => clearTimeout(t)
    }
  }, [view])

  function handleLogin(u: AppUser) {
    setUser(u)
    setView(u.onboardingDone ? "journey" : "onboarding")
  }

  function handleOnboardingComplete(profile: OnboardingProfile) {
    if (!user) return
    const updated = { ...user, onboardingDone: true, name: profile.name, profile }
    STORE.updateUser(updated)
    syncMeta(updated)
    setUser(updated)
    setView("journey")
  }

  function handleQuizResults(r: QuizResults) {
    setQuizResults(r)
    if (user) {
      const updated = { ...user, quizDone: true, quizResults: r }
      STORE.updateUser(updated)
      syncMeta(updated)
      setUser(updated)
    }
    setView("quiz-results")
  }

  function handleRecsDone(fb: Record<string, number>, notes: string) {
    if (currentSessionId) {
      updateFeedback(currentSessionId, fb, user?.id)
      updateSessionNotes(currentSessionId, notes, user?.id)
    }
    if (user) syncMeta(user, STORE.sessions())
    setView("journey")
  }

  function handleLogout() {
    STORE.setCurrentUser(null)
    setUser(null)
    setView("login")
    API.authSignOut().catch(() => {})
  }
  function handleDeleteAccount() { setUser(null); setView("login") }
  function handleSetView(v: View) { setView(v) }
  function handleUserUpdated(u: AppUser) {
    setUser(u)
    syncMeta(u)
  }

  const scrollRef = useRef<HTMLDivElement>(null)
  const wrap = (children: React.ReactNode) => (
    <LangCtx.Provider value={{ lang, setLang }}>
      <div ref={scrollRef} className="size-full overflow-y-auto">
        {children}
        <ScrollHint containerRef={scrollRef} />
      </div>
    </LangCtx.Provider>
  )

  if (view === "splash") return (
    <LangCtx.Provider value={{ lang, setLang }}>
      <SplashView onContinue={() => { STORE.setSplashSeen(); setView("login") }} />
    </LangCtx.Provider>
  )
  if (view === "login") return wrap(<LoginView onLogin={handleLogin} onCreateAccount={() => setView("create-account")} onSplash={() => setView("splash")} />)
  if (view === "create-account") return wrap(<CreateAccountView onCreated={handleLogin} onBack={() => setView("login")} />)
  if (view === "onboarding" && user) return wrap(<OnboardingView user={user} onComplete={handleOnboardingComplete} />)
  if (view === "journey" && user) return wrap(<JourneyView user={user} onStart={() => { setCheckInData(INITIAL_CHECKIN); setView("checkin") }} onSetView={handleSetView} />)
  if (view === "checkin") return wrap(<CheckInView onComplete={d => { setCheckInData(d); setView("processing") }} onBack={() => setView("journey")} />)
  if (view === "processing") return <div className="size-full"><ProcessingView state={cognitiveState} /></div>
  if (view === "recommendations") return wrap(<RecsView cognitiveState={cognitiveState} recs={activeRecs} onDone={handleRecsDone} />)
  if (view === "quiz" && user) return wrap(<QuizView user={user} onResults={handleQuizResults} onSkip={() => user.quizDone && user.quizResults ? setView("quiz-results") : setView("journey")} onSetView={handleSetView} onSaveExit={() => setView("journey")} />)
  if (view === "quiz-results") {
    const r = quizResults || user?.quizResults
    if (r) return wrap(<QuizResultsView results={r} onContinue={() => { setCheckInData(INITIAL_CHECKIN); setView("checkin") }} onSetView={handleSetView} />)
  }
  if (view === "dashboard" && user) return wrap(<DashboardView user={user} onNewCheckin={() => { setCheckInData(INITIAL_CHECKIN); setView("checkin") }} onSetView={handleSetView} />)
  if (view === "settings" && user) return wrap(<SettingsView user={user} onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} onSetView={handleSetView} onUserUpdated={handleUserUpdated} />)
  if (view === "resources") return wrap(<ResourcesView onBack={() => setView(user ? "journey" : "login")} />)
  if (view === "how-it-works") return wrap(<HowItWorksView onBack={() => setView(user ? "journey" : "login")} />)
  if (view === "when-to-use") return wrap(<WhenToUseView onBack={() => setView(user ? "journey" : "login")} />)
  if (view === "history") return wrap(<HistoryView onBack={() => setView("settings")} onOpen={s => { setPastSession(s); setView("past-report") }} />)
  if (view === "past-report" && pastSession) return wrap(
    <RecsView
      cognitiveState={pastSession.cognitiveState}
      recs={pastSession.recIds.map(findRec).filter(Boolean) as Rec[]}
      initialFeedback={pastSession.feedback}
      initialNotes={pastSession.notes || ""}
      readOnly
      onDone={() => setView("history")}
      onBack={() => setView("history")}
    />
  )
  if (view === "reminders") return wrap(<RemindersView onBack={() => setView("settings")} userId={user?.id} />)
  if (view === "satisfaction" && user) return wrap(<SatisfactionView user={user} onBack={() => setView("settings")} />)
  if (view === "edit-profile" && user) return wrap(<EditProfileView user={user} onSave={u => { handleUserUpdated(u); setView("settings") }} onBack={() => setView("settings")} />)

  return wrap(<LoginView onLogin={handleLogin} onCreateAccount={() => setView("create-account")} onSplash={() => setView("splash")} />)
}
