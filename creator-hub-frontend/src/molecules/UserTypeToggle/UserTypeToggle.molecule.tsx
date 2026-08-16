// Atoms
import { Button } from "@/atoms/ui/button";
// Utils
import { cn } from "@/lib/utils";
// Typings
import { TUserType } from "@/typings/auth";

const OPTIONS: { value: TUserType; label: string }[] = [
  { value: "user", label: "Creator" },
  { value: "brand", label: "Brand" },
];

type TUserTypeToggleProps = {
  value: TUserType;
  onChange: (value: TUserType) => void;
  disabled?: boolean;
};

/**
 * Segmented Creator/Brand picker for Signup. The chosen value is only used
 * the moment a brand-new account gets created — it has no effect on login.
 */
const UserTypeToggle = ({ value, onChange, disabled }: TUserTypeToggleProps) => {
  return (
    <div
      role="radiogroup"
      aria-label="Account type"
      className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1"
    >
      {OPTIONS.map((option) => {
        const isSelected = value === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            variant={isSelected ? "default" : "ghost"}
            disabled={disabled}
            className={cn("w-full", !isSelected && "text-muted-foreground")}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
};

export default UserTypeToggle;
