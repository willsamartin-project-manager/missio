import { useState, useEffect } from 'react';
import { useCollaborators } from '../hooks/useCollaborators';
import { useCongregations } from '../hooks/useCongregations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Trash2, Plus, Loader2, Users, UserPlus, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Collaborators() {
    const { collaborators, loading, addCollaborator, deleteCollaborator, fetchCollaborators } = useCollaborators();
    const { congregations } = useCongregations();
    const { isAdmin, profile } = useAuth(); // Get profile to check congregation

    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        congregation: '',
        observation: ''
    });

    useEffect(() => {
        fetchCollaborators();
    }, []);

    // Auto-select congregation if user is not admin and has a congregation
    useEffect(() => {
        if (!isAdmin && profile?.congregation) {
            setFormData(prev => ({ ...prev, congregation: profile.congregation || '' }));
        }
    }, [isAdmin, profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setIsSubmitting(true);
        try {
            await addCollaborator(formData);
            // Reset form but keep congregation if restricted
            setFormData({
                name: '',
                contact: '',
                congregation: (!isAdmin && profile?.congregation) ? profile.congregation : '',
                observation: ''
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este colaborador?')) {
            await deleteCollaborator(id);
        }
    };

    // Filter available congregations for the dropdown
    const availableCongregations = congregations.filter(cong => {
        if (isAdmin) return true;
        if (profile?.congregation) return cong.name === profile.congregation;
        return true; // Or return false? If user has no congregation, maybe let them pick? Assuming they should have one.
    });

    // Filter collaborators list
    const filteredCollaborators = collaborators.filter(collab => {
        const matchesSearch = collab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (collab.contact && collab.contact.includes(searchTerm));

        if (!matchesSearch) return false;

        if (isAdmin) return true;

        if (profile?.congregation) {
            return collab.congregation === profile.congregation;
        }

        return false;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Colaboradores</h2>
                <p className="text-slate-500">Gerencie a equipe de evangelismo.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM SECTION */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6 border-indigo-100 shadow-indigo-100/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-indigo-700">
                                <UserPlus className="w-5 h-5" />
                                Novo Colaborador
                            </CardTitle>
                            <CardDescription>Cadastre um novo voluntário.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nome *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Nome completo"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contact">Contato</Label>
                                    <Input
                                        id="contact"
                                        name="contact"
                                        placeholder="WhatsApp / Telefone"
                                        value={formData.contact}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="congregation">Congregação</Label>
                                    <select
                                        id="congregation"
                                        name="congregation"
                                        value={formData.congregation}
                                        onChange={handleChange}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                                        disabled={!isAdmin && !!profile?.congregation} // Disable if user restricts it
                                    >
                                        <option value="">Selecione...</option>
                                        {availableCongregations.map(cong => (
                                            <option key={cong.id} value={cong.name}>
                                                {cong.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="observation">Observação</Label>
                                    <Textarea
                                        id="observation"
                                        name="observation"
                                        placeholder="Disponibilidade, liderança, etc."
                                        value={formData.observation}
                                        onChange={handleChange}
                                        className="resize-none"
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                    Cadastrar
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* LIST SECTION */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-slate-500" />
                                Lista de Colaboradores
                            </CardTitle>
                            <CardDescription>
                                Total: {filteredCollaborators.length} voluntários cadastrados.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                </div>
                            ) : filteredCollaborators.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <div className="flex justify-center mb-4">
                                        <Users className="w-12 h-12 opacity-20" />
                                    </div>
                                    <p>Nenhum colaborador encontrado.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {filteredCollaborators.map((collab) => (
                                        <div key={collab.id} className="group flex flex-col justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-200">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold text-slate-900">{collab.name}</h3>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-slate-400 hover:text-red-500 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleDelete(collab.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                                <div className="space-y-1 text-sm text-slate-500">
                                                    {collab.contact && <p className="flex items-center gap-2">📞 {collab.contact}</p>}
                                                    {collab.congregation && <p className="flex items-center gap-2">⛪ {collab.congregation}</p>}
                                                    {collab.observation && <p className="italic text-xs mt-2 text-slate-400 border-l-2 border-slate-200 pl-2">{collab.observation}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};


