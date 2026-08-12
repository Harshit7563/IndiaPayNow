import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Card, Input, PageHeader } from '../../components/ui';

export default function UpiPin() {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (pin.length !== 6 || confirm.length !== 6) return toast.error('Enter a 6-digit UPI PIN');
    if (pin !== confirm) return toast.error('PINs do not match');
    toast.success('UPI PIN updated (demo — PIN is never stored in plain text)');
    setPin('');
    setConfirm('');
  };

  return (
    <div className="mx-auto max-w-xl fade-up">
      <PageHeader title="UPI PIN Management" subtitle="Set or change your UPI PIN. Never share it with anyone." />
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Input label="New UPI PIN" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} />
          <Input label="Confirm PIN" type="password" inputMode="numeric" value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))} />
          <Button type="submit" className="w-full">Save PIN</Button>
        </form>
      </Card>
    </div>
  );
}
