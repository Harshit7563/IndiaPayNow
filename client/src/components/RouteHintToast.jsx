import toast from 'react-hot-toast';
import { AlertCircle, BriefcaseBusiness, Info, Smartphone, Sparkles, Wallet, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const kindStyles = {
  business: { wrap: 'bg-[#eef5ff] text-[#0070ba]', Icon: BriefcaseBusiness },
  wallet: { wrap: 'bg-[#ecfdf5] text-emerald-600', Icon: Wallet },
  plan: { wrap: 'bg-[#eef5ff] text-[#0070ba]', Icon: Sparkles },
  mobile: { wrap: 'bg-[#e8f0ff] text-[#0b5cff]', Icon: Smartphone },
  error: { wrap: 'bg-red-50 text-red-600', Icon: AlertCircle },
  info: { wrap: 'bg-slate-100 text-slate-600', Icon: Info },
};

/**
 * Branded app toast card (hints, validation, route tips).
 */
export function showAppToast({
  kind = 'info',
  title,
  message,
  action,
  duration = 4500,
}) {
  const style = kindStyles[kind] || kindStyles.info;
  const Icon = style.Icon;

  return toast.custom(
    (t) => (
      <div
        className={`pointer-events-auto w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/90 ${
          t.visible ? 'popup-panel' : 'opacity-0'
        }`}
      >
        <div
          className={`h-1 w-full ${
            kind === 'error'
              ? 'bg-gradient-to-r from-red-500 via-rose-400 to-orange-300'
              : 'bg-gradient-to-r from-[#0070ba] via-[#00baf2] to-[#5ba3d9]'
          }`}
        />
        <div className="flex gap-3 p-4">
          <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.wrap}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-sm font-extrabold text-[#111]">{title}</p>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => toast.dismiss(t.id)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {message ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{message}</p> : null}
            {action ? (
              action.to ? (
                <Link
                  to={action.to}
                  onClick={() => toast.dismiss(t.id)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#0070ba] px-3.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#003087]"
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    action.onClick?.();
                    toast.dismiss(t.id);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#0070ba] px-3.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#003087]"
                >
                  {action.label}
                </button>
              )
            ) : null}
          </div>
        </div>
      </div>
    ),
    { duration, position: 'top-center' }
  );
}

/** @deprecated use showAppToast — kept for login imports */
export function showRouteHintToast(opts) {
  return showAppToast(opts);
}

export function showMismatchToast(user, intent) {
  if (!intent || !user) return false;

  if (intent === 'business' && user.role === 'user') {
    showAppToast({
      kind: 'business',
      title: 'Personal account',
      message: 'This login is for a personal wallet. Enable business tools to open the merchant dashboard.',
      action: { label: 'Open Merchant Hub', to: '/app/merchant' },
      duration: 5500,
    });
    return true;
  }

  if (intent === 'personal' && user.role === 'merchant') {
    showAppToast({
      kind: 'wallet',
      title: 'Personal wallet opened',
      message: 'You’re in your personal wallet. Merchant tools are in Business from the sidebar.',
      action: { label: 'Go to Business', to: '/business' },
      duration: 5500,
    });
    return true;
  }

  return false;
}

export function showPickPlanToast({ isMobile = true, onViewPlans } = {}) {
  return showAppToast({
    kind: isMobile ? 'mobile' : 'plan',
    title: isMobile ? 'Pick a recharge plan' : 'Pick an option',
    message: isMobile
      ? 'Popular recharges are ready below. Tap a plan to fill the amount, then pay.'
      : 'Popular options are ready below. Tap one to continue.',
    action: onViewPlans
      ? {
          label: 'View plans',
          onClick: onViewPlans,
        }
      : undefined,
    duration: 4500,
  });
}
