import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export type ClassroomAuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | {
      status: "authenticated";
      userId: string;
      role: "admin" | "teacher" | "student";
      displayName: string | null;
    };

/**
 * Client-side auth + role hook for /app and /teacher routes.
 * Redirects to /login when no session. When `requireRole` is provided and
 * the user lacks the role, redirects them to their natural home.
 */
export function useClassroomAuth(requireRole?: "teacher" | "student") {
  const [state, setState] = useState<ClassroomAuthState>({ status: "loading" });
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      const { data: userRes } = await supabase.auth.getUser();
      if (cancelled) return;
      const user = userRes.user;
      if (!user) {
        setState({ status: "unauthenticated" });
        navigate({ to: "/admin/login", replace: true });
        return;
      }

      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
      ]);
      if (cancelled) return;
      const list = (roles ?? []).map((r) => r.role as string);
      const role: "admin" | "teacher" | "student" = list.includes("admin")
        ? "admin"
        : list.includes("teacher")
          ? "teacher"
          : "student";

      if (requireRole === "teacher" && role === "student") {
        navigate({ to: "/admin/login", replace: true });
        return;
      }
      setState({
        status: "authenticated",
        userId: user.id,
        role,
        displayName: profile?.display_name ?? null,
      });

    }

    resolve();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setState({ status: "unauthenticated" });
          navigate({ to: "/admin/login" });
        }

      },
    );
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requireRole]);

  return state;
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/admin/login";
}

