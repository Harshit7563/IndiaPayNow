import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import api from '../services/api';
import { formatDate } from '../utils/format';

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      const res = await api.get('/notifications');
      setItems(res.data.data || []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unread = items.filter((n) => !n.is_read).length;

  const markAll = async () => {
    await api.put('/notifications/read-all');
    load();
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          load();
        }}
        className="relative rounded-full p-2 text-[#002970] hover:bg-slate-100"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />}
      </button>
      {open && (
        <>
          <button className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <span className="font-bold text-[#002970]">Notifications</span>
              <button onClick={markAll} className="text-xs font-bold text-[#00baf2]">
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-500">No notifications</p>
              ) : (
                items.map((n) => (
                  <div key={n.id} className={`border-b border-slate-50 px-4 py-3 ${n.is_read ? '' : 'bg-sky-50'}`}>
                    <p className="text-sm font-bold text-[#002970]">{n.title}</p>
                    <p className="text-xs text-slate-500">{n.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{formatDate(n.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
