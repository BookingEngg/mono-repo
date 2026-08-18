// Atoms
import { Button } from "@/atoms/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/atoms/ui/card";

/**
 * Rendered by ErrorBoundary when any page in the tree throws during render.
 * A full reload is the only reliable recovery since we don't know which piece
 * of state caused the crash.
 */
const ErrorFallback = () => {
  return (
    <div className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            This page ran into an unexpected error. Reloading usually fixes it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback;
