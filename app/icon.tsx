import { ImageResponse } from "next/og";

// app/icon.tsx is another Next.js magic filename — it generates the
// browser tab favicon automatically. This replaces the default
// Next.js logo every fresh project starts with, which is one of
// the fastest visual "this is clearly a template" tells a reviewer
// notices.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f766e",
          borderRadius: 6,
          color: "white",
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
