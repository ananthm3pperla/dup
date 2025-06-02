import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fallback?: string;
  status?: "online" | "offline" | "away" | "busy";
}

export default function Avatar({
  size = "md",
  className,
  src,
  alt,
  fallback,
  status,
  ...props
}: AvatarProps) {
  const [error, setError] = React.useState(false);

  const sizes = {
    xs: "h-6 w-6 text-[8px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  const statusColors = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    away: "bg-yellow-500",
    busy: "bg-red-500",
  };

  const getFallbackUrl = () => {
    const name = fallback || alt || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=ffffff&bold=true`;
  };

  const initials = React.useMemo(() => {
    const name = fallback || alt || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, [fallback, alt]);

  if (error || !src) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center bg-primary/10 text-primary font-semibold rounded-full ring-2 ring-offset-2 ring-primary/20",
          sizes[size],
          className,
        )}
      >
        {initials}
        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
              sizes[size === "xs" ? "xs" : size === "sm" ? "xs" : "sm"]
                .split(" ")[0]
                .replace("h-", "h-")
                .replace("10", "3")
                .replace("8", "2")
                .replace("6", "2"),
              statusColors[status],
            )}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <img
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className={cn("rounded-full object-cover", sizes[size], className)}
        {...props}
      />
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
            size === "xs"
              ? "h-1.5 w-1.5"
              : size === "sm"
                ? "h-2 w-2"
                : "h-3 w-3",
            statusColors[status],
          )}
        />
      )}
    </div>
  );
}
