import logoImage from "../../imports/_______2.png";

interface CompanyLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
}

export function CompanyLogo({ size = "md", variant = "dark" }: CompanyLogoProps) {
  const dims = { sm: 60, md: 80, lg: 120 };
  const d = dims[size];
  const isLight = variant === "light";

  return (
    <svg width={d} height={d} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <image
        href={logoImage}
        x="0"
        y="0"
        width="200"
        height="200"
        preserveAspectRatio="xMidYMid meet"
        style={{ filter: isLight ? "brightness(0) invert(1)" : undefined }}
      />
    </svg>
  );
}
