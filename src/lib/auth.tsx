import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AuthAPI, Auth, type AdminUser } from "./api";

type AuthCtx = {
  user: AdminUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isSchoolAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run auth check on client-side
    if (typeof window === "undefined") return;

    let alive = true;
    const cached = Auth.getUser();
    const token = Auth.getToken();
    if (cached) {
      setUser(cached);
      setLoading(false);
    }
    
    if (token) {
      AuthAPI.me()
        .then((u) => {
          if (!alive) return;
          if (u) setUser(u);
          else if (!cached) { Auth.clear(); setUser(null); }
        })
        .catch(() => {
          if (!alive || cached) return;
          Auth.clear(); setUser(null);
        })
        .finally(() => { if (alive) setLoading(false); });
    } else {
      setLoading(false);
    }

    return () => { alive = false; };
  }, []);

  // Roles can come as `role: "admin"`, `roles: ["admin"]`, or `roles: [{name:"admin"}]`.
  const allRoles: string[] = (() => {
    const raw: any = (user as any)?.roles;
    if (Array.isArray(raw)) return raw.map((r) => (typeof r === "string" ? r : r?.name)).filter(Boolean);
    return user?.role ? [String(user.role)] : [];
  })().map((r) => r.toLowerCase());
  // Platform owners (super admins) use role "admin" in the backend.
  // School-level admins use "school_admin" / "school_manager" / "org_admin".
  const isSuperAdmin = allRoles.some((r) =>
    ["admin", "super_admin", "superadmin", "platform_admin"].includes(r),
  );
  const isSchoolAdmin = allRoles.some((r) =>
    ["school_admin", "school_manager", "org_admin"].includes(r),
  ) || isSuperAdmin;

  const value: AuthCtx = {
    user,
    loading,
    isAuthenticated: !!user,
    isSuperAdmin,
    isSchoolAdmin: isSchoolAdmin || isSuperAdmin,
    login: async (email, password) => {
      const { user: u } = await AuthAPI.login(email, password);
      setUser(u);
    },
    logout: async () => {
      await AuthAPI.logout();
      setUser(null);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
