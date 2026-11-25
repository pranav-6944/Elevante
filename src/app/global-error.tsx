"use client";

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest?: unknown }).digest ?? "")
      : "";

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#F5F6F2",
          color: "#17264F",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "460px",
            width: "100%",
            backgroundColor: "#FFFFFF",
            border: "1px solid #D8DDD6",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#245B70",
              margin: "0 0 8px",
            }}
          >
            ELEVANTE — Critical Recovery
          </p>
          <h1 style={{ fontSize: "24px", margin: "0 0 12px" }}>Something went wrong</h1>
          <p style={{ fontSize: "14px", color: "#465874", margin: "0 0 20px", lineHeight: 1.6 }}>
            A critical application error occurred. You can retry loading the application safely.
          </p>
          {digest ? (
            <p style={{ fontSize: "12px", fontFamily: "monospace", margin: "0 0 20px" }}>
              Reference ID: {digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => retry()}
            style={{
              backgroundImage: "linear-gradient(100deg, #17264F 0%, #245B70 52%, #319C78 100%)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
