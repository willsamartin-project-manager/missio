import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents, type EventResult, type Contact, type Event as AppEvent } from '../hooks/useEvents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Users, UserPlus, CheckCircle, MessageSquare, Plus, Trash2, Loader2 } from 'lucide-react';

const EventReport = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const { events, loading, addResult } = useEvents();

    const [event, setEvent] = useState<AppEvent | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const [result, setResult] = useState<EventResult>({
        approachedCount: 0,
        collaboratorCount: 0,
        decisionsCount: 0,
        contacts: [],
        notes: '',
        feedbackPositive: '',
        feedbackImprove: ''
    });

    const [newContact, setNewContact] = useState<Contact>({
        id: '',
        name: '',
        phone: '',
        address: '',
        spiritualStatus: '',
        observation: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && events.length > 0 && eventId && !isInitialized) {
            const foundEvent = events.find(e => e.id === eventId);
            if (foundEvent) {
                setEvent(foundEvent);
                if (foundEvent.result) {
                    setResult(foundEvent.result);
                }
                setIsInitialized(true);
            }
        }
    }, [events, loading, eventId, isInitialized]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!event && !loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Evento não encontrado</h2>
                    <p className="text-slate-500">O evento que você está procurando não existe ou foi removido.</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    Voltar para o Dashboard
                </Button>
            </div>
        );
    }

    // Safety check
    if (!event) return null;

    const handleMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setResult(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setResult(prev => ({ ...prev, [name]: value }));
    };

    const addContact = () => {
        if (!newContact.name) return;
        setResult(prev => ({
            ...prev,
            contacts: [...prev.contacts, { ...newContact, id: crypto.randomUUID() }]
        }));
        setNewContact({ id: '', name: '', phone: '', address: '', spiritualStatus: '', observation: '' });
    };

    const removeContact = (id: string) => {
        setResult(prev => ({
            ...prev,
            contacts: prev.contacts.filter(c => c.id !== id)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (eventId) {
            setIsSubmitting(true);
            try {
                await addResult(eventId, result);
                navigate('/dashboard');
            } catch (error) {
                console.error(error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Relatório de Evangelismo</h2>
                <p className="text-slate-500">Registre os resultados do evento: <span className="font-semibold text-slate-700">{event.what}</span></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Metrics Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Pessoas Abordadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                <Input
                                    type="number"
                                    name="approachedCount"
                                    value={result.approachedCount}
                                    onChange={handleMetricChange}
                                    className="text-2xl font-bold border-none bg-transparent h-auto p-0 focus-visible:ring-0 w-full"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Decisões / Reconciliações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <Input
                                    type="number"
                                    name="decisionsCount"
                                    value={result.decisionsCount}
                                    onChange={handleMetricChange}
                                    className="text-2xl font-bold border-none bg-transparent h-auto p-0 focus-visible:ring-0 w-full"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Colaboradores Presentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-500" />
                                <Input
                                    type="number"
                                    name="collaboratorCount"
                                    value={result.collaboratorCount}
                                    onChange={handleMetricChange}
                                    className="text-2xl font-bold border-none bg-transparent h-auto p-0 focus-visible:ring-0 w-full"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contacts Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-indigo-600" />
                                    Lista de Contatos
                                </CardTitle>
                                <CardDescription>Adicione as pessoas que desejam receber uma visita ou contato.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="md:col-span-1">
                                <Label htmlFor="cName">Nome</Label>
                                <Input
                                    id="cName"
                                    placeholder="Nome da pessoa"
                                    value={newContact.name}
                                    onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor="cPhone">Telefone</Label>
                                <Input
                                    id="cPhone"
                                    placeholder="(12) 99999-9999"
                                    value={newContact.phone}
                                    onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor="cAddress">Endereço</Label>
                                <Input
                                    id="cAddress"
                                    placeholder="Rua, Número, Bairro"
                                    value={newContact.address}
                                    onChange={e => setNewContact({ ...newContact, address: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor="cStatus">Status Espiritual</Label>
                                <select
                                    id="cStatus"
                                    value={newContact.spiritualStatus}
                                    onChange={e => setNewContact({ ...newContact, spiritualStatus: e.target.value as any })}
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Curioso">Curioso</option>
                                    <option value="Aberto">Aberto</option>
                                    <option value="Decidido">Decidido</option>
                                </select>
                            </div>
                            <div className="md:col-span-4">
                                <Label htmlFor="cObs">Observação</Label>
                                <Input
                                    id="cObs"
                                    placeholder="Pedido de oração, detalhes extras..."
                                    value={newContact.observation}
                                    onChange={e => setNewContact({ ...newContact, observation: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-4 flex justify-end">
                                <Button type="button" onClick={addContact} className="w-full md:w-auto" disabled={!newContact.name}>
                                    <Plus className="w-4 h-4 mr-2" /> Adicionar Contato
                                </Button>
                            </div>
                        </div>

                        {result?.contacts?.length > 0 && (
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-600 font-medium">
                                        <tr>
                                            <th className="p-3">Nome</th>
                                            <th className="p-3">Telefone</th>
                                            <th className="p-3">Endereço</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Observação</th>
                                            <th className="p-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {result.contacts.map((contact) => (
                                            <tr key={contact.id} className="hover:bg-slate-50">
                                                <td className="p-3 font-medium">{contact.name}</td>
                                                <td className="p-3 text-slate-500">{contact.phone}</td>
                                                <td className="p-3 text-slate-500">{contact.address}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                        ${contact.spiritualStatus === 'Decidido' ? 'bg-green-100 text-green-700' :
                                                            contact.spiritualStatus === 'Aberto' ? 'bg-blue-100 text-blue-700' :
                                                                contact.spiritualStatus === 'Curioso' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {contact.spiritualStatus || '-'}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-slate-500">{contact.observation}</td>
                                                <td className="p-3">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => removeContact(contact.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {(!result?.contacts || result.contacts.length === 0) && (
                            <p className="text-center text-slate-400 py-4 italic">Nenhum contato adicionado ainda.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Feedback Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                            Feedback e Melhorias
                        </CardTitle>
                        <CardDescription>Avaliação para os próximos eventos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-green-600 font-semibold">Pontos Positivos (O que funcionou bem?)</Label>
                            <Textarea
                                name="feedbackPositive"
                                value={result.feedbackPositive}
                                onChange={handleTextChange}
                                placeholder="Ex: A equipe estava bem engajada, o local foi excelente..."
                                className="mt-1 border-green-100 bg-green-50/30 focus:border-green-300 focus:ring-green-200"
                            />
                        </div>
                        <div>
                            <Label className="text-amber-600 font-semibold">Pontos de Melhoria (O que podemos ajustar?)</Label>
                            <Textarea
                                name="feedbackImprove"
                                value={result.feedbackImprove}
                                onChange={handleTextChange}
                                placeholder="Ex: O som estava baixo, faltou material de divulgação..."
                                className="mt-1 border-amber-100 bg-amber-50/30 focus:border-amber-300 focus:ring-amber-200"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                        Cancelar
                    </Button>
                    <Button type="submit" size="lg" className="px-8 bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Relatório
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EventReport;
