"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Plus, Loader2, Clock, GraduationCap } from "lucide-react";

export default function AdminTests() {
  const [tests, setTests] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [classType, setClassType] = useState("ABACUS");
  const [level, setLevel] = useState("0");
  const [timeLimit, setTimeLimit] = useState("60");
  const [questionCount, setQuestionCount] = useState("200");
  const [loading, setLoading] = useState(false);

  const fetchTests = async () => {
    const res = await fetch('/api/admin/tests');
    const data = await res.json();
    setTests(data.tests || []);
  };

  useEffect(() => { fetchTests(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/admin/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, classType, level, timeLimit, questionCount })
    });
    setLoading(false);
    setTitle("");
    fetchTests();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Manage <span className="gradient-text">Tests</span>
        </h1>
        <p className="text-muted-foreground">Create and manage tests for students</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Create Test Form */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm xl:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Create New Test</CardTitle>
            </div>
            <CardDescription>Auto-generates questions (1–500)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-title">Test Title</Label>
                <Input
                  id="test-title"
                  required
                  placeholder="e.g. Weekly Abacus Level 1"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label>Class Type</Label>
                <select
                  value={classType}
                  onChange={e => setClassType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="ABACUS">Abacus</option>
                  <option value="VEDIC_MATHS">Vedic Maths</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {[0, 1, 2, 3, 4, 5].map(l => (
                    <option key={l} value={l}>Level {l}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <Input
                  id="time-limit"
                  required
                  type="number"
                  min="1"
                  placeholder="60"
                  value={timeLimit}
                  onChange={e => setTimeLimit(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question-count">Number of Questions</Label>
                <Input
                  id="question-count"
                  required
                  type="number"
                  min="1"
                  max="500"
                  placeholder="200"
                  value={questionCount}
                  onChange={e => setQuestionCount(e.target.value)}
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">Max 500 questions per test</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-brand hover:opacity-90 border-0 text-white font-semibold"
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating {questionCount} Qs...</>
                ) : (
                  <><Plus className="mr-2 h-4 w-4" /> Create Test</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tests List */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm xl:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Existing Tests</CardTitle>
              </div>
              <Badge variant="secondary">{tests.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="pl-6">Title</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="pr-6 text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map(t => (
                    <TableRow key={t.id} className="border-border/30 hover:bg-secondary/30">
                      <TableCell className="pl-6 font-medium">{t.title}</TableCell>
                      <TableCell>
                        <Badge variant={t.classType === 'ABACUS' ? "info" : "success"}>
                          {t.classType.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Level {t.level}</Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1 text-muted-foreground text-sm">
                          <Clock className="w-3.5 h-3.5" />
                          {t.timeLimit}m
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {tests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No tests created yet. Create your first test!</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
