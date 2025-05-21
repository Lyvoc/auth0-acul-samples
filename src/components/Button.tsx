// components/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: ReactNode;
}

export default function Button({
  className = "",
  children,
  ...props
}: Readonly<ButtonProps>) {
  return (
    <button className={`form-button ${className}`} {...props}>
      {children}
    </button>
  );
}
