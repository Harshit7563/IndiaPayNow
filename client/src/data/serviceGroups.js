import {
  Bus,
  Car,
  Droplets,
  FileWarning,
  Flame,
  Hotel,
  Landmark,
  Plane,
  ShieldCheck,
  Smartphone,
  TrainFront,
  Tv,
  Wifi,
  Zap,
} from 'lucide-react';

export const serviceGroups = {
  travel: {
    id: 'travel',
    brand: 'Travel',
    subtitle: 'Search, compare, and pay securely from your India Pay Now wallet.',
    tabs: [
      { id: 'flight', label: 'Flights', Icon: Plane },
      { id: 'bus', label: 'Bus', Icon: Bus },
      { id: 'train', label: 'Trains', Icon: TrainFront },
      { id: 'hotel', label: 'Hotels', Icon: Hotel },
    ],
  },
  recharge: {
    id: 'recharge',
    brand: 'Recharge',
    subtitle: 'Pick a plan or top-up and pay securely from your India Pay Now wallet.',
    tabs: [
      { id: 'mobile', label: 'Mobile', Icon: Smartphone },
      { id: 'dth', label: 'DTH', Icon: Tv },
      { id: 'fastag', label: 'FASTag', Icon: Car },
      { id: 'broadband', label: 'Broadband', Icon: Wifi },
    ],
  },
  utilities: {
    id: 'utilities',
    brand: 'Bills',
    subtitle: 'Fetch bills and pay securely from your India Pay Now wallet.',
    tabs: [
      { id: 'electricity', label: 'Electricity', Icon: Zap },
      { id: 'water', label: 'Water', Icon: Droplets },
      { id: 'piped-gas', label: 'Piped Gas', Icon: Flame },
      { id: 'cylinder', label: 'Cylinder', Icon: Flame },
    ],
  },
  finance: {
    id: 'finance',
    brand: 'Finance',
    subtitle: 'Pay EMIs, premiums, and challans securely from your India Pay Now wallet.',
    tabs: [
      { id: 'loan', label: 'Loan EMI', Icon: Landmark },
      { id: 'insurance', label: 'Insurance', Icon: ShieldCheck },
      { id: 'challan', label: 'Challan', Icon: FileWarning },
    ],
  },
};

const serviceToGroup = Object.fromEntries(
  Object.values(serviceGroups).flatMap((group) => group.tabs.map((tab) => [tab.id, group.id]))
);

export function getServiceGroup(serviceId) {
  const groupId = serviceToGroup[serviceId] || 'recharge';
  return serviceGroups[groupId] || serviceGroups.recharge;
}
