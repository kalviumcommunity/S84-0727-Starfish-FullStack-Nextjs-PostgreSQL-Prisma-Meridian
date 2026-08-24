import { useState } from "react";
import { Link, createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Cloud, TrendingUp, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMeFn, loginFn } from "@/server/app.functions";

export const Route = createFileRoute("/auth/login")({
  beforeLoad: async () => {
    const user = await getMeFn();
    if (user) {
      if (user.role === "ADMIN") {
        throw redirect({ to: "/admin" });
      }
      throw redirect({ to: "/app" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const session = await loginFn({ data: { email, password } });
      await router.invalidate();
      if (session?.user?.role === "ADMIN") {
        await router.navigate({ to: "/admin" });
      } else {
        await router.navigate({ to: "/app" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between text-white">
        <div>
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <Cloud className="h-8 w-8" />
            CloudLens AI
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Understand Your Cloud Costs</h1>
            <p className="text-xl text-blue-100">
              Connect deployments with cost changes. Get AI-powered insights in seconds.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 rounded-lg p-3">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Cost Attribution</h3>
                <p className="text-blue-100">
                  Automatically correlate cost spikes with deployments
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-500 rounded-lg p-3">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI Insights</h3>
                <p className="text-blue-100">Get actionable recommendations powered by AI</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-blue-200">© 2026 CloudLens AI. Built for FinOps teams.</div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold">
              <Cloud className="h-7 w-7" />
              CloudLens AI
            </Link>
          </div>

          <Card className="border-2">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your account to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                {error ? (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                ) : null}
                <Button type="submit" className="w-full h-11" size="lg" disabled={pending}>
                  {pending ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/auth/register" className="font-semibold text-primary hover:underline">
                  Create account
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
