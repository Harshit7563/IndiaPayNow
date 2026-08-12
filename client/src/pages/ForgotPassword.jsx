import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '../components/ui';
import { Logo } from '../components/Logo';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (!identifier.trim()) {
      toast.error('Enter your registered email or mobile');
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Demo reset request received');
    }, 500);
  };

  return (
    <div className="gradient-brand flex min-h-screen flex-col">
      <header className="px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/"><Logo /></Link>
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-600">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-6">
        <Card className="fade-up w-full max-w-md p-6 sm:p-8">
          {!submitted ? (
            <>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <KeyRound className="h-7 w-7" />
              </div>
              <h1 className="font-display text-3xl font-bold text-navy-900">Forgot your password?</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                No worries. Enter the email address or mobile number linked to your account and we&apos;ll
                help you reset it.
              </p>

              <form onSubmit={submit} className="mt-7 space-y-5">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-[42px] h-4 w-4 text-slate-400" />
                  <Input
                    label="Email or mobile number"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="you@example.com or 9876543210"
                    autoComplete="username"
                    className="[&_input]:pl-10"
                  />
                </div>
                <Button type="submit" loading={loading} className="w-full py-3.5">
                  Send reset instructions
                </Button>
              </form>

              <div className="mt-6 flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <p className="text-xs leading-5 text-slate-500">
                  For your security, reset links expire shortly after they are issued.
                </p>
              </div>
            </>
          ) : (
            <div className="py-4 text-center">
              <div className="success-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h1 className="mt-6 font-display text-3xl font-bold text-navy-900">Check your inbox</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                In a production environment, password reset instructions would be sent to{' '}
                <span className="font-semibold text-navy-800">{identifier}</span>.
              </p>
              <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-brand-700">
                This is a demo — no email or SMS was sent.
              </div>
              <Link to="/login" className="mt-7 block">
                <Button className="w-full py-3.5">
                  <ArrowLeft className="h-4 w-4" /> Return to login
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Try another email or mobile
              </button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
