"use client";

const LANGS = [
  { code: "en",  label: "EN" },
  { code: "zh",  label: "中文" },
  { code: "ru",  label: "RU" },
  { code: "hi",  label: "हि" },
  { code: "fil", label: "FIL" },
  { code: "ar",  label: "عر" },
  { code: "ja",  label: "日本語" },
  { code: "es",  label: "ES" },
  { code: "pt",  label: "PT" },
];

export function LanguageSwitcher({ current }: { current: string }) {
  return (
    <select
      value={current}
      onChange={(e) => {
        document.cookie = `yyp_locale=${e.target.value};path=/;max-age=31536000;SameSite=Lax`;
        window.location.reload();
      }}
      style={{
        background: "rgba(0,0,0,0.45)",
        border: "1px solid rgba(212,175,55,0.35)",
        color: "white",
        borderRadius: "6px",
        padding: "4px 8px",
        fontSize: "12px",
        cursor: "pointer",
        outline: "none",
      }}
    >
      {LANGS.map(({ code, label }) => (
        <option key={code} value={code} style={{ background: "#1a0a00", color: "white" }}>
          {label}
        </option>
      ))}
    </select>
  );
}
