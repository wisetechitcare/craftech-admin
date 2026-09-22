import { cn } from "@/utils/utils";
import { ButtonProps, ButtonSize, ButtonVariant } from "@/types/common";

// Exported because InteractiveHoverButton steps through the same scale — two
// buttons in one design system that disagree on padding is the whole problem.
export const BUTTON_SIZES: Record<ButtonSize, string> = {
  xs: "px-3 py-2 text-xs",
  sm: "px-4 py-3 text-sm",
  md: "px-5 py-3.5 text-sm",
  lg: "px-6 py-4 text-base",
};

// Semantic roles, not values: `brand`/`surface`/`line` each resolve to whichever
// system the nearest scope declares, so these need no `dark:` pair and stay
// correct inside an .on-dark band as well.
const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-on-brand shadow-xs hover:bg-brand-2 disabled:bg-brand/50",
  outline: "bg-surface text-ink ring-1 ring-inset ring-line hover:bg-surface-2",
  none: "",
};

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  ...rest
}) => {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg transition",
        BUTTON_SIZES[size],
        BUTTON_VARIANTS[variant],
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
