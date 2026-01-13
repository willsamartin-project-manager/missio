import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../hooks/useEvents';
import { useDepartments } from '../hooks/useDepartments';
import { useCongregations } from '../hooks/useCongregations';
import { useCollaborators } from '../hooks/useCollaborators';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Calendar, Users, MapPin, Building, DollarSign, HelpCircle, FileText, Loader2, Home } from 'lucide-react';

const NewEvent = () => {
    const navigate = useNavigate();
    const { addEvent } = useEvents();
    const { departments, loading: loadingDepts } = useDepartments();
    const { congregations, loading: loadingCongs } = useCongregations();
    const { collaborators, loading: loadingCollabs } = useCollaborators();
    const { profile } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        what: '',
        why: '',
        where: '',
        when: '',
        who: '',
        how: '',
        howMuch: '',
        congregation: ''
    });

    // Auto-select congregation if user has one
    useEffect(() => {
        if (profile?.congregation) {
            setFormData(prev => ({ ...prev, congregation: profile.congregation || '' }));
        }
    }, [profile]);

    // Update formData.who when selection changes
    useEffect(() => {
        if (selectedCollaborators.length > 0) {
            setFormData(prev => ({ ...prev, who: selectedCollaborators.join(', ') }));
        } else {
            setFormData(prev => ({ ...prev, who: '' }));
        }
    }, [selectedCollaborators]);

    // Filter collaborators by congregation if user has one
    const filteredCollaborators = collaborators.filter(collab => {
        if (profile?.congregation) {
            return collab.congregation === profile.congregation || !collab.congregation;
        }
        return true; // Show all if user has no congregation (e.g. super admin or not set)
    });

    const handleCollaboratorToggle = (name: string) => {
        setSelectedCollaborators(prev => {
            if (prev.includes(name)) {
                return prev.filter(n => n !== name);
            } else {
                return [...prev, name];
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addEvent(formData);
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Novo Evangelismo</h2>
                <p className="text-slate-500">Planeje seu próximo evento usando a metodologia 5W2H.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                {/* WHAT */}
                <Card className="md:col-span-2 border-indigo-100 shadow-indigo-100/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-700">
                            <FileText className="w-5 h-5" />
                            1. What (O que)
                        </CardTitle>
                        <CardDescription>Qual é o evento? Descreva o novo hábito ou ação de evangelismo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="what">Descrição do Evento</Label>
                        <Textarea
                            id="what"
                            name="what"
                            placeholder="Ex: Culto ao ar livre na praça central..."
                            className="mt-2"
                            required
                            value={formData.what}
                            onChange={handleChange}
                        />
                    </CardContent>
                </Card>

                {/* CONGREGATION */}
                <Card className="border-indigo-100 shadow-indigo-100/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-700">
                            <Home className="w-5 h-5" />
                            Congregação
                        </CardTitle>
                        <CardDescription>Qual congregação está realizando?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="congregation">Congregação</Label>
                        <div className="relative mt-2">
                            <select
                                id="congregation"
                                name="congregation"
                                value={formData.congregation}
                                onChange={handleChange}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={loadingCongs}
                                required
                            >
                                <option value="" disabled>Selecione uma congregação...</option>
                                {congregations.map(cong => (
                                    <option key={cong.id} value={cong.name}>
                                        {cong.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* WHY */}
                <Card className="border-indigo-100 shadow-indigo-100/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-700">
                            <HelpCircle className="w-5 h-5" />
                            2. Why (Por que)
                        </CardTitle>
                        <CardDescription>Departamento responsável / Objetivo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="why">Departamento / Motivo</Label>
                        <div className="relative mt-2">
                            <select
                                id="why"
                                name="why"
                                value={formData.why}
                                onChange={handleChange}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={loadingDepts}
                                required
                            >
                                <option value="" disabled>Selecione um departamento...</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.name}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* WHERE */}
                <Card className="border-indigo-100 shadow-indigo-100/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-700">
                            <MapPin className="w-5 h-5" />
                            3. Where (Onde)
                        </CardTitle>
                        <CardDescription>Localização do evangelismo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="where">Local</Label>
                        <Input
                            id="where"
                            name="where"
                            placeholder="Ex: Praça Afonso Pena"
                            className="mt-2"
                            required
                            value={formData.where}
                            onChange={handleChange}
                        />
                    </CardContent>
                </Card>

                {/* WHEN */}
                <Card className="border-indigo-100 shadow-indigo-100/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-700">
                            <Calendar className="w-5 h-5" />
                            4. When (Quando)
                        </CardTitle>
                        <CardDescription>Data e Horário do evento.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="when">Data/Hora</Label>
                        <Input
                            id="when"
                            name="when"
                            type="datetime-local"
                            className="mt-2"
                            required
                            value={formData.when}
                            onChange={handleChange}
                        />
                    </CardContent>
                </Card>

                {/* WHO */}
                <Card className="border-indigo-100 shadow-indigo-100/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-700">
                            <Users className="w-5 h-5" />
                            5. Who (Quem)
                        </CardTitle>
                        <CardDescription>Selecione os colaboradores responsáveis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label>Colaboradores</Label>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 border rounded-md p-3 bg-slate-50/50">
                            {loadingCollabs ? (
                                <div className="col-span-2 flex justify-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                </div>
                            ) : filteredCollaborators.length > 0 ? (
                                filteredCollaborators.map((collab) => (
                                    <div key={collab.id} className="flex items-center space-x-2 bg-white p-2 rounded border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                                        <input
                                            type="checkbox"
                                            id={`collab-${collab.id}`}
                                            checked={selectedCollaborators.includes(collab.name)}
                                            onChange={() => handleCollaboratorToggle(collab.name)}
                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                        />
                                        <label
                                            htmlFor={`collab-${collab.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                        >
                                            {collab.name}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 text-center text-sm text-slate-500 py-4">
                                    Nenhum colaborador cadastrado. <br />
                                    <span className="text-xs">Cadastre em "Colaboradores" no menu.</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-2 text-xs text-slate-400">
                            Selecionados: {selectedCollaborators.length}
                        </div>
                    </CardContent>
                </Card>

                {/* HOW */}
                <Card className="border-indigo-100 shadow-indigo-100/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-700">
                            <Building className="w-5 h-5" />
                            6. How (Como)
                        </CardTitle>
                        <CardDescription>Como será realizado? Estratégia.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="how">Estratégia</Label>
                        <Textarea
                            id="how"
                            name="how"
                            placeholder="Ex: Distribuição de folhetos e louvor..."
                            className="mt-2"
                            value={formData.how}
                            onChange={handleChange}
                        />
                    </CardContent>
                </Card>

                {/* HOW MUCH */}
                <Card className="border-indigo-100 shadow-indigo-100/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-700">
                            <DollarSign className="w-5 h-5" />
                            7. How Much (Quanto)
                        </CardTitle>
                        <CardDescription>Custo estimado (opcional).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="howMuch">Custo (R$)</Label>
                        <Input
                            id="howMuch"
                            name="howMuch"
                            placeholder="Ex: 500,00"
                            className="mt-2"
                            value={formData.howMuch}
                            onChange={handleChange}
                        />
                    </CardContent>
                </Card>

                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200">
                        Cancelar
                    </Button>
                    <Button type="submit" className="w-full md:w-auto text-lg px-8" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar Evento
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default NewEvent;
