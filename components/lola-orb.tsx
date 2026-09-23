export type LolaOrbState = "idle" | "listening" | "thinking" | "speaking";

export function LolaOrb({
  state,
  size = "lg",
}: {
  state: LolaOrbState;
  size?: "sm" | "lg";
}) {
  const px = size === "lg" ? 160 : 40;
  return (
    <div
      aria-hidden="true"
      className="relative flex items-center justify-center"
      style={{ width: px, height: px }}
    >
      {/* soft halo */}
      <div
        className="absolute inset-0 rounded-full bg-brand/40 blur-xl"
        style={{ transform: "scale(1.15)" }}
      />
      {state === "listening" && (
        <>
          <span className="pulse-ring" />
          <span className="pulse-ring" style={{ animationDelay: "1s" }} />
        </>
      )}
      {state === "thinking" && <span className="orb-thinking-ring" />}
      <div
        className={`orb-core ${
          state === "speaking"
            ? "orb-speak"
            : state === "idle"
              ? "orb-breathe"
              : ""
        }`}
        style={{
          width: px,
          height: px,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, #FBC15F, #F28C33 60%, #d9731f)",
        }}
      />
    </div>
  );
}
