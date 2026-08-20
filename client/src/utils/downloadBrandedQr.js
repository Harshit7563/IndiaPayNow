const escapeXml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const extractQrInner = (qrSvg) => {
  if (!qrSvg) return { size: 220, body: '' };
  const clone = qrSvg.cloneNode(true);
  const size = Number(clone.getAttribute('width') || clone.getAttribute('height') || 220);
  clone.removeAttribute('xmlns');
  clone.removeAttribute('width');
  clone.removeAttribute('height');
  const body = Array.from(clone.childNodes)
    .map((node) => new XMLSerializer().serializeToString(node))
    .join('');
  return { size, body };
};

export function buildBrandedQrSvg({
  qrSvg,
  businessName = 'Merchant',
  amountLabel = '',
  note = '',
  typeLabel = 'Payment QR',
  headline = 'SCAN & PAY',
  footerApps = 'UPI · GPay · PhonePe · Paytm · BHIM',
}) {
  const { size, body } = extractQrInner(qrSvg);
  const width = 420;
  const qrBox = 280;
  const qrScale = qrBox / size;
  const qrX = (width - qrBox) / 2;
  const hasAmount = Boolean(amountLabel);
  const hasNote = Boolean(note);
  const height = hasAmount || hasNote ? 620 : 560;

  const amountBlock = hasAmount
    ? `<text x="210" y="500" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="28" font-weight="800" fill="#001c64">${escapeXml(amountLabel)}</text>`
    : '';
  const noteY = hasAmount ? 532 : 500;
  const noteBlock = hasNote
    ? `<text x="210" y="${noteY}" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="13" fill="#64748b">${escapeXml(note)}</text>`
    : !hasAmount
      ? `<text x="210" y="500" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="13" fill="#64748b">Scan with any UPI app</text>`
      : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="ipnHeader" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0070ba"/>
      <stop offset="100%" stop-color="#003087"/>
    </linearGradient>
    <filter id="cardShadow" x="-8%" y="-6%" width="116%" height="118%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#001c64" flood-opacity="0.14"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" rx="28" fill="#f4f8fc"/>
  <rect x="18" y="18" width="384" height="${height - 36}" rx="24" fill="#ffffff" filter="url(#cardShadow)"/>
  <path d="M18 42 C18 28.7 28.7 18 42 18 H378 C391.3 18 402 28.7 402 42 V118 H18 Z" fill="url(#ipnHeader)"/>
  <text x="210" y="58" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="22" font-weight="800" fill="#ffffff">India Pay Now</text>
  <text x="210" y="82" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="12" fill="#dbeafe">Payments Made Simple</text>
  <text x="210" y="150" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="12" font-weight="700" letter-spacing="1.6" fill="#0070ba">${escapeXml(headline)}</text>
  <text x="210" y="178" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="20" font-weight="800" fill="#001c64">${escapeXml(businessName)}</text>
  <text x="210" y="200" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="12" fill="#64748b">${escapeXml(typeLabel)}</text>
  <rect x="${qrX - 16}" y="220" width="${qrBox + 32}" height="${qrBox + 32}" rx="22" fill="#ffffff" stroke="#e2e8f0"/>
  <g transform="translate(${qrX}, 236) scale(${qrScale})">${body}</g>
  ${amountBlock}
  ${noteBlock}
  <path d="M18 ${height - 70} H402 V${height - 42} C402 ${height - 28.7} 391.3 ${height - 18} 378 ${height - 18} H42 C28.7 ${height - 18} 18 ${height - 28.7} 18 ${height - 42} Z" fill="#001c64"/>
  <text x="210" y="${height - 36}" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="11" font-weight="600" fill="#bfdbfe">${escapeXml(footerApps)}</text>
</svg>`;
}

export async function downloadBrandedQr({
  qrSvg,
  businessName,
  amountLabel,
  note,
  typeLabel,
  headline,
  footerApps,
  fileName = 'india-pay-now-qr',
  format = 'png',
}) {
  const svg = buildBrandedQrSvg({
    qrSvg,
    businessName,
    amountLabel,
    note,
    typeLabel,
    headline,
    footerApps,
  });
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });

  if (format === 'svg') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const url = URL.createObjectURL(blob);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.fillStyle = '#f4f8fc';
    ctx.fillRect(0, 0, image.width, image.height);
    ctx.drawImage(image, 0, 0);
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `${fileName}.png`;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function printBrandedQr({
  qrSvg,
  businessName,
  amountLabel,
  note,
  typeLabel,
  headline,
  footerApps,
}) {
  const svg = buildBrandedQrSvg({
    qrSvg,
    businessName,
    amountLabel,
    note,
    typeLabel,
    headline,
    footerApps,
  });
  const popup = window.open('', '_blank', 'noopener,noreferrer,width=520,height=760');
  if (!popup) {
    throw new Error('Popup blocked');
  }

  popup.document.open();
  popup.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>India Pay Now QR</title>
  <style>
    @page { margin: 12mm; size: auto; }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sheet {
      width: 420px;
      max-width: 100%;
    }
    .sheet svg {
      display: block;
      width: 100%;
      height: auto;
    }
    @media print {
      html, body { background: #ffffff; }
      .sheet { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="sheet">${svg.replace('<?xml version="1.0" encoding="UTF-8"?>', '')}</div>
  <script>
    window.onload = function () {
      setTimeout(function () {
        window.focus();
        window.print();
      }, 150);
    };
    window.onafterprint = function () {
      window.close();
    };
  </script>
</body>
</html>`);
  popup.document.close();
}
