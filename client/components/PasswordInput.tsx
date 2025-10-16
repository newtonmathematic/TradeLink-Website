import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputClassName?: string;
}

export default function PasswordInput({ className, inputClassName, ...props }: PasswordInputProps) {
  const [show, setShow] = React.useState(false);
  return (
    <div className={cn("relative", className)}>
      <Input
        {...props}
        type={show ? "text" : "password"}
        className={cn("pr-10", inputClassName)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={() => setShow((s) => !s)}
        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}
