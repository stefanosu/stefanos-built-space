import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SESSION_KEY = "admin-unlocked";

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface PasswordGateProps {
  children: ReactNode;
}

/**
 * Client-side password screen. This is a soft deterrent, not real security: since
 * this is a static site, the expected hash ships inside the JS bundle and could be
 * found/brute-forced by anyone determined enough. The actual protection for
 * publishing is the GitHub token required inside the editor itself.
 */
const PasswordGate = ({ children }: PasswordGateProps) => {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const expectedHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH as
    | string
    | undefined;

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "true") {
      setUnlocked(true);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!expectedHash) {
      setError(
        "No admin password is configured for this build (VITE_ADMIN_PASSWORD_HASH is missing)."
      );
      return;
    }

    setChecking(true);
    const hash = await sha256Hex(password);
    setChecking(false);

    if (hash.toLowerCase() === expectedHash.toLowerCase()) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setUnlocked(true);
    } else {
      setError("Incorrect password.");
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-card border border-border/50 rounded-xl shadow-soft p-8 space-y-5"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Lock className="w-5 h-5" />
          <span className="text-sm font-medium">Admin access</span>
        </div>

        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={checking}>
          {checking ? "Checking..." : "Unlock"}
        </Button>
      </form>
    </div>
  );
};

export default PasswordGate;
