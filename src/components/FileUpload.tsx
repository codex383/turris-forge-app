import { useState, useRef } from "react";
import { C } from "../data/seed";
import { uploadToCloudinary } from "../lib/cloudinary";
import type { UploadedFile } from "../types";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = ["image/", "application/pdf", "video/", "text/"];
const isAllowed = (f: File) => ALLOWED.some(t => f.type.startsWith(t));

function formatSize(b: number) {
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / 1024 / 1024).toFixed(1)}MB`;
}

const EXT_ICON: Record<string, string> = {
  "image": "🖼", "video": "🎬", "application/pdf": "📄", "text": "📝",
};
function fileIcon(type: string) {
  for (const [k, v] of Object.entries(EXT_ICON)) if (type.startsWith(k)) return v;
  return "📎";
}

export function FileUpload({ files, setFiles, folder = "submissions" }: {
  files: UploadedFile[];
  setFiles: (f: UploadedFile[]) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const addFiles = async (raw: FileList | null) => {
    if (!raw) return;
    setError("");
    setUploading(true);

    const newFiles: UploadedFile[] = [];

    for (const file of Array.from(raw)) {
      if (!isAllowed(file)) { setError(`${file.name}: file type not supported`); continue; }
      if (file.size > MAX_SIZE) { setError(`${file.name}: too large (max 10MB)`); continue; }

      try {
        const uploaded = await uploadToCloudinary(file, folder);
        newFiles.push(uploaded);
      } catch (err: any) {
        setError(`${file.name}: upload failed — ${err.message}`);
      }
    }

    setFiles([...files, ...newFiles]);
    setUploading(false);
  };

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? C.gold : C.cyan + "44"}`,
          borderRadius: 10, padding: "22px 16px", textAlign: "center",
          cursor: uploading ? "wait" : "pointer",
          background: dragging ? `${C.gold}08` : `${C.cyan}05`,
          transition: "all .2s",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 6 }}>{uploading ? "⏳" : "📂"}</div>
        <div style={{ fontSize: 13, color: dragging ? C.gold : C.ash, fontWeight: 600 }}>
          {uploading ? "Uploading..." : dragging ? "Drop to attach" : "Drag & drop files, or click to browse"}
        </div>
        <div style={{ fontSize: 11, color: C.gray, marginTop: 4 }}>Images, PDFs, videos, text files · Max 10MB each</div>
      </div>
      <input ref={inputRef} type="file" multiple accept="image/*,application/pdf,video/*,text/*" onChange={e => addFiles(e.target.files)} style={{ display: "none" }} />

      {error && <div style={{ marginTop: 8, fontSize: 12, color: C.ember }}>{error}</div>}

      {files.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {files.map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
              background: C.sur2, borderRadius: 7, border: `1px solid #ffffff08`,
            }}>
              {f.type.startsWith("image") ? (
                <img src={f.url} alt={f.name} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
              ) : (
                <span style={{ fontSize: 24, flexShrink: 0 }}>{fileIcon(f.type)}</span>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: C.ash, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
                <div style={{ fontSize: 10, color: C.gray }}>{formatSize(f.size)}</div>
              </div>
              <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: C.cyan, fontSize: 11, textDecoration: "none", marginRight: 6 }}>View</a>
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: C.gray, cursor: "pointer", fontSize: 14, padding: "0 4px" }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
