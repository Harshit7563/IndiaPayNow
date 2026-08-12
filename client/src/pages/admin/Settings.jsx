import { useEffect, useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Card, EmptyState, PageHeader, Skeleton } from '../../components/ui';

const label = (key) => key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
export default function Settings() {
  const [settings, setSettings] = useState(null);
  useEffect(() => { api.get('/admin/settings').then(({ data }) => setSettings(data.data || data)).catch(() => toast.error('Could not load platform settings')); }, []);
  return <div><PageHeader title="Platform settings" subtitle="Current India Pay Now operational configuration" />{!settings ? <Skeleton className="h-80" /> : Object.keys(settings).length ? <div className="grid gap-4 md:grid-cols-2">{Object.entries(settings).map(([key, value]) => <Card key={key}><p className="text-sm text-slate-500">{label(key)}</p><p className="mt-2 break-words font-semibold text-navy-900">{typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : typeof value === 'object' ? JSON.stringify(value) : String(value)}</p></Card>)}</div> : <Card><EmptyState icon={SettingsIcon} title="No settings returned" /></Card>}</div>;
}
