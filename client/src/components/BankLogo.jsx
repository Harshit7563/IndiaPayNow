import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';

export function BankLogo({ bank, size = 'md', className = '' }) {
  const [stage, setStage] = useState(0); // 0 = primary logo, 1 = fallback svg, 2 = initials
  useEffect(() => {
    setStage(0);
  }, [bank?.id, bank?.logo]);

  const sizes = {
    sm: 'h-10 w-10 text-[10px]',
    md: 'h-12 w-12 text-xs',
    lg: 'h-14 w-14 text-sm',
  };
  const imgSizes = {
    sm: 'h-6 w-6',
    md: 'h-7 w-7',
    lg: 'h-8 w-8',
  };
  const box = sizes[size] || sizes.md;
  const img = imgSizes[size] || imgSizes.md;
  const color = bank?.color || '#0070ba';
  const label = (bank?.shortName || bank?.name || 'Bank').slice(0, 4).toUpperCase();

  const primary = bank?.logo;
  const fallback = bank?.logoFallback || (bank?.id ? `/logos/banks/${bank.id}.svg` : null);
  const src = stage === 0 ? primary : stage === 1 ? fallback : null;

  if (src) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 ${box} ${className}`}
      >
        <img
          src={src}
          alt={bank?.name || 'Bank'}
          className={`${stage === 0 ? img : 'h-full w-full'} object-contain`}
          onError={() => setStage((s) => Math.min(s + 1, 2))}
        />
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-2xl font-extrabold text-white shadow-sm ${box} ${className}`}
      style={{ background: color }}
      title={bank?.name}
    >
      {bank ? label.slice(0, 3) : <Building2 className="h-5 w-5" />}
    </span>
  );
}
