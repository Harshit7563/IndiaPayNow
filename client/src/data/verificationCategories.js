import {
  Activity,
  BadgeCheck,
  Building2,
  Car,
  CreditCard,
  FileScan,
  Fingerprint,
  FolderLock,
  Globe,
  IdCard,
  Landmark,
  Lock,
  MessageCircle,
  ScanFace,
  Smartphone,
  Stethoscope,
  Users,
  Video,
  Vote,
  Wallet,
} from 'lucide-react';

export function categoryPath(sectionId, categoryId) {
  const params = new URLSearchParams({ 'page-section-id': sectionId });
  if (categoryId) params.set('category', categoryId);
  return `/verification/categories?${params.toString()}`;
}

export function servicePath(categoryLabelOrId) {
  const { item } = findByCategoryParam(String(categoryLabelOrId));
  return `/verification/services/${item.id}`;
}

export function serviceDirectoryPath(categoryLabel) {
  return `/verification/services?category=${encodeURIComponent(categoryLabel)}`;
}

export function findByCategoryParam(value) {
  const wanted = decodeURIComponent(value || '').toLowerCase();
  for (const group of categoryGroups) {
    const item = group.items.find((i) => i.id === wanted || i.label.toLowerCase() === wanted);
    if (item) return { group, item };
  }
  return findCategory(categoryGroups[0].id, categoryGroups[0].items[0].id);
}

export function allCategoryLabels() {
  return categoryGroups.flatMap((g) => g.items.map((i) => i.label));
}

