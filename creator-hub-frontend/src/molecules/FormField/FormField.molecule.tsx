// Modules
import React from "react";
// Atoms
import { Input } from "@/atoms/ui/input";
import { Label } from "@/atoms/ui/label";
// Utils
import { cn } from "@/lib/utils";

type TFormFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
  onEnter?: () => void;
};

/**
 * Label + input + validation message. Every auth text input goes through this so
 * error styling and aria wiring stay consistent across Login and Signup.
 */
const FormField = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  disabled,
  error,
  hint,
  onEnter,
}: TFormFieldProps) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && onEnter) {
      onEnter();
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-xs">
          {error}
        </p>
      ) : (
        hint && <p className={cn("text-muted-foreground text-xs")}>{hint}</p>
      )}
    </div>
  );
};

export default FormField;
