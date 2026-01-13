import { useState, useEffect } from 'react';
import { useDepartments } from '../hooks/useDepartments';
import { useCongregations } from '../hooks/useCongregations';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Trash2, Plus, Loader2, Building, Home, Users, CheckCircle, Shield } from 'lucide-react';

export default function Settings() {
    const { isAdmin } = useAuth();

    // Departments state
    const { departments, loading: loadingDepts, addDepartment, deleteDepartment } = useDepartments();
    const [newDept, setNewDept] = useState('');
    const [isSubmittingDept, setIsSubmittingDept] = useState(false);

    // Congregations state
    const { congregations, loading: loadingCongs, addCongregation, deleteCongregation } = useCongregations();
    const [newCong, setNewCong] = useState('');
    const [isSubmittingCong, setIsSubmittingCong] = useState(false);

    // Users state
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            fetchPendingUsers();
        }
    }, [isAdmin]);

    const fetchPendingUsers = async () => {
        // ... implementation kept the same ...
        setLoadingUsers(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('approved', false);

            if (error) throw error;
            setPendingUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    // ... other handlers kept same ...
    const handleApproveUser = async (userId: string) => {
        try {
            // Use update_user_status to sync both 'status' and 'approved' fields
            const { error } = await supabase
                .rpc('update_user_status', { target_id: userId, new_status: 'approved' });

            if (error) throw error;
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Error approving user:', error);
            alert('Erro ao aprovar usuário. Verifique se você é um Administrador.');
        }
    };

    const handleAddDept = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDept.trim()) return;

        setIsSubmittingDept(true);
        try {
            await addDepartment(newDept);
            setNewDept('');
        } finally {
            setIsSubmittingDept(false);
        }
    };

    const handleDeleteDept = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este departamento?')) {
            await deleteDepartment(id);
        }
    };

    const handleAddCong = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCong.trim()) return;

        setIsSubmittingCong(true);
        try {
            await addCongregation(newCong);
            setNewCong('');
        } finally {
            setIsSubmittingCong(false);
        }
    };

    const handleDeleteCong = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir esta congregação?')) {
            await deleteCongregation(id);
        }
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
                <Shield className="w-12 h-12 mb-4 text-red-400" />
                <h2 className="text-xl font-bold text-slate-900">Acesso Restrito</h2>
                <p>Você não tem permissão para acessar as configurações.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Configurações</h2>
                <p className="text-slate-500">Gerencie as opções do sistema.</p>
            </div>

            {/* PENDING APPROVALS */}
            <Card className="border-l-4 border-l-amber-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-600" />
                        Aprovações Pendentes
                    </CardTitle>
                    <CardDescription>Usuários aguardando liberação de acesso.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingUsers ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                    ) : pendingUsers.length > 0 ? (
                        <div className="space-y-4">
                            {pendingUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div>
                                        <p className="font-medium text-slate-900">{user.email}</p>
                                        <p className="text-xs text-slate-500">Cadastrado em: {new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <Button
                                        onClick={() => handleApproveUser(user.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        size="sm"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Aprovar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <CheckCircle className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                            <p>Nenhuma solicitação pendente.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DEPARTMENTS SECTION */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="w-5 h-5 text-indigo-600" />
                            Departamentos
                        </CardTitle>
                        <CardDescription>Gerencie os departamentos disponíveis.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleAddDept} className="flex gap-2">
                            <Input
                                placeholder="Nome do novo departamento..."
                                value={newDept}
                                onChange={(e) => setNewDept(e.target.value)}
                            />
                            <Button type="submit" disabled={!newDept.trim() || isSubmittingDept}>
                                {isSubmittingDept ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            </Button>
                        </form>

                        <div className="space-y-2 mt-4">
                            {loadingDepts ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                </div>
                            ) : departments.length > 0 ? (
                                <ul className="divide-y divide-slate-100 border rounded-md">
                                    {departments.map((dept) => (
                                        <li key={dept.id} className="flex items-center justify-between p-3 hover:bg-slate-50">
                                            <span className="text-sm font-medium text-slate-700">{dept.name}</span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDeleteDept(dept.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-slate-400 text-sm py-4">Nenhum departamento cadastrado.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* CONGREGATIONS SECTION */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Home className="w-5 h-5 text-emerald-600" />
                            Congregações
                        </CardTitle>
                        <CardDescription>Gerencie as congregações cadastradas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleAddCong} className="flex gap-2">
                            <Input
                                placeholder="Nome da nova congregação..."
                                value={newCong}
                                onChange={(e) => setNewCong(e.target.value)}
                            />
                            <Button type="submit" disabled={!newCong.trim() || isSubmittingCong}>
                                {isSubmittingCong ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            </Button>
                        </form>

                        <div className="space-y-2 mt-4">
                            {loadingCongs ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                </div>
                            ) : congregations.length > 0 ? (
                                <ul className="divide-y divide-slate-100 border rounded-md">
                                    {congregations.map((cong) => (
                                        <li key={cong.id} className="flex items-center justify-between p-3 hover:bg-slate-50">
                                            <span className="text-sm font-medium text-slate-700">{cong.name}</span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDeleteCong(cong.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-slate-400 text-sm py-4">Nenhuma congregação cadastrada.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
