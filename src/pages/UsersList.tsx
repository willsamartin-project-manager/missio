import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Users, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';


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
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        </div>
    );
}
