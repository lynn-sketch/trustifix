import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserRole } from "../lib/rbac";
import { hasPermission, type Permission } from "../lib/rbac";
import { AUTH_KEY, loadJson, saveJson } from "../lib/storage";

const USERS_KEY = "trustifix.users.v1";

export type AuthUser = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: Exclude<UserRole, "guest">;
  emailVerified: boolean;
  phoneVerified: boolean;
  /** Data URL or public path */
  avatarUrl?: string;
};

type StoredAccount = AuthUser & {
  password: string;
};

export type SignUpInput = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  can: (permission: Permission) => boolean;
  signInDemo: (role?: Exclude<UserRole, "guest">) => void;
  /** Returns an error message on failure, otherwise null + role via out param pattern: null means success */
  signInWithPassword: (
    login: string,
    password: string,
  ) => { error: string | null; role?: Exclude<UserRole, "guest"> };
  /** Create a customer account. Returns error or null. */
  signUp: (input: SignUpInput) => string | null;
  signOut: () => void;
  updateProfile: (
    patch: Partial<Pick<AuthUser, "fullName" | "avatarUrl" | "phone" | "username">>,
  ) => void;
};

/** Built-in admin — local UI only */
const ADMIN_LOGIN = {
  username: "admin",
  password: "admin35",
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AVATAR_PRESETS = [
  "/images/avatars/quick.jpg",
  "/images/avatars/elite.jpg",
  "/images/avatars/sparkle.jpg",
  "/images/avatars/tech.jpg",
];

export const DEMO_USERS: Record<Exclude<UserRole, "guest">, AuthUser> = {
  customer: {
    id: "cust-1",
    fullName: "Demo Customer",
    username: "demo_customer",
    email: "customer@trustifix.test",
    phone: "+256700000001",
    role: "customer",
    emailVerified: true,
    phoneVerified: false,
    avatarUrl: "/images/avatars/quick.jpg",
  },
  provider: {
    id: "prov-nakawa-ac",
    fullName: "Alex Okello",
    username: "alex_okello",
    email: "alex@trustifix.test",
    phone: "+256700000002",
    role: "provider",
    emailVerified: true,
    phoneVerified: true,
    avatarUrl: "/images/avatars/tech.jpg",
  },
  admin: {
    id: "admin-1",
    fullName: "Demo Admin",
    username: "admin",
    email: "admin@trustifix.test",
    phone: "+256700000000",
    role: "admin",
    emailVerified: true,
    phoneVerified: true,
    avatarUrl: "/images/avatars/elite.jpg",
  },
};

function loadAccounts(): StoredAccount[] {
  return loadJson<StoredAccount[]>(USERS_KEY, []);
}

function saveAccounts(accounts: StoredAccount[]) {
  saveJson(USERS_KEY, accounts);
}

function toPublicUser(account: StoredAccount | AuthUser): AuthUser {
  const { password: _pw, ...rest } = account as StoredAccount;
  return rest;
}

function normalizePhone(phone: string) {
  return phone.replace(/[\s()-]/g, "").trim();
}

function uid() {
  return `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function validateSignUp(input: SignUpInput): string | null {
  const fullName = input.fullName.trim();
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();
  const phone = normalizePhone(input.phone);
  const password = input.password;

  if (!fullName) return "Enter your full name.";
  if (!username || username.length < 3) return "Username must be at least 3 characters.";
  if (!/^[a-z0-9._]+$/i.test(username)) {
    return "Username can only use letters, numbers, dots, and underscores.";
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email.";
  if (!phone || phone.replace(/\D/g, "").length < 9) return "Enter a valid phone number.";
  if (!password || password.length < 6) return "Password must be at least 6 characters.";
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = loadJson<AuthUser | null>(AUTH_KEY, null);
    if (!saved) return null;
    // Backfill fields for older sessions
    return {
      ...saved,
      username: saved.username || saved.email?.split("@")[0] || "user",
      phone: saved.phone || "",
    };
  });

  useEffect(() => {
    saveJson(AUTH_KEY, user);
  }, [user]);

  const applyUser = useCallback((base: AuthUser) => {
    const saved = loadJson<AuthUser | null>(AUTH_KEY, null);
    if (saved?.id === base.id) {
      setUser({
        ...base,
        ...saved,
        role: base.role,
        id: base.id,
        email: base.email,
        username: base.username || saved.username,
        phone: base.phone || saved.phone || "",
      });
    } else {
      setUser(base);
    }
  }, []);

  const signInDemo = useCallback(
    (role: Exclude<UserRole, "guest"> = "customer") => {
      applyUser(DEMO_USERS[role]);
    },
    [applyUser],
  );

  const signUp = useCallback(
    (input: SignUpInput) => {
      const err = validateSignUp(input);
      if (err) return err;

      const fullName = input.fullName.trim();
      const username = input.username.trim().toLowerCase();
      const email = input.email.trim().toLowerCase();
      const phone = normalizePhone(input.phone);
      const password = input.password;

      if (username === ADMIN_LOGIN.username) {
        return "That username is reserved. Choose another.";
      }

      const accounts = loadAccounts();
      const taken = accounts.some(
        (a) =>
          a.username.toLowerCase() === username ||
          a.email.toLowerCase() === email ||
          normalizePhone(a.phone) === phone,
      );
      if (taken) return "An account with that username, email, or phone already exists.";

      // Also block demo emails
      const demoHit = Object.values(DEMO_USERS).some(
        (d) => d.email.toLowerCase() === email || d.username.toLowerCase() === username,
      );
      if (demoHit) return "That email or username is reserved for demos.";

      const account: StoredAccount = {
        id: uid(),
        fullName,
        username,
        email,
        phone,
        password,
        role: "customer",
        emailVerified: true,
        phoneVerified: false,
        avatarUrl: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
      };
      saveAccounts([...accounts, account]);
      applyUser(toPublicUser(account));
      return null;
    },
    [applyUser],
  );

  const signInWithPassword = useCallback(
    (login: string, password: string) => {
      const key = login.trim().toLowerCase();
      const phoneKey = normalizePhone(login);
      const p = password;
      if (!key || !p) {
        return { error: "Enter your email/username/phone and password." };
      }

      // Built-in admin
      if (
        (key === ADMIN_LOGIN.username || key === DEMO_USERS.admin.email.toLowerCase()) &&
        p === ADMIN_LOGIN.password
      ) {
        applyUser(DEMO_USERS.admin);
        return { error: null, role: "admin" as const };
      }

      // Demo shortcuts
      for (const demo of Object.values(DEMO_USERS)) {
        if (
          (key === demo.email.toLowerCase() ||
            key === demo.username.toLowerCase() ||
            phoneKey === normalizePhone(demo.phone)) &&
          p === "demo123"
        ) {
          applyUser(demo);
          return { error: null, role: demo.role };
        }
      }

      const accounts = loadAccounts();
      const match = accounts.find(
        (a) =>
          a.email.toLowerCase() === key ||
          a.username.toLowerCase() === key ||
          normalizePhone(a.phone) === phoneKey,
      );
      if (!match || match.password !== p) {
        return { error: "Invalid login or password." };
      }

      applyUser(toPublicUser(match));
      return { error: null, role: match.role };
    },
    [applyUser],
  );

  const signOut = useCallback(() => setUser(null), []);

  const updateProfile = useCallback(
    (patch: Partial<Pick<AuthUser, "fullName" | "avatarUrl" | "phone" | "username">>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next: AuthUser = {
          ...prev,
          ...patch,
          fullName: patch.fullName?.trim() || prev.fullName,
          username: patch.username?.trim().toLowerCase() || prev.username,
          phone: patch.phone !== undefined ? normalizePhone(patch.phone) : prev.phone,
        };

        // Persist into accounts store when this is a registered user
        const accounts = loadAccounts();
        const idx = accounts.findIndex((a) => a.id === prev.id);
        if (idx >= 0) {
          accounts[idx] = { ...accounts[idx], ...next };
          saveAccounts(accounts);
        }
        return next;
      });
    },
    [],
  );

  const value = useMemo<AuthContextValue>(() => {
    const role: UserRole = user?.role ?? "guest";
    return {
      user,
      role,
      isAuthenticated: Boolean(user),
      can: (permission) => hasPermission(role, permission),
      signInDemo,
      signInWithPassword,
      signUp,
      signOut,
      updateProfile,
    };
  }, [user, signInDemo, signInWithPassword, signUp, signOut, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
