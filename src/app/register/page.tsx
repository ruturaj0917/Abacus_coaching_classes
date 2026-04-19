"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { BookOpen, Loader2, Lock, Mail, Sparkles, User } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", classType: "ABACUS", level: "0"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed");
    } else {
      router.push("/student/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 text-center max-w-md">
          <div className="flex items-center justify-center w-32 h-32 rounded-2xl bg-white backdrop-blur mx-auto mb-8 border border-white/20 shadow-xl p-2">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Gururaj Coaching<br />Classes
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            Join hundreds of students mastering Abacus and Vedic Mathematics with our structured learning system.
          </p>
          <div className="space-y-4">
            {[
              { emoji: "🧮", text: "200-question structured tests" },
              { emoji: "📊", text: "Performance analytics & rankings" },
              { emoji: "🏆", text: "Real-time leaderboards" },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 bg-white/10 rounded-xl px-5 py-4 border border-white/10 text-left">
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-white/90 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-white p-1">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg text-foreground">Gururaj Coaching Classes</span>
          </div>

          <div className="mb-6 md:mb-8 text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Create account</h2>
            <p className="text-muted-foreground text-sm md:text-base">Join the academy and start learning today</p>
          </div>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
            <CardContent className="pt-6 p-4 md:p-6">
              <form onSubmit={handleRegister} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <span>⚠</span> {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground/80">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground/80">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground/80">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Class Type</Label>
                    <select
                      value={formData.classType}
                      onChange={(e) => setFormData({ ...formData, classType: e.target.value })}
                      className="flex h-11 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                    >
                      <option value="ABACUS">Abacus</option>
                      <option value="VEDIC_MATHS">Vedic Maths</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/80">Level</Label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="flex h-11 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                    >
                      {[0, 1, 2, 3, 4, 5].map(lvl => (
                        <option key={lvl} value={lvl}>Level {lvl}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 gradient-brand hover:opacity-90 transition-opacity text-white font-semibold border-0"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Create Account</>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center pt-0 pb-6">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Login here
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
