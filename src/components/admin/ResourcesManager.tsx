import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListResources,
  adminSaveResource,
  adminDeleteResource,
  adminReorderResources,
  type PublicResource,
} from "@/lib/resources.functions";
import {
  CURRICULUM_WEEKS,
  RESOURCE_CATEGORIES,
  SCHOOL_LEVELS,
  categoryLabel,
  levelLabel,
  slugify,
} from "@/data/resource-taxonomy";

type Draft = {
  id?: string;
  title: string;
  description: string;
  school_level: string;
  week_number: number;
  resource_type: string;
  external_url: string;
  embed_url: string;
  file_url: string | null;
  thumbnail_url: string | null;
  published: boolean;
};

const emptyDraft = (): Draft => ({
  title: "",
  description: "",
  school_level: "elementary",
  week_number: 1,
  resource_type: "notes",
  external_url: "",
  embed_url: "",
  file_url: null,
  thumbnail_url: null,
  published: true,
});

const inputCls =
  "w-full rounded-xl border-2 border-ink bg-cream px-4 py-2.5 font-mono text-sm placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-electric/40";
const labelCls =
  "font-mono text-[11px] uppercase tracking-widest text-ink/60";

export function ResourcesManager() {
  const [rows, setRows] = useState<PublicResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<null | "file" | "thumb">(null);
  const [filterLevel, setFilterLevel] = useState<string>("elementary");
  const [filterWeek, setFilterWeek] = useState<number>(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { rows } = await adminListResources();
      setRows(rows);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(
    () =>
      rows.filter(
        (r) => r.school_level === filterLevel && r.week_number === filterWeek,
      ),
    [rows, filterLevel, filterWeek],
  );

  const upload = async (bucket: string, file: File) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Session expired — sign in again");
    const safe = file.name.replace(/[^A-Za-z0-9._-]+/g, "-");
    const path = `${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw new Error(error.message);
    return path;
  };

  const onPickFile = async (kind: "file" | "thumb", file?: File | null) => {
    if (!file || !draft) return;
    setUploading(kind);
    setStatus(null);
    try {
      const bucket = kind === "file" ? "resource-files" : "resource-thumbnails";
      const path = await upload(bucket, file);
      setDraft({
        ...draft,
        ...(kind === "file" ? { file_url: path } : { thumbnail_url: path }),
      });
      setStatus(`Uploaded ${file.name}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.title.trim()) {
      setError("Give the resource a title");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminSaveResource({
        data: {
          id: draft.id,
          title: draft.title,
          description: draft.description.trim() || null,
          school_level: draft.school_level,
          week_number: draft.week_number,
          topic:
            CURRICULUM_WEEKS.find((w) => w.number === draft.week_number)?.topic ??
            null,
          resource_type: draft.resource_type,
          file_url: draft.file_url,
          external_url: draft.external_url.trim() || null,
          embed_url: draft.embed_url.trim() || null,
          thumbnail_url: draft.thumbnail_url,
          slug:
            draft.resource_type === "games" ? slugify(draft.title) : null,
          published: draft.published,
        },
      });
      setStatus(draft.id ? "Resource updated" : "Resource added");
      setDraft(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete “${title}”? This can't be undone.`)) return;
    try {
      await adminDeleteResource({ data: { id } });
      setStatus("Resource deleted");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...visible];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const a = next[index];
    const b = next[target];
    if (!a || !b) return;
    next[index] = b;
    next[target] = a;
    setRows((prev) =>
      prev.map((r) => {
        const i = next.findIndex((n) => n.id === r.id);
        return i === -1 ? r : { ...r, position: i };
      }),
    );
    try {
      await adminReorderResources({ data: { ids: next.map((n) => n.id) } });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reorder failed");
    }
  };

  return (
    <div className="card-3d bg-cream p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink/50">
            Camper materials
          </p>
          <h3 className="mt-1 font-display text-3xl font-black">Resources</h3>
        </div>
        <button
          type="button"
          onClick={() => setDraft(emptyDraft())}
          className="rounded-full border-2 border-ink bg-ink px-5 py-2 font-mono text-xs uppercase tracking-widest text-cream transition hover:bg-electric hover:border-electric"
        >
          + Add resource
        </button>
      </div>

      {error && <p className="mt-4 font-mono text-xs text-coral">{error}</p>}
      {status && <p className="mt-4 font-mono text-xs text-electric">{status}</p>}

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {SCHOOL_LEVELS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => setFilterLevel(l.value)}
            className={`rounded-full border-2 border-ink px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest transition ${
              filterLevel === l.value ? "bg-ink text-cream" : "hover:bg-ink/10"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {CURRICULUM_WEEKS.map((w) => (
          <button
            key={w.number}
            type="button"
            onClick={() => setFilterWeek(w.number)}
            className={`rounded-full border-2 border-ink px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest transition ${
              filterWeek === w.number ? "bg-electric text-cream border-electric" : "hover:bg-ink/10"
            }`}
          >
            W{w.number} · {w.topic}
          </button>
        ))}
      </div>

      {/* Editor */}
      {draft && (
        <div className="mt-6 rounded-2xl border-2 border-ink bg-cream p-5">
          <h4 className="font-display text-xl font-black">
            {draft.id ? "Edit resource" : "New resource"}
          </h4>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelCls}>Title</label>
              <input
                className={`${inputCls} mt-1`}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Week 1 graphing notes"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea
                className={`${inputCls} mt-1 min-h-20`}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="What campers will find inside."
              />
            </div>
            <div>
              <label className={labelCls}>School level</label>
              <select
                className={`${inputCls} mt-1`}
                value={draft.school_level}
                onChange={(e) => setDraft({ ...draft, school_level: e.target.value })}
              >
                {SCHOOL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Week</label>
              <select
                className={`${inputCls} mt-1`}
                value={draft.week_number}
                onChange={(e) =>
                  setDraft({ ...draft, week_number: Number(e.target.value) })
                }
              >
                {CURRICULUM_WEEKS.map((w) => (
                  <option key={w.number} value={w.number}>
                    Week {w.number} — {w.topic}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select
                className={`${inputCls} mt-1`}
                value={draft.resource_type}
                onChange={(e) => setDraft({ ...draft, resource_type: e.target.value })}
              >
                {RESOURCE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Visibility</label>
              <select
                className={`${inputCls} mt-1`}
                value={draft.published ? "yes" : "no"}
                onChange={(e) =>
                  setDraft({ ...draft, published: e.target.value === "yes" })
                }
              >
                <option value="yes">Published</option>
                <option value="no">Hidden</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Link (Blooket, Slides, Drive…)</label>
              <input
                className={`${inputCls} mt-1`}
                value={draft.external_url}
                onChange={(e) => setDraft({ ...draft, external_url: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Embed link (optional, shows in page)</label>
              <input
                className={`${inputCls} mt-1`}
                value={draft.embed_url}
                onChange={(e) => setDraft({ ...draft, embed_url: e.target.value })}
                placeholder="https://docs.google.com/…/embed"
              />
            </div>

            <div>
              <label className={labelCls}>File upload (PDF, slides…)</label>
              <input
                ref={fileRef}
                type="file"
                className="mt-1 block w-full font-mono text-xs"
                onChange={(e) => void onPickFile("file", e.target.files?.[0])}
              />
              <p className="mt-1 font-mono text-[11px] text-ink/50">
                {uploading === "file"
                  ? "Uploading…"
                  : draft.file_url
                    ? `Attached: ${draft.file_url}`
                    : "No file attached"}
              </p>
            </div>
            <div>
              <label className={labelCls}>Thumbnail image (optional)</label>
              <input
                ref={thumbRef}
                type="file"
                accept="image/*"
                className="mt-1 block w-full font-mono text-xs"
                onChange={(e) => void onPickFile("thumb", e.target.files?.[0])}
              />
              <p className="mt-1 font-mono text-[11px] text-ink/50">
                {uploading === "thumb"
                  ? "Uploading…"
                  : draft.thumbnail_url
                    ? "Thumbnail attached"
                    : "Default cover will be used"}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={saving || !!uploading}
              onClick={() => void save()}
              className="rounded-full border-2 border-ink bg-ink px-5 py-2 font-mono text-xs uppercase tracking-widest text-cream transition hover:bg-electric hover:border-electric disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save resource"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-full border-2 border-ink px-5 py-2 font-mono text-xs uppercase tracking-widest transition hover:bg-ink hover:text-cream"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="mt-8 space-y-3">
        {loading ? (
          <p className="font-mono text-sm text-ink/50">Loading resources…</p>
        ) : visible.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-ink/25 px-6 py-8 text-center font-mono text-sm text-ink/50">
            No resources for {levelLabel(filterLevel)} · Week {filterWeek} yet.
          </p>
        ) : (
          visible.map((r, i) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-cream px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-black">{r.title}</p>
                <p className="font-mono text-[11px] uppercase tracking-widest text-ink/50">
                  {categoryLabel(r.resource_type)}
                  {r.published ? "" : " · Hidden"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void move(i, -1)}
                  aria-label="Move up"
                  className="rounded-full border-2 border-ink px-3 py-1 font-mono text-xs transition hover:bg-ink hover:text-cream"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => void move(i, 1)}
                  aria-label="Move down"
                  className="rounded-full border-2 border-ink px-3 py-1 font-mono text-xs transition hover:bg-ink hover:text-cream"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      id: r.id,
                      title: r.title,
                      description: r.description ?? "",
                      school_level: r.school_level,
                      week_number: r.week_number,
                      resource_type: r.resource_type,
                      external_url: r.external_url ?? "",
                      embed_url: r.embed_url ?? "",
                      file_url: r.file_url,
                      thumbnail_url: r.thumbnail_url,
                      published: r.published,
                    })
                  }
                  className="rounded-full border-2 border-ink px-4 py-1 font-mono text-[11px] uppercase tracking-widest transition hover:bg-ink hover:text-cream"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void remove(r.id, r.title)}
                  className="rounded-full border-2 border-coral bg-coral px-4 py-1 font-mono text-[11px] uppercase tracking-widest text-cream transition hover:bg-transparent hover:text-coral"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
