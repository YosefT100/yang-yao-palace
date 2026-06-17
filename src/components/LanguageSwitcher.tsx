"use client";
export function LanguageSwitcher({ current }: { current: string }) {
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {["en", "zh", "he"].map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => {
            document.cookie = `yyp_locale=${lang};path=/;max-age=31536000;SameSite=Lax`;
            window.location.reload();
          }}
          style={{
            padding: "4px 12px",
            border: lang === current ? "2px solid #D4AF37" : "1px solid #ccc",
            background: lang === current ? "#D4AF37" : "white",
            color: lang === current ? "white" : "#333",
            cursor: "pointer",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: lang === current ? "bold" : "normal",
          }}
        >
          {lang === "en" ? "EN" : lang === "zh" ? "中文" : "עב"}
        </button>
      ))}
    </div>
  );
}
