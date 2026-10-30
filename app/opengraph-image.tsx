import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GmailReporter — Private Inbox Intelligence";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background:
            "radial-gradient(ellipse at 75% 16%, rgba(212,175,55,.2), transparent 34%), linear-gradient(140deg, #111A2E 0%, #0A0F1F 60%, #070B16 100%)",
          color: "#F5F1E8",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "1100px",
            height: "550px",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "1px solid rgba(212,175,55,.36)",
            borderRadius: "30px",
            padding: "58px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                display: "flex",
                width: "54px",
                height: "54px",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(212,175,55,.55)",
                borderRadius: "16px",
                color: "#E8CC70",
                fontSize: "30px",
              }}
            >
              ✉
            </div>
            <span style={{ fontSize: "26px", letterSpacing: "1px" }}>
              GmailReporter
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                color: "#D4AF37",
                fontFamily: "Arial, sans-serif",
                fontSize: "15px",
                letterSpacing: "5px",
                textTransform: "uppercase",
              }}
            >
              Private inbox intelligence
            </span>
            <h1
              style={{
                margin: "24px 0 0",
                fontSize: "72px",
                fontWeight: 500,
                letterSpacing: "-2px",
                lineHeight: 1.05,
              }}
            >
              Your inbox, in
              <br />
              <span style={{ color: "#D4AF37" }}>perspective.</span>
            </h1>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(212,175,55,.26)",
              paddingTop: "20px",
              color: "#B6B2A7",
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            <span>Elegant insight. Absolute privacy.</span>
            <span>Private by design</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
