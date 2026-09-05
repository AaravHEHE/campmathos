import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase } from "@/integrations/supabase/client";

// Client middleware: attach the current Supabase session token so
// requireSupabaseAuth can identify the caller (mirrors admin.functions.ts).
const attachAuthHeader = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data: { session } } = await supabase.auth.getSession();
    return next({
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {},
    });
  },
);

export interface ResourceRow {
  id: string;
  title: string;
  description: string | null;
  school_level: string;
  week_number: number;
  topic: string | null;
  resource_type: string;
  /** Storage object path (uploads) or absolute URL (links). */
  file_url: string | null;
  external_url: string | null;
  embed_url: string | null;
  thumbnail_url: string | null;
  slug: string | null;
  position: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

/** Public-facing shape: storage paths resolved to temporary signed URLs. */
export interface PublicResource extends ResourceRow {
  fileHref: string | null;
  thumbnailHref: string | null;
}

const SELECT_COLS =
  "id, title, description, school_level, week_number, topic, resource_type, file_url, external_url, embed_url, thumbnail_url, slug, position, published, created_at, updated_at";

const isHttp = (v: string | null | undefined) => !!v && /^https?:\/\//i.test(v);

async function signAll(rows: ResourceRow[]): Promise<PublicResource[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const sign = async (bucket: string, path: string | null) => {
    if (!path) return null;
    if (isHttp(path)) return path;
    const { data } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60 * 6);
    return data?.signedUrl ?? null;
  };

  return Promise.all(
    rows.map(async (r) => ({
      ...r,
      fileHref: await sign("resource-files", r.file_url),
      thumbnailHref: await sign("resource-thumbnails", r.thumbnail_url),
    })),
  );
}

async function adminRead() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/* ---------------------------------------------------------------- public */

export const listPublicResources = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = await adminRead();
    const { data, error } = await db
      .from("resources")
      .select(SELECT_COLS)
      .eq("published", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { rows: await signAll((data ?? []) as ResourceRow[]) };
  },
);

export const getPublicResource = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const db = await adminRead();
    const { data: row, error } = await db
      .from("resources")
      .select(SELECT_COLS)
      .eq("id", data.id)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { resource: null };
    const [signed] = await signAll([row as ResourceRow]);
    return { resource: signed ?? null };
  });

export const getPublicGame = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const db = await adminRead();
    const { data: row, error } = await db
      .from("resources")
      .select(SELECT_COLS)
      .eq("slug", data.slug)
      .eq("resource_type", "games")
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { resource: null };
    const [signed] = await signAll([row as ResourceRow]);
    return { resource: signed ?? null };
  });

/* ----------------------------------------------------------------- admin */

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Authorization check failed");
  if (!data) throw new Error("Forbidden");
}

export const adminListResources = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const db = await adminRead();
    const { data, error } = await db
      .from("resources")
      .select(SELECT_COLS)
      .order("school_level", { ascending: true })
      .order("week_number", { ascending: true })
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return { rows: await signAll((data ?? []) as ResourceRow[]) };
  });

export interface ResourceInput {
  id?: string;
  title: string;
  description: string | null;
  school_level: string;
  week_number: number;
  topic: string | null;
  resource_type: string;
  file_url: string | null;
  external_url: string | null;
  embed_url: string | null;
  thumbnail_url: string | null;
  slug: string | null;
  published: boolean;
}

export const adminSaveResource = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input: ResourceInput) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const db = await adminRead();

    if (!data.title.trim()) throw new Error("Title is required");

    // Games need a unique slug for their dedicated page.
    let slug = data.slug?.trim() || null;
    if (data.resource_type === "games" && slug) {
      let candidate = slug;
      let n = 2;
      for (;;) {
        const q = db.from("resources").select("id").eq("slug", candidate);
        const { data: clash } = await (data.id ? q.neq("id", data.id) : q).maybeSingle();
        if (!clash) break;
        candidate = `${slug}-${n++}`;
      }
      slug = candidate;
    }
    if (data.resource_type !== "games") slug = null;

    const payload = {
      title: data.title.trim(),
      description: data.description,
      school_level: data.school_level,
      week_number: data.week_number,
      topic: data.topic,
      resource_type: data.resource_type,
      file_url: data.file_url,
      external_url: data.external_url,
      embed_url: data.embed_url,
      thumbnail_url: data.thumbnail_url,
      slug,
      published: data.published,
    };

    if (data.id) {
      const { error } = await db.from("resources").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }

    // New resources go to the end of their category.
    const { data: last } = await db
      .from("resources")
      .select("position")
      .eq("school_level", data.school_level)
      .eq("week_number", data.week_number)
      .eq("resource_type", data.resource_type)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const position = ((last?.position as number | undefined) ?? -1) + 1;

    const { data: inserted, error } = await db
      .from("resources")
      .insert({ ...payload, position })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: inserted.id as string };
  });

export const adminDeleteResource = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const db = await adminRead();
    const { data: row } = await db
      .from("resources")
      .select("file_url, thumbnail_url")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await db.from("resources").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    // Best-effort cleanup of uploaded objects.
    const file = row?.file_url as string | null | undefined;
    const thumb = row?.thumbnail_url as string | null | undefined;
    if (file && !isHttp(file)) await db.storage.from("resource-files").remove([file]);
    if (thumb && !isHttp(thumb)) await db.storage.from("resource-thumbnails").remove([thumb]);
    return { ok: true };
  });

export const adminReorderResources = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input: { ids: string[] }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const db = await adminRead();
    for (let i = 0; i < data.ids.length; i++) {
      const { error } = await db
        .from("resources")
        .update({ position: i })
        .eq("id", data.ids[i]);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
