import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
}

export function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";

  return (
    <div className={`max-w-3xl space-y-4 ${alignClass}`}>
      {eyebrow && (
        <div className="flex items-center gap-3" style={{ justifyContent: align === "center" ? "center" : "flex-start" }}>
          <div className="h-0.5 w-10 rounded-full" style={{ background: "#C8102E" }} />
          <p className="font-cinzel text-xs font-semibold uppercase tracking-[0.40em]"
            style={{ color: "#C8102E" }}>
            {eyebrow}
          </p>
        </div>
      )}
      <h2 className="font-cinzel text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
        style={{ color: "#1a0506" }}>
        {title}
      </h2>
      {description && (
        <div className="font-playfair text-base leading-relaxed sm:text-lg"
          style={{ color: "rgba(26,5,6,0.65)" }}>
          {description}
        </div>
      )}
    </div>
  );
}
