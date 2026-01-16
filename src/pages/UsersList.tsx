import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCongregations } from '../hooks/useCongregations';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Users, Shield, CheckCircle, XCircle, Loader2, Pencil, Key } from 'lucide-react';


interface Profile {
    id: string;
    email: string;
    role: string;
    approved: boolean; // Keep for compatibility
    status: 'pending' | 'approved' | 'rejected';
    congregation?: string;
    created_at: string;
    last_sign_in_at?: string;
}

export default function UsersList() {
    const { isAdmin, user: currentUser } = useAuth();
    const { congregations } = useCongregations();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Edit Modal State
    const [editingUser, setEditingUser] = useState<Profile | null>(null);
    const [editForm, setEditForm] = useState({
        congregation: '',
        role: 'user'
    });
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (userId: string, newStatus: string) => {
        setActionLoading(userId);
        try {
            const { error } = await supabase.rpc('update_user_status', { target_id: userId, new_status: newStatus });
            if (error) throw error;

            setUsers(users.map(u =>
                u.id === userId
                    ? {
                        ...u,
                        status: newStatus as any,
                        approved: newStatus === 'approved'
                    }
                    : u
            ));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Erro ao atualizar status.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleResetPassword = async (email: string) => {
        if (!confirm(`Tem certeza que deseja enviar um email de redefinição de senha para ${email}?`)) return;

        setActionLoading(email); // Use email as loading key for this action
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });
            if (error) throw error;
            alert(`Email de redefinição enviado com sucesso para ${email}`);
        } catch (error: any) {
            console.error('Error sending reset email:', error);
            alert(`Erro ao enviar email: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleEditClick = (user: Profile) => {
        setEditingUser(user);
        setEditForm({
            congregation: user.congregation || '',
            role: user.role || 'user'
        });
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        setSaveLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    congregation: editForm.congregation,
                    role: editForm.role
                })
                .eq('id', editingUser.id);

            if (error) throw error;

            // Update local state
            setUsers(users.map(u =>
                u.id === editingUser.id
                    ? { ...u, congregation: editForm.congregation, role: editForm.role }
                    : u
            ));

            setEditingUser(null);
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Erro ao salvar alterações.');
        } finally {
            setSaveLoading(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
                <Shield className="w-12 h-12 mb-4 text-red-400" />
                <h2 className="text-xl font-bold text-slate-900">Acesso Restrito</h2>
                <p>Você não tem permissão para visualizar esta página.</p>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <div className="flex items-center text-green-600 gap-1 bg-green-50 px-2 py-1 rounded-full w-fit">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-xs font-medium">Ativo</span>
                    </div>
                );
            case 'rejected':
                return (
                    <div className="flex items-center text-red-600 gap-1 bg-red-50 px-2 py-1 rounded-full w-fit">
                        <XCircle className="w-3 h-3" />
                        <span className="text-xs font-medium">Bloqueado</span>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center text-amber-600 gap-1 bg-amber-50 px-2 py-1 rounded-full w-fit">
                        <Loader2 className="w-3 h-3" />
                        <span className="text-xs font-medium">Pendente</span>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Usuários</h2>
                <p className="text-slate-500">Gerenciamento de usuários e acessos.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Usuários ({users.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="p-4 font-medium text-slate-600">Email</th>
                                        <th className="p-4 font-medium text-slate-600">Congregação</th>
                                        <th className="p-4 font-medium text-slate-600">Último Acesso</th>
                                        <th className="p-4 font-medium text-slate-600">Função</th>
                                        <th className="p-4 font-medium text-slate-600">Status</th>
                                        <th className="p-4 font-medium text-slate-600 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50">
                                            <td className="p-4 font-medium text-slate-900">
                                                {user.email}
                                                {user.id === currentUser?.id && (
                                                    <span className="ml-2 text-xs text-slate-400 bg-slate-100 px-1 rounded border">(Você)</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {user.congregation || '-'}
                                            </td>
                                            <td className="p-4 text-slate-600 text-xs">
                                                {user.last_sign_in_at
                                                    ? new Date(user.last_sign_in_at).toLocaleString()
                                                    : <span className="text-slate-400 italic">Nunca acessou</span>
                                                }
                                            </td>
                                            <td className="p-4">
                                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(user.status || (user.approved ? 'approved' : 'pending'))}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {/* Reset Password Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleResetPassword(user.email)}
                                                        disabled={actionLoading === user.email}
                                                        className="text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                                        title="Redefinir Senha"
                                                    >
                                                        {actionLoading === user.email ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                                                    </Button>

                                                    {/* Edit Button */}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditClick(user)}
                                                        className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                                        title="Editar Usuário"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>

                                                    {/* Approve (if pending/rejected) */}
                                                    {user.status !== 'approved' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-green-600 border-green-200 hover:bg-green-50"
                                                            disabled={actionLoading === user.id}
                                                            onClick={() => handleUpdateStatus(user.id, 'approved')}
                                                        >
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Aprovar
                                                        </Button>
                                                    )}

                                                    {/* Block/Reject (if approved/pending) */}
                                                    {user.status !== 'rejected' && user.id !== currentUser?.id && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            disabled={actionLoading === user.id}
                                                            onClick={() => handleUpdateStatus(user.id, 'rejected')}
                                                            title="Bloquear Acesso"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit User Modal Overlay */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-slate-900">Editar Usuário</h3>
                            <Button variant="ghost" size="icon" onClick={() => setEditingUser(null)}>
                                <XCircle className="w-5 h-5 text-slate-400" />
                            </Button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                                <div className="p-2 bg-slate-100 rounded text-slate-500 text-sm">
                                    {editingUser.email}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Congregação</label>
                                <select
                                    value={editForm.congregation}
                                    onChange={(e) => setEditForm({ ...editForm, congregation: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    <option value="">Selecione...</option>
                                    {congregations.map(cong => (
                                        <option key={cong.id} value={cong.name}>
                                            {cong.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Função</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    <option value="user">Usuário Padrão</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setEditingUser(null)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveEdit} disabled={saveLoading} className="bg-indigo-600 hover:bg-indigo-700">
                                {saveLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Salvar Alterações
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