const locations = ['Pan India', 'Delhi NCR', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai'];

export function directoryRows(item) {
  return [
    `India Pay Now · ${item.label}`,
    `${item.label} primary check`,
    `${item.label} fallback`,
    `${item.label} sandbox`,
    `${item.label} partner rail`,
  ].map((name, i) => ({
    name,
    category: item.label,
    location: locations[i % locations.length],
  }));
}

export const categoryGroups = [
  {
    id: 'identity-verification',
    label: 'Identity Verification',
    icon: Fingerprint,
    count: '12 Categories',
    items: [
      {
        id: 'aadhaar',
        label: 'Aadhaar',
        icon: Fingerprint,
        description: 'Verify Aadhaar with checksum first, then OTP on the Aadhaar-linked mobile. Number is masked after success.',
        stats: [
          ['Typical time', '< 30s'],
          ['Fields checked', 'UID + OTP'],
          ['Used in', 'Full KYC'],
        ],
      },
      {
        id: 'pan',
        label: 'PAN',
        icon: IdCard,
        description: 'Validate the 10-character PAN, holder type, and name before tax, credit, or merchant products.',
        stats: [
          ['Typical time', '< 10s'],
          ['Fields checked', 'PAN + name'],
          ['Used in', 'KYC & credit'],
        ],
      },
      {
        id: 'voter-id',
        label: 'Voter ID',
        icon: Vote,
        description: 'Authenticate EPIC / voter ID as a second government photo ID when Aadhaar is not preferred.',
        stats: [
          ['Typical time', '< 20s'],
          ['Fields checked', 'EPIC + name'],
          ['Used in', 'Dual-ID KYC'],
        ],
      },
      {
        id: 'driving-license',
        label: 'Driving License',
        icon: Car,
        description: 'Validate DL number, name, and validity for real-time identity checks.',
        stats: [
          ['Typical time', '< 20s'],
          ['Fields checked', 'DL + DOB'],
          ['Used in', 'Photo ID KYC'],
        ],
      },
      {
        id: 'passport',
        label: 'Passport',
        icon: Globe,
        description: 'Confirm passport number and personal details for NRI and travel KYC.',
        stats: [
          ['Typical time', '< 25s'],
          ['Fields checked', 'Passport no.'],
          ['Used in', 'Premium KYC'],
        ],
      },
      {
        id: 'intl-passport',
        label: 'Intl. Passport',
        icon: Globe,
        description: 'Verify a non-Indian travel document for overseas or OCI-linked accounts.',
        stats: [
          ['Typical time', '< 25s'],
          ['Fields checked', 'MRZ / number'],
          ['Used in', 'NRI KYC'],
        ],
      },
      {
        id: 'aadhaar-okyc',
        label: 'Aadhaar OKYC',
        icon: Fingerprint,
        description: 'Offline KYC XML with user consent — UIDAI-style pack without sharing the full number on every screen.',
        stats: [
          ['Typical time', '< 45s'],
          ['Fields checked', 'OKYC XML'],
          ['Used in', 'Full KYC'],
        ],
      },
      {
        id: 'pan-verify',
        label: 'PAN Verify',
        icon: IdCard,
        description: 'Number, name, and status check against the Income Tax format.',
        stats: [
          ['Typical time', '< 10s'],
          ['Fields checked', 'PAN + name'],
          ['Used in', 'KYC'],
        ],
      },
      {
        id: 'ckyc-search',
        label: 'CKYC Search',
        icon: Users,
        description: 'Find an existing CKYC record so the user does not repeat KYC.',
        stats: [
          ['Typical time', '< 20s'],
          ['Fields checked', 'CKYC ref'],
          ['Used in', 'Reuse KYC'],
        ],
      },
      {
        id: 'ckyc-verify',
        label: 'CKYC Verify',
        icon: BadgeCheck,
        description: 'Match local KYC against CKYCR before raising limits.',
        stats: [
          ['Typical time', '< 20s'],
          ['Fields checked', 'Record match'],
          ['Used in', 'Limits'],
        ],
      },
      {
        id: 'full-kyc',
        label: 'Full KYC',
        icon: Fingerprint,
        description: 'PAN + Aadhaar + bank + face in one guided flow.',
        stats: [
          ['Typical time', '< 5 min'],
          ['Fields checked', 'Full pack'],
          ['Used in', 'Wallet upgrade'],
        ],
      },
      {
        id: 'video-kyc',
        label: 'Video KYC',
        icon: Video,
        description: 'Agent-assisted live session for cases that need a face-to-face check.',
        stats: [
          ['Typical time', '5–8 min'],
          ['Fields checked', 'Live video'],
          ['Used in', 'High KYC'],
        ],
      },
    ],
  },
  {
    id: 'business-verification',
    label: 'Business Verification',
    icon: Building2,
    count: '6 Categories',
    items: [
      {
        id: 'gstin',
        label: 'GSTIN',
        icon: Building2,
        description: 'Business GSTIN checksum and name match for merchant KYC.',
        stats: [
          ['Typical time', '< 15s'],
          ['Fields checked', 'GSTIN'],
          ['Used in', 'Merchant'],
        ],
      },
      {
        id: 'pan-comprehensive',
        label: 'PAN Comprehensive',
        icon: FileScan,
        description: 'Holder type and extra fields for merchants and companies.',
        stats: [
          ['Typical time', '< 15s'],
          ['Fields checked', 'Type + name'],
          ['Used in', 'Business KYC'],
        ],
      },
      {
        id: 'pan-206ab',
        label: 'PAN 206AB',
        icon: CreditCard,
        description: 'Specified-person TDS flag before you pay a vendor.',
        stats: [
          ['Typical time', '< 15s'],
          ['Fields checked', '206AB'],
          ['Used in', 'Payouts'],
        ],
      },
      {
        id: 'bank-account',
        label: 'Bank Account',
        icon: Landmark,
        description: 'Confirm account number and IFSC before settle, withdraw, or add a payout bank.',
        stats: [
          ['Typical time', '< 15s'],
          ['Fields checked', 'A/c + IFSC'],
          ['Used in', 'Settlements'],
        ],
      },
      {
        id: 'ifsc-lookup',
        label: 'IFSC Lookup',
        icon: Landmark,
        description: 'Bank name and branch fill in from the RBI directory.',
        stats: [
          ['Typical time', 'Instant'],
          ['Fields checked', 'IFSC'],
          ['Used in', 'Add bank'],
        ],
      },
      {
        id: 'pan-aadhaar-link',
        label: 'PAN–Aadhaar Link',
        icon: Fingerprint,
        description: 'Confirm PAN and Aadhaar are linked before settlements.',
        stats: [
          ['Typical time', '< 15s'],
          ['Fields checked', 'Link status'],
          ['Used in', 'Compliance'],
        ],
      },
    ],
  },
  {
    id: 'digilocker-apis',
    label: 'Digilocker APIs',
    icon: FolderLock,
    count: '5 Categories',
    items: [
      {
        id: 'digilocker',
        label: 'DigiLocker',
        icon: FolderLock,
        description: 'Import issued Aadhaar, PAN, DL, or RC with user consent.',
        stats: [
          ['Typical time', '< 45s'],
          ['Fields checked', 'Issued docs'],
          ['Used in', 'KYC import'],
        ],
      },
      {
        id: 'eaadhaar',
        label: 'eAadhaar',
        icon: IdCard,
        description: 'Import an issued eAadhaar PDF or XML instead of typing the 12-digit number.',
        stats: [
          ['Typical time', '< 20s'],
          ['Fields checked', 'XML / PDF'],
          ['Used in', 'Offline KYC'],
        ],
      },
      {
        id: 'aadhaar-xml',
        label: 'eAadhaar / XML',
        icon: FolderLock,
        description: 'Pull issued eAadhaar or XML after consent and map it to the profile.',
        stats: [
          ['Typical time', '< 30s'],
          ['Fields checked', 'Issued file'],
          ['Used in', 'Offline KYC'],
        ],
      },
      {
        id: 'ckyc-download',
        label: 'CKYC Download',
        icon: FolderLock,
        description: 'Pull the registered KYC pack after search and consent.',
        stats: [
          ['Typical time', '< 40s'],
          ['Fields checked', 'KYC pack'],
          ['Used in', 'Onboarding'],
        ],
      },
      {
        id: 'ckyc-upload',
        label: 'CKYC Upload',
        icon: FolderLock,
        description: 'Push a completed India Pay Now KYC pack to the registry.',
        stats: [
          ['Typical time', '< 1 min'],
          ['Fields checked', 'Upload pack'],
          ['Used in', 'Registry'],
        ],
      },
    ],
  },
  {
    id: 'document-ocr-apis',
    label: 'Document OCR APIs',
    icon: FileScan,
    count: '4 Categories',
    items: [
      {
        id: 'photo-id-ocr',
        label: 'Photo ID OCR',
        icon: FileScan,
        description: 'Extract name, number, and DOB from any photo ID so you do not have to type.',
        stats: [
          ['Typical time', '< 10s'],
          ['Fields checked', 'OCR extract'],
          ['Used in', 'All ID types'],
        ],
      },
      {
        id: 'address-ocr',
        label: 'Address OCR',
        icon: FileScan,
        description: 'Extract a full address block from any supported ID photo.',
        stats: [
          ['Typical time', '< 10s'],
          ['Fields checked', 'Address lines'],
          ['Used in', 'Profile'],
        ],
      },
      {
        id: 'address-proof',
        label: 'Address Proof',
        icon: FileScan,
        description: 'OCR address from Aadhaar, passport, or a utility-style ID.',
        stats: [
          ['Typical time', '< 15s'],
          ['Fields checked', 'Address OCR'],
          ['Used in', 'Profile'],
        ],
      },
      {
        id: 'qr-aadhaar',
        label: 'QR Aadhaar',
        icon: FileScan,
        description: 'Scan the QR on the Aadhaar card or eAadhaar to fill KYC fields.',
        stats: [
          ['Typical time', '< 15s'],
          ['Fields checked', 'QR payload'],
          ['Used in', 'Onboarding'],
        ],
      },
    ],
  },
  {
    id: 'liveness-face',
    label: 'Liveness Check / Face Match',
    icon: ScanFace,
    count: '2 Categories',
    items: [
      {
        id: 'liveness',
        label: 'Liveness',
        icon: ScanFace,
        description: 'Turn-head / blink prompt so a printed photo cannot pass Face Match.',
        stats: [
          ['Typical time', '< 8s'],
          ['Fields checked', 'Liveness'],
          ['Used in', 'Face Match'],
        ],
      },
      {
        id: 'face-match',
        label: 'Face Match',
        icon: ScanFace,
        description: 'Compare a live selfie with the ID photo for high-value or sensitive actions.',
        stats: [
          ['Typical time', '< 8s'],
          ['Fields checked', 'Selfie vs ID'],
          ['Used in', 'Device change'],
        ],
      },
    ],
  },
  {
    id: 'vehicle-rc',
    label: 'Vehicle RC Verification',
    icon: Car,
    count: '4 Categories',
    items: [
      {
        id: 'vehicle-rc',
        label: 'Vehicle RC',
        icon: Wallet,
        description: 'Verify registration certificate before FASTag, insurance, or vehicle payouts.',
        stats: [
          ['Typical time', '< 20s'],
          ['Fields checked', 'RC + owner'],
          ['Used in', 'Vehicle'],
        ],
      },
      {
        id: 'chassis-engine',
        label: 'Chassis / Engine',
        icon: Car,
        description: 'Match chassis and engine numbers on the RC before insurance or transfer.',
        stats: [
          ['Typical time', '< 20s'],
          ['Fields checked', 'CH + EN'],
          ['Used in', 'Insurance'],
        ],
      },
      {
        id: 'hypothecation',
        label: 'Hypothecation',
        icon: Landmark,
        description: 'Check if the vehicle is hypothecated to a financier before payouts.',
        stats: [
          ['Typical time', '< 15s'],
          ['Fields checked', 'HPA status'],
          ['Used in', 'Loan / sale'],
        ],
      },
      {
        id: 'rc-to-mobile',
        label: 'RC to Mobile',
        icon: Smartphone,
        description: 'Confirm the mobile linked to the RC for FASTag and insurance OTP flows.',
        stats: [
          ['Typical time', '< 15s'],
          ['Fields checked', 'Linked mobile'],
          ['Used in', 'FASTag'],
        ],
      },
    ],
  },
  {
    id: 'credit-report-apis',
    label: 'Credit Report APIs',
    icon: CreditCard,
    count: '3 Categories',
    items: [
      {
        id: 'credit-score',
        label: 'Credit Score',
        icon: BadgeCheck,
        description: 'PAN-based credit band before loans, cards, or merchant credit.',
        stats: [
          ['Typical time', '< 40s'],
          ['Fields checked', 'PAN + consent'],
          ['Used in', 'Lending'],
        ],
      },
      {
        id: 'credit-report',
        label: 'Credit Report',
        icon: FileScan,
        description: 'Full bureau report with accounts, enquiries, and payment history.',
        stats: [
          ['Typical time', '< 60s'],
          ['Fields checked', 'Bureau pack'],
          ['Used in', 'Underwriting'],
        ],
      },
      {
        id: 'commercial-credit',
        label: 'Commercial Credit',
        icon: Building2,
        description: 'Business bureau pull for GSTIN / company PAN before merchant credit.',
        stats: [
          ['Typical time', '< 60s'],
          ['Fields checked', 'GSTIN + PAN'],
          ['Used in', 'Merchant credit'],
        ],
      },
    ],
  },
  {
    id: 'health-apis',
    label: "Health API's",
    icon: Stethoscope,
    count: '3 Categories',
    items: [
      {
        id: 'abha',
        label: 'ABHA',
        icon: Stethoscope,
        description: 'Health ID for medical KYC and hospital onboarding flows.',
        stats: [
          ['Typical time', '< 20s'],
          ['Fields checked', 'ABHA no.'],
          ['Used in', 'Health KYC'],
        ],
      },
      {
        id: 'abha-address',
        label: 'ABHA Address',
        icon: Activity,
        description: 'Verify the ABHA address (username@abdm) before hospital or insurer linking.',
        stats: [
          ['Typical time', '< 15s'],
          ['Fields checked', 'ABHA address'],
          ['Used in', 'Hospital'],
        ],
      },
      {
        id: 'health-records',
        label: 'Health Records',
        icon: FolderLock,
        description: 'Fetch consented health records linked to ABHA for onboarding packs.',
        stats: [
          ['Typical time', '< 45s'],
          ['Fields checked', 'PHR pack'],
          ['Used in', 'Insurer KYC'],
        ],
      },
    ],
  },
  {
    id: 'other-apis',
    label: 'Other APIs',
    icon: Globe,
    count: '12 Categories',
    items: [
      {
        id: 'aadhaar-masking',
        label: 'Aadhaar Masking',
        icon: Lock,
        description: 'Show only the last 4 digits on receipts, tickets, and support screens.',
        stats: [
          ['Typical time', 'Instant'],
          ['Fields checked', 'Last 4'],
          ['Used in', 'All receipts'],
        ],
      },
      {
        id: 'data-vault',
        label: 'Data Vault',
        icon: Lock,
        description: 'Tokenise the Aadhaar number after verify so the raw UID is not stored in app logs.',
        stats: [
          ['Typical time', 'Instant'],
          ['Fields checked', 'Token'],
          ['Used in', 'Storage'],
        ],
      },
      {
        id: 'aadhaar-vintage',
        label: 'Aadhaar Vintage',
        icon: BadgeCheck,
        description: 'See how long the Aadhaar number has existed before you raise limits.',
        stats: [
          ['Typical time', '< 15s'],
          ['Fields checked', 'Issue age'],
          ['Used in', 'Risk checks'],
        ],
      },
      {
        id: 'aadhaar-to-pan',
        label: 'Aadhaar to PAN',
        icon: IdCard,
        description: 'Confirm the PAN linked to Aadhaar before payouts or tax products.',
        stats: [
          ['Typical time', '< 15s'],
          ['Fields checked', 'Link status'],
          ['Used in', 'Compliance'],
        ],
      },
      {
        id: 'pan-masking',
        label: 'PAN Masking',
        icon: Lock,
        description: 'Hide middle characters on UI, statements, and support tickets.',
        stats: [
          ['Typical time', 'Instant'],
          ['Fields checked', 'Masked PAN'],
          ['Used in', 'Display'],
        ],
      },
      {
        id: 'pan-to-aadhaar',
        label: 'PAN to Aadhaar',
        icon: IdCard,
        description: 'Reverse lookup of the linked Aadhaar where regulation allows.',
        stats: [
          ['Typical time', '< 15s'],
          ['Fields checked', 'Linked UID'],
          ['Used in', 'Reconciliation'],
        ],
      },
      {
        id: 'pan-validation',
        label: 'PAN Validation',
        icon: BadgeCheck,
        description: 'Format-only pre-check before OTP or a full lookup.',
        stats: [
          ['Typical time', 'Instant'],
          ['Fields checked', '10 chars'],
          ['Used in', 'Forms'],
        ],
      },
      {
        id: 'dob-by-pan',
        label: 'DOB by PAN',
        icon: IdCard,
        description: 'Match date of birth to the PAN record where the flow allows it.',
        stats: [
          ['Typical time', '< 10s'],
          ['Fields checked', 'DOB'],
          ['Used in', 'Age KYC'],
        ],
      },
      {
        id: 'age-check',
        label: 'Age Check',
        icon: BadgeCheck,
        description: '18+ / 21+ from DOB on the verified ID.',
        stats: [
          ['Typical time', 'Instant'],
          ['Fields checked', 'DOB'],
          ['Used in', 'Products'],
        ],
      },
      {
        id: 'whatsapp-kyc',
        label: 'WhatsApp KYC',
        icon: MessageCircle,
        description: 'Guided Aadhaar KYC in chat. Still never asks for UPI PIN.',
        stats: [
          ['Typical time', '< 2 min'],
          ['Fields checked', 'Chat + OTP'],
          ['Used in', 'Remote KYC'],
        ],
      },
      {
        id: 'ration-card',
        label: 'Ration Card',
        icon: CreditCard,
        description: 'Household ID for welfare or address-linked KYC.',
        stats: [
          ['Typical time', '< 20s'],
          ['Fields checked', 'Card no.'],
          ['Used in', 'Address'],
        ],
      },
      {
        id: 'eshram',
        label: 'E-Shram',
        icon: Smartphone,
        description: 'Unorganised-worker ID as an additional identity document.',
        stats: [
          ['Typical time', '< 20s'],
          ['Fields checked', 'UAN'],
          ['Used in', 'Worker KYC'],
        ],
      },
    ],
  },
];

export function listingCount(item) {
  let n = 0;
  for (const c of item.id) n += c.charCodeAt(0);
  return 8 + (n % 90);
}

export function groupListingCount(group) {
  return group.items.reduce((sum, item) => sum + listingCount(item), 0);
}

export function findCategory(sectionId, categoryId) {
  const group = categoryGroups.find((g) => g.id === sectionId) || categoryGroups[0];
  const item = group.items.find((i) => i.id === categoryId) || group.items[0];
  return { group, item };
}

export function getServiceStory(item, group) {
  const [time, fields, used] = item.stats;
  return {
    steps: [
      {
        n: '01',
        title: 'Collect with consent',
        text: `Capture the ${item.label} details inside a signed-in flow. Consent is stored with the request id.`,
      },
      {
        n: '02',
        title: 'Run the check',
        text: item.description,
      },
      {
        n: '03',
        title: 'Return a masked result',
        text: `Typical time ${time[1]}. ${fields[1]} is confirmed, then the raw number is masked on receipts and logs.`,
      },
    ],
    highlights: [
      ['Typical time', time[1]],
      ['Fields checked', fields[1]],
      ['Used in', used[1]],
      ['Section', group.label],
    ],
    uses: [
      `${used[1]} on India Pay Now`,
      `Merchant and business onboarding in ${group.label}`,
      'Sandbox first, then live with the same request shape',
      'Webhook + status poll after the check completes',
    ],
    faqs: [
      {
        q: `What does ${item.label} verify?`,
        a: item.description,
      },
      {
        q: 'How fast is it?',
        a: `Typical time is ${time[1]}. Sandbox uses the same path with mock responses.`,
      },
      {
        q: 'Is the full number stored?',
        a: 'No. After success, only masked last-4 / tokenised values are shown on receipts and support screens.',
      },
    ],
  };
}
