"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
    <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
        <h2>{test.title}</h2>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: timeLeft < 60 ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '1rem' }}>Question {currentIdx + 1} of {questions.length}</p>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{q.questionText}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {options.map((opt: string, idx: number) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(q.id, opt)}
              style={{
                textAlign: 'left',
                padding: '1rem',
                borderRadius: 'var(--border-radius-md)',
                border: `2px solid ${answers[q.id] === opt ? 'var(--brand-primary)' : 'var(--border-light)'}`,
                background: answers[q.id] === opt ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                cursor: 'pointer',
                fontSize: '1.1rem'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
        <button 
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
          style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-light)', background: 'transparent', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer' }}
        >
          Previous
        </button>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => handleSubmit()}
            disabled={submitting}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--border-radius-md)', border: 'none', background: 'var(--accent-danger)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>

          <button 
            onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIdx === questions.length - 1}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--border-radius-md)', border: 'none', background: 'var(--brand-primary)', color: 'white', cursor: currentIdx === questions.length - 1 ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
