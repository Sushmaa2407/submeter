import { ImageResponse } from "next/og";

// This file, at app/opengraph-image.tsx, is another Next.js magic
// filename: it automatically generates a real PNG image at
// /opengraph-image whenever a page's OG tags reference it. No
// design tool needed — it's just JSX styled with inline CSS,
// rendered to an image on the server.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#171717",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 600, letterSpacing: -2 }}>
          SubMeter
        </div>
        <div style={{ fontSize: 28, color: "#a3a3a3", marginTop: 16 }}>
          Subscription billing & usage analytics
        </div>
      </div>
    ),
    { ...size }
  );
}
