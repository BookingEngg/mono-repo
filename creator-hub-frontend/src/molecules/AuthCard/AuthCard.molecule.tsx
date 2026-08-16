// Modules
import React from "react";
// Atoms
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";
import { Alert, AlertDescription } from "@/atoms/ui/alert";
// Icons
import { AlertCircleIcon } from "lucide-react";

type TAuthCardProps = {
  title: string;
  description: string;
  error?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Card chrome for the auth screens: heading, form slot, error banner and footer.
 * Keeps Login and Signup visually identical without either owning the layout.
 */
const AuthCard = ({
  title,
  description,
  error,
  footer,
  children,
}: TAuthCardProps) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {children}
      </CardContent>

      {footer && (
        <CardFooter className="justify-center text-sm">{footer}</CardFooter>
      )}
    </Card>
  );
};

export default AuthCard;
