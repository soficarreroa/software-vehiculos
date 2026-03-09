"use client";

import styles from "./Input.module.css";

interface InputProps {
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  className,
}: InputProps) {
  return (
    <input
      type={type}
      className={`${styles.input} ${className || ""}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}
