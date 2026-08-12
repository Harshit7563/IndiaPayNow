import { Power } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button } from '../../components/ui';
import AdminResource from './_AdminResource';

export default function Users() {
  const toggle = async (user, load) => { try { await api.post(`/admin/users/${user.id}/toggle`); toast.success(`User ${user.isActive ?? user.active ? 'disabled' : 'enabled'}`); load(); } catch { toast.error('Could not update user'); } };
  return <AdminResource title="Users" subtitle="Manage platform user access" endpoint="/admin/users" keys={['users']} columns={[{ label: 'Name', keys: ['fullName', 'name'] }, { label: 'Email', key: 'email' }, { label: 'Mobile', keys: ['mobile', 'phone'] }, { label: 'Role', key: 'role' }, { label: 'Status', keys: ['status', 'isActive', 'active'], type: 'status' }, { label: 'Joined', keys: ['createdAt', 'created_at'], type: 'date' }]} renderActions={(user, load) => <Button variant={user.isActive ?? user.active ? 'danger' : 'soft'} className="!px-3 !py-2 text-xs" onClick={() => toggle(user, load)}><Power className="h-4 w-4" /> {user.isActive ?? user.active ? 'Disable' : 'Enable'}</Button>} />;
}
