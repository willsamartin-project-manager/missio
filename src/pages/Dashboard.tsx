import { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useCollaborators } from '../hooks/useCollaborators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { Trash2, Calendar, Users, MapPin, Plus, CheckCircle, Loader2, Home, Pencil } from 'lucide-react';

const Dashboard = () => {
    const { events, loading: loadingEvents, deleteEvent } = useEvents();
    const { collaborators, loading: loadingCollabs } = useCollaborators();

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este evento?')) {
            await deleteEvent(id);
        }
    };

    // Calculate metrics
    const totalVolunteers = collaborators.length;

    const soulsReached = events.reduce((acc, event) => {
        if (event.status === 'completed' && event.result) {
            return acc + (event.result.decisionsCount || 0);
        }
        return acc;
    }, 0);

    const [showCompleted, setShowCompleted] = useState(false);

    const filteredEvents = events.filter(event => {
        if (!showCompleted) {
            return event.status !== 'completed';
        }
        return true;
    });

    const loading = loadingEvents || loadingCollabs;

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                    <p className="text-slate-500">Acompanhe o planejamento e execução dos evangelismos.</p>
                </div>
                <Link to="/new-event">
                    <Button className="gap-2 shadow-indigo-500/20">
                        <Plus size={20} />
                        Novo Evento
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-none text-white shadow-lg shadow-indigo-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-100">Total de Eventos</CardTitle>
                        <Calendar className="h-4 w-4 text-indigo-100" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{events.length}</div>
                        <p className="text-xs text-indigo-200">Eventos planejados e realizados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Voluntários Impactados</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVolunteers}</div>
                        <p className="text-xs text-muted-foreground">Colaboradores cadastrados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Almas Alcançadas</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{soulsReached}</div>
                        <p className="text-xs text-muted-foreground">Decisões registradas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Próximo Evento</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const nextEvent = events
                                .filter(e => e.status !== 'completed')
                                .sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime())[0];

                            return (
                                <>
                                    <div className="text-lg font-bold truncate">
                                        {nextEvent ? new Date(nextEvent.when).toLocaleDateString() : 'N/A'}
                                    </div>
                                    <p className="text-xs text-muted-foreground text-ellipsis overflow-hidden whitespace-nowrap">
                                        {nextEvent ? nextEvent.where : 'Nenhum agendado'}
                                    </p>
                                </>
                            );
                        })()}
                    </CardContent>
                </Card>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-slate-800">Próximos Eventos</h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="showCompleted"
                            checked={showCompleted}
                            onChange={(e) => setShowCompleted(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="showCompleted" className="text-sm text-slate-600 select-none">
                            Mostrar concluídos
                        </label>
                    </div>
                </div>
                {filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                            <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium mb-2">
                            {events.length > 0 ? 'Nenhum evento pendente encontrado.' : 'Nenhum evento planejado'}
                        </p>
                        <p className="text-slate-400 text-sm mb-6">
                            {events.length > 0 ? 'Habilite "Mostrar concluídos" para ver o histórico.' : 'Comece criando seu primeiro planejamento de evangelismo.'}
                        </p>
                        <Link to="/new-event">
                            <Button variant="outline">Criar meu primeiro evento</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredEvents.map((event) => (
                            <Card key={event.id} className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-indigo-500 overflow-hidden">
                                <CardHeader>
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-full">{event.why}</span>
                                            <CardTitle className="mt-3 text-lg leading-tight text-slate-900 break-words">{event.what}</CardTitle>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <Link to={`/edit-event/${event.id}`} className="flex">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                    title="Editar evento"
                                                >
                                                    <Pencil size={16} />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                onClick={() => handleDelete(event.id)}
                                                title="Excluir evento"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardDescription className="flex items-start gap-2 mt-2">
                                        <MapPin size={14} className="shrink-0 mt-0.5" />
                                        <span className="break-words min-w-0">{event.where}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                <span>{new Date(event.when).toLocaleString()}</span>
                                            </div>

                                            <div className="flex items-center gap-2 min-w-0">
                                                <Home size={14} className="text-slate-400 shrink-0" />
                                                <span className="truncate">{event.congregation || 'Não informada'}</span>
                                            </div>

                                            <div className="flex items-center gap-2 min-w-0" title="Responsável / Equipe">
                                                <Users size={14} className="text-slate-400 shrink-0" />
                                                <span className="truncate font-medium text-slate-700">{event.who}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            {event.status === 'completed' && event.result ? (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium w-full">
                                                        <CheckCircle size={16} />
                                                        Relatório Completo
                                                    </div>
                                                    <Link to={`/report/${event.id}`} className="w-full block">
                                                        <Button variant="ghost" size="sm" className="w-full text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200 whitespace-normal h-auto py-2">
                                                            Editar Relatório
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ) : (
                                                <Link to={`/report/${event.id}`} className="w-full block">
                                                    <Button variant="outline" size="sm" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 whitespace-normal h-auto py-2">
                                                        Preencher Relatório
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
