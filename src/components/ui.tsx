import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

const buttonVariants = cva("button", {
  variants: {
    variant: {
      primary: "button-primary",
      secondary: "button-secondary",
      quiet: "button-quiet",
      danger: "button-danger",
    },
    size: {
      normal: "button-normal",
      small: "button-small",
      icon: "button-icon",
    },
  },
  defaultVariants: {
    variant: "secondary",
    size: "normal",
  },
});

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

interface BadgeProps {
  children: ReactNode;
  tone?: string;
  className?: string;
}

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span className={cn("badge", `badge-${tone}`, className)}>{children}</span>
  );
}

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay" />
        <DialogPrimitive.Content className="dialog-content">
          <div className="dialog-header">
            <div>
              <DialogPrimitive.Title className="dialog-title">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="dialog-description">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close asChild>
              <Button
                type="button"
                variant="quiet"
                size="icon"
                aria-label="Close dialog"
              >
                <X size={18} aria-hidden="true" />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="dialog-body">{children}</div>
          {footer ? <div className="dialog-footer">{footer}</div> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
