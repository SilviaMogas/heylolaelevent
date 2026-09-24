import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HeyLola — ask Lola how to adopt a dog in Dubai";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 24,
        background: "#F5F2ED",
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          fontSize: 120,
          fontWeight: 900,
          fontStyle: "italic",
          color: "#111111",
          letterSpacing: "-0.03em",
        }}
      >
        HeyLola
        <div
          style={{
            width: 34,
            height: 34,
            marginLeft: 12,
            background: "#F28C33",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: "#F28C33",
        }}
      >
        Ask Lola how to adopt a dog in Dubai
      </div>
      <div
        style={{
          fontSize: 32,
          color: "#111111",
          opacity: 0.6,
        }}
      >
        eleven.heylola.co
      </div>
    </div>,
    { ...size },
  );
}
