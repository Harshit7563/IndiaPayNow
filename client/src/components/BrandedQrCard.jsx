import { QRCodeSVG } from 'qrcode.react';

export function BrandedQrCard({
  value,
  businessName = 'Merchant',
  amountLabel = '',
  note = '',
  typeLabel = 'Payment QR',
  headline = 'Scan & Pay',
  footerApps = 'UPI · GPay · PhonePe · Paytm · BHIM',
  size = 200,
  qrRef,
}) {
  return (
    <div
      ref={qrRef}
      className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[28px] border border-slate-100 bg-white text-center shadow-[0_18px_40px_rgba(0,28,100,0.12)]"
    >
      <div className="bg-gradient-to-br from-[#0070ba] to-[#003087] px-5 py-5 text-white">
        <p className="font-display text-lg font-extrabold tracking-tight">India Pay Now</p>
        <p className="mt-0.5 text-[11px] font-medium text-blue-100">Payments Made Simple</p>
      </div>

      <div className="px-5 pb-5 pt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0070ba]">{headline}</p>
        <h3 className="mt-1 font-display text-xl font-extrabold text-[#001c64]">{businessName}</h3>
        <p className="mt-0.5 text-xs capitalize text-slate-500">{typeLabel}</p>

        <div className="mx-auto mt-4 inline-block rounded-2xl border border-slate-200 bg-white p-3">
          <QRCodeSVG value={value} size={size} level="H" fgColor="#0b1f3a" includeMargin />
        </div>

        {amountLabel ? (
          <p className="mt-4 font-display text-2xl font-extrabold text-[#001c64]">{amountLabel}</p>
        ) : null}
        <p className={`text-sm text-slate-500 ${amountLabel ? 'mt-1' : 'mt-4'}`}>
          {note || 'Scan with any UPI app'}
        </p>
      </div>

      <div className="bg-[#001c64] px-4 py-3">
        <p className="text-[11px] font-semibold tracking-wide text-blue-200">{footerApps}</p>
      </div>
    </div>
  );
}
