import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90":
              variant === "default",
            "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80":
              variant === "secondary",
            "border border-[var(--border)] bg-transparent hover:bg-[var(--accent)]":
              variant === "outline",
            "hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]":
              variant === "ghost",
            "bg-[var(--destructive)] text-white hover:opacity-90":
              variant === "destructive",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 px-3": size === "sm",
            "h-11 px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
