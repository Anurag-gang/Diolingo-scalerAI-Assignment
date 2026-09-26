"use client";

import React from "react";

export type PressableVariant =
  | "green"
  | "blue"
  | "white"
  | "red"
  | "gold"
  | "neutral"
  | "ghost";

export type PressableSize = "sm" | "md" | "lg";

interface PressableButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PressableVariant;
  size?: PressableSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function PressableButton({
  variant = "green",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled = false,
  type = "button",
  ...props
}: PressableButtonProps) {
  const sizeClass =
    size === "sm"
      ? "pressable-sm"
      : size === "lg"
      ? "pressable-lg"
      : "pressable-md";

  const variantClass = `pressable-${variant}`;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`pressable-btn ${variantClass} ${sizeClass} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {/* Layer 1: Bottom 3D shadow depth */}
      <span className="pressable-btn-shadow" aria-hidden="true" />

      {/* Layer 2: Top interactive button face that translates down 4px on active */}
      <span className="pressable-btn-face">
        {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </span>
    </button>
  );
}

export default PressableButton;
