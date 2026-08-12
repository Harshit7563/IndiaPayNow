export function Logo({ size = 'md', showText = true, className = '' }) {
  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  if (!showText) {
    return (
      <span className={`font-display font-bold tracking-tight text-navy-900 ${textSizes[size]} ${className}`}>
        India Pay Now
      </span>
    );
  }

  return (
    <div className={`leading-tight ${className}`}>
      <div className={`font-display font-bold tracking-tight text-navy-900 ${textSizes[size]}`}>India Pay Now</div>
      {size !== 'sm' && (
        <div className="text-[11px] font-medium text-slate-500">Payments Made Simple</div>
      )}
    </div>
  );
}
