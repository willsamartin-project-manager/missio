import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEvents, type Event as AppEvent } from '../hooks/useEvents';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Printer, ArrowLeft, Calendar, MapPin, Users, CheckCircle, MessageSquare, User, ShieldAlert } from 'lucide-react';

const EventDetailReport = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const { events, loading } = useEvents();
    const { isAdmin, profile } = useAuth();
    const [event, setEvent] = useState<AppEvent | null>(null);

    useEffect(() => {
        if (!loading && events.length > 0 && eventId) {
            const foundEvent = events.find(e => e.id === eventId);
            if (foundEvent) {
                setEvent(foundEvent);
            }
        }
    }, [events, loading, eventId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Evento não encontrado</h2>
                <Button variant="outline" onClick={() => navigate('/reports')}>
                    Voltar para Relatórios
                </Button>
            </div>
        );
    }

    // Access Control Check
    if (!isAdmin && event.congregation !== profile?.congregation) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <ShieldAlert className="h-16 w-16 text-red-500" />
                <h2 className="text-2xl font-bold text-slate-900">Acesso Negado</h2>
                <p className="text-slate-500 max-w-md text-center">
                    Você não tem permissão para visualizar o relatório desta congregação.
                </p>
                <Button variant="outline" onClick={() => navigate('/reports')}>
                    Voltar para Relatórios
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12 print:p-0 print:max-w-none">
            {/* Controls - Hidden on Print */}
            <div className="flex items-center justify-between mb-8 print:hidden">
                <Link to="/reports">
                    <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
                        <ArrowLeft size={20} />
                        Voltar para Lista
                    </Button>
                </Link>
                <Button onClick={handlePrint} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Printer size={20} />
                    Imprimir Relatório
                </Button>
            </div>

            {/* Print Header */}
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="border-b pb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">{event.what}</h1>
                            <div className="flex flex-wrap gap-4 text-slate-600 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={16} className="text-indigo-600" />
                                    <span>{new Date(event.when).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={16} className="text-indigo-600" />
                                    <span>{event.where}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <User size={16} className="text-indigo-600" />
                                    <span className="font-medium">Resp: {event.who}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                {event.why}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-blue-50 border-blue-100 print:shadow-none print:border">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-600 uppercase tracking-wide">Abordagens</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl font-bold text-blue-900">{event.result?.approachedCount || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-100 print:shadow-none print:border">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium text-green-600 uppercase tracking-wide">Decisões</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl font-bold text-green-900">{event.result?.decisionsCount || 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-50 border-purple-100 print:shadow-none print:border">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-600 uppercase tracking-wide">Voluntários</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl font-bold text-purple-900">{event.result?.collaboratorCount || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contacts List */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b pb-2 mb-4">
                        <Users className="h-5 w-5 text-slate-500" />
                        <h2 className="text-xl font-semibold text-slate-800">Lista de Contatos</h2>
                    </div>

                    {!event.result?.contacts || event.result.contacts.length === 0 ? (
                        <p className="text-slate-500 italic py-4">Nenhum contato registrado neste evento.</p>
                    ) : (
                        <div className="border rounded-lg overflow-hidden print:border-slate-200">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 print:bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-3">Nome / Detalhes</th>
                                        <th className="px-4 py-3">Status Espiritual</th>
                                        <th className="px-4 py-3 w-1/3">Observação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {event.result.contacts.map((contact) => (
                                        <tr key={contact.id} className="hover:bg-slate-50 print:hover:bg-transparent break-inside-avoid">
                                            <td className="px-4 py-3 align-top">
                                                <div className="font-medium text-slate-900">{contact.name}</div>
                                                {contact.phone && (
                                                    <div className="text-xs text-slate-500 mt-0.5">{contact.phone}</div>
                                                )}
                                                {contact.address && (
                                                    <div className="text-xs text-slate-500 mt-0.5">{contact.address}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border
                                                    ${contact.spiritualStatus === 'Decidido' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        contact.spiritualStatus === 'Aberto' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                            contact.spiritualStatus === 'Curioso' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                                'bg-slate-50 text-slate-600 border-slate-200'
                                                    }`}>
                                                    {contact.spiritualStatus === 'Decidido' && <CheckCircle size={12} className="mr-1" />}
                                                    {contact.spiritualStatus || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 align-top italic">
                                                {contact.observation || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Feedback / Notes */}
                {(event.result?.feedbackPositive || event.result?.feedbackImprove || event.result?.notes) && (
                    <div className="space-y-4 pt-4 break-inside-avoid">
                        <div className="flex items-center gap-2 border-b pb-2 mb-4">
                            <MessageSquare className="h-5 w-5 text-slate-500" />
                            <h2 className="text-xl font-semibold text-slate-800">Feedback e Observações</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-4">
                            {event.result.feedbackPositive && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-green-700 text-sm uppercase tracking-wide">Pontos Positivos</h3>
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-slate-700 text-sm whitespace-pre-wrap print:border-slate-200">
                                        {event.result.feedbackPositive}
                                    </div>
                                </div>
                            )}

                            {event.result.feedbackImprove && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-amber-700 text-sm uppercase tracking-wide">Pontos de Melhoria</h3>
                                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-slate-700 text-sm whitespace-pre-wrap print:border-slate-200">
                                        {event.result.feedbackImprove}
                                    </div>
                                </div>
                            )}

                            {event.result.notes && (
                                <div className="space-y-2 md:col-span-2">
                                    <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Outras Observações</h3>
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 text-sm whitespace-pre-wrap">
                                        {event.result.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    @page {
                        margin: 1.5cm;
                        size: A4;
                    }
                    body {
                        background: white;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    /* Hide sidebar and other layout elements */
                    aside, nav, header, .fixed, button {
                        display: none !important;
                    } 
                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default EventDetailReport;
