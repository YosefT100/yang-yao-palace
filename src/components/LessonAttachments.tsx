"use client";

import { useState, useEffect } from "react";
import {
  addLessonLinkAction,
  addLessonFileAction,
  deleteLessonAttachmentAction,
  getLessonAttachmentsAction,
} from "@/app/teacher/actions";

type Attachment = {
  id: string;
  lesson_id: string;
  teacher_id: string;
  title: string;
  type: string;
  url: string;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
};

function attachmentIcon(att: Attachment): string {
  if (att.type === "link") return "📎";
  const name = (att.file_name ?? att.url).toLowerCase();
  if (name.match(/\.pdf$/)) return "📄";
  if (name.match(/\.(mp4|mov|avi|webm|mkv)$/)) return "🎬";
  if (name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return "🖼️";
  if (name.match(/\.(ppt|pptx|key|odp)$/)) return "📊";
  return "📎";
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LessonAttachments({ lessonId }: { lessonId: string }) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [tab, setTab] = useState<"link" | "file">("link");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const data = await getLessonAttachmentsAction(lessonId);
    setAttachments(data as Attachment[]);
  }

  useEffect(() => { load(); }, [lessonId]);

  async function handleAddLink() {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    setSaving(true);
    setError("");
    try {
      await addLessonLinkAction(lessonId, linkTitle.trim(), linkUrl.trim());
      setLinkTitle("");
      setLinkUrl("");
      await load();
    } catch {
      setError("Failed to add link.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("lessonId", lessonId);
      console.log("[LessonAttachments] uploading file:", file.name, "size:", file.size, "lessonId:", lessonId);
      const res = await fetch("/api/upload-lesson-file", { method: "POST", body: form });
      console.log("[LessonAttachments] upload response status:", res.status);
      if (!res.ok) throw new Error(await res.text());
      const { url, fileName, fileSize } = await res.json();
      console.log("[LessonAttachments] upload success, url:", url);
      await addLessonFileAction(lessonId, file.name, url, fileName, fileSize);
      e.target.value = "";
      await load();
    } catch (err) {
      setError("Upload failed. Check R2 credentials.");
      console.error("[LessonAttachments] upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this attachment?")) return;
    await deleteLessonAttachmentAction(id, lessonId);
    await load();
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-lg font-semibold">
        Attachments
        {attachments.length > 0 && (
          <span className="ml-2 text-sm font-normal text-palace-dark/50">({attachments.length})</span>
        )}
      </h2>

      {/* Existing list */}
      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map((att) => (
            <li key={att.id} className="flex items-center gap-3 rounded-lg bg-palace-dark/5 px-3 py-2">
              <span className="text-lg">{attachmentIcon(att)}</span>
              <div className="min-w-0 flex-1">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm font-medium text-palace-red hover:underline"
                >
                  {att.title}
                </a>
                {att.file_size && (
                  <p className="text-xs text-palace-dark/50">{formatSize(att.file_size)}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(att.id)}
                aria-label="Delete attachment"
                className="shrink-0 text-palace-dark/30 hover:text-red-600"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Tabs */}
      <div>
        <div className="mb-3 flex gap-1 rounded-lg bg-palace-dark/5 p-1">
          {(["link", "file"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-white shadow-sm text-palace-dark"
                  : "text-palace-dark/50 hover:text-palace-dark"
              }`}
            >
              {t === "link" ? "📎 Add Link" : "📁 Upload File"}
            </button>
          ))}
        </div>

        {tab === "link" ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="input flex-1"
              placeholder="Title"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
            />
            <input
              className="input flex-1"
              placeholder="https://…"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <button
              onClick={handleAddLink}
              disabled={saving || !linkTitle.trim() || !linkUrl.trim()}
              className="btn-primary whitespace-nowrap disabled:opacity-40"
            >
              {saving ? "Adding…" : "Add"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <label className="flex-1 cursor-pointer rounded-lg border-2 border-dashed border-palace-dark/20 px-4 py-3 text-center text-sm text-palace-dark/50 hover:border-palace-red/40 hover:text-palace-dark/70">
              {uploading ? "Uploading…" : "Click to choose a file (PDF, image, video, doc)"}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.ppt,.pptx,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
