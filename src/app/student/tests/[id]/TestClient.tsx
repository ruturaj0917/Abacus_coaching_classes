import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TestClient({ test, questions }: { test: any, questions: any[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(test.timeLimit * 60);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = sessionStorage.getItem(`test_${test.id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setAnswers(parsed.answers || {});
      const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
      const remaining = Math.max((test.timeLimit * 60) - elapsed, 0);
      setTimeLeft(remaining);
      if (remaining === 0 && !submitting) {
        handleSubmit(parsed.answers, remaining);
      }
    } else {
      sessionStorage.setItem(`test_${test.id}`, JSON.stringify({
        startTime: Date.now(),
        answers: {}
      }));
    }
  }, [test.id, test.timeLimit]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!submitting) handleSubmit(answers, 0);
      return;
    }
    const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, submitting, answers]);

  const handleOptionSelect = (qId: string, val: string) => {
    const newAnswers = { ...answers, [qId]: val };
    setAnswers(newAnswers);
    const saved = JSON.parse(sessionStorage.getItem(`test_${test.id}`) || "{}");
    sessionStorage.setItem(`test_${test.id}`, JSON.stringify({ ...saved, answers: newAnswers }));
  };

  const handleSubmit = async (finalAnswers = answers, finalTime = timeLeft) => {
    if (submitting) return;

    // Add confirmation if submitting manually
    if (finalTime > 0) {
      if (!window.confirm("Are you sure you want to end the test now? Your progress will be saved and the test will be closed.")) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/student/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: test.id,
          answers: finalAnswers,
          timeTaken: (test.timeLimit * 60) - finalTime
        })
      });
      if (res.ok) {
        sessionStorage.removeItem(`test_${test.id}`);
        router.push('/student/dashboard');
        router.refresh();
      } else {
        alert("Submission failed. Try again.");
        setSubmitting(false);
      }
    } catch (e) {
      alert("Error submitting. Please try again.");
      setSubmitting(false);
    }
  };

  if (!questions || questions.length === 0) return <div>No questions in this test!</div>;

  const q = questions[currentIdx];
  const options = q.options ? JSON.parse(q.options) : [];

  return (
    <div className="max-w-3xl mx-auto bg-card border border-border/50 p-4 md:p-8 rounded-2xl shadow-xl sidebar-glow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-border/50">
        <h2 className="text-xl md:text-2xl font-bold text-foreground line-clamp-1">{test.title}</h2>
        <div className={cn(
          "text-2xl md:text-3xl font-mono font-black tabular-nums transition-colors px-3 py-1 rounded-lg bg-secondary/50",
          timeLeft < 60 ? "text-destructive animate-pulse" : "text-primary"
        )}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Question <span className="text-foreground">{currentIdx + 1}</span> of {questions.length}
          </p>
          <div className="h-1.5 w-24 md:w-32 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        
        <h3 className="text-xl md:text-2xl mb-6 font-semibold leading-relaxed">{q.questionText}</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {options.map((opt: string, idx: number) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(q.id, opt)}
              className={cn(
                "group relative text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 active:scale-[0.98]",
                answers[q.id] === opt 
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-lg shadow-primary/5" 
                  : "border-border/50 bg-secondary/30 hover:bg-secondary/50 hover:border-border"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                  answers[q.id] === opt ? "border-primary bg-primary" : "border-muted-foreground/30"
                )}>
                  {answers[q.id] === opt && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className={cn(
                   "text-base md:text-lg font-medium",
                   answers[q.id] === opt ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {opt}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-border/50">
        <Button 
          variant="outline"
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
          className="order-2 sm:order-1 h-11 md:h-12 px-6 md:px-8 border-border/50 hover:bg-secondary"
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-3 order-1 sm:order-2 w-full sm:w-auto">
          <Button 
            variant="destructive"
            onClick={() => handleSubmit()}
            disabled={submitting}
            className="flex-1 sm:flex-none h-11 md:h-12 px-6 md:px-8 font-bold shadow-lg shadow-destructive/20 min-w-[120px]"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              'End Test'
            )}
          </Button>

          <Button 
            onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIdx === questions.length - 1}
            className="flex-1 sm:flex-none h-11 md:h-12 px-6 md:px-10 gradient-brand hover:opacity-90 border-0 text-white font-bold shadow-lg shadow-primary/20"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
