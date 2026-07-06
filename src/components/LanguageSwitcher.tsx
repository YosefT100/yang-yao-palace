"use client";
export function LanguageSwitcher({ current }: { current: string }) {
  const langs: { code: string; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "zh", label: "中文" },
    { code: "ru", label: "RU" },
    { code: "hi", label: "हि" },
    { code: "fil", label: "FIL" },
    { code: "ar", label: "عر" },
    { code: "ja", label: "日本語" },
  ];
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", maxWidth: "260px", justifyContent: "flex-end" }}>
      {langs.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => {
            document.cookie = `yyp_locale=${code};path=/;max-age=31536000;SameSite=Lax`;
            window.location.reload();
          }}
          style={{
            padding: "4px 10px",
            border: code === current ? "2px solid #D4AF37" : "1px solid #ccc",
            background: code === current ? "#D4AF37" : "white",
            color: code === current ? "white" : "#333",
            cursor: "pointer",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: code === current ? "bold" : "normal",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
