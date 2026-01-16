```javascript
import { useState, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Printer, Filter, Calendar } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Reports = () => {
    const { events, loading } = useEvents();
    const { isAdmin, profile } = useAuth();

    // Default to current month/year
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${ now.getFullYear() } -${ String(now.getMonth() + 1).padStart(2, '0') } `;
    });

    const filteredEvents = useMemo(() => {
        if (!events) return [];

        const [year, month] = selectedMonth.split('-').map(Number);

        return events.filter(event => {
            if (event.status !== 'completed' || !event.result) return false;

            // Access Control: Non-admins can only see their congregation's events
            if (!isAdmin && event.congregation !== profile?.congregation) {
                return false;
            }

            const eventDate = new Date(event.when);
            return eventDate.getMonth() + 1 === month && eventDate.getFullYear() === year;
        }).sort((a, b) => new Date(a.when).getTime() - new Date(b.when).getTime());
    }, [events, selectedMonth, isAdmin, profile]);

    const totals = useMemo(() => {
        return filteredEvents.reduce((acc, event) => ({
            events: acc.events + 1,
            decisions: acc.decisions + (event.result?.decisionsCount || 0),
            collaborators: acc.collaborators + (event.result?.collaboratorCount || 0),
            approached: acc.approached + (event.result?.approachedCount || 0)
        }), { events: 0, decisions: 0, collaborators: 0, approached: 0 });
    }, [filteredEvents]);

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

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 print:p-0 print:animate-none">

            {/* Header / Controls - Hidden on print */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Relatórios</h2>
                    <p className="text-slate-500">Visualize e exporte os resultados dos evangelismos mensais.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="pl-9 h-10 rounded-md border border-slate-200 bg-white px-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        />
                    </div>
                    <Button onClick={handlePrint} variant="outline" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        <Printer size={16} />
                        Exportar PDF
                    </Button>
                </div>
            </div>

            {/* Print Header - Only visible on print */}
            <div className="hidden print:block mb-8 border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-6 w-6 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-slate-900">Relatório de Evangelismo</h1>
                </div>
                <p className="text-slate-500">
                    Período: {new Date(selectedMonth + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* Metrics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-4">
                <Card className="bg-indigo-50 border-indigo-100 print:shadow-none print:border">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-indigo-600 font-medium">Eventos</CardDescription>
                        <CardTitle className="text-2xl text-indigo-900">{totals.events}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-blue-50 border-blue-100 print:shadow-none print:border">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-blue-600 font-medium">Abordagens</CardDescription>
                        <CardTitle className="text-2xl text-blue-900">{totals.approached}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-green-50 border-green-100 print:shadow-none print:border">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-green-600 font-medium">Decisões</CardDescription>
                        <CardTitle className="text-2xl text-green-900">{totals.decisions}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-purple-50 border-purple-100 print:shadow-none print:border">
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-purple-600 font-medium">Voluntários</CardDescription>
                        <CardTitle className="text-2xl text-purple-900">{totals.collaborators}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Detailed List */}
            <Card className="print:shadow-none print:border-none">
                <CardHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 print:bg-white print:px-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-slate-800">Detalhamento dos Eventos</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredEvents.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200 print:bg-slate-100">
                                    <tr>
                                        <th className="px-6 py-3 w-10 print:hidden"></th>
                                        <th className="px-6 py-3 print:px-2">Data / Local</th>
                                        <th className="px-6 py-3 print:px-2">Congregação</th>
                                        <th className="px-6 py-3 print:px-2">Evento</th>
                                        <th className="px-6 py-3 print:px-2">Responsável</th>
                                        <th className="px-6 py-3 text-center print:px-2">Voluntários</th>
                                        <th className="px-6 py-3 text-center print:px-2">Decisões</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredEvents.map((event) => (
                                        <tr key={event.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                                            <td className="px-6 py-4 text-center print:hidden">
                                                <Link to={`/ reports / ${ event.id } `}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" title="Visualizar Relatório Completo">
                                                        <FileText size={16} />
                                                    </Button>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 print:px-2">
                                                <div className="font-medium text-slate-900">
                                                    {new Date(event.when).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-slate-500">{event.where}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 print:px-2">
                                                {event.congregation || '-'}
                                            </td>
                                            <td className="px-6 py-4 print:px-2">
                                                <div className="font-medium text-slate-900">{event.what}</div>
                                                <div className="text-xs text-slate-500">{event.why}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 print:px-2">
                                                {event.who}
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-slate-700 print:px-2">
                                                {event.result?.collaboratorCount || 0}
                                            </td>
                                            <td className="px-6 py-4 text-center print:px-2">
                                                {event.result && event.result.decisionsCount > 0 ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 print:bg-transparent print:text-green-800 print:border print:border-green-200">
                                                        {event.result.decisionsCount}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <Filter className="h-10 w-10 text-slate-300 mb-3" />
                            <p>Nenhum evento com relatório encontrado neste mês.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <style>{`
@media print {
    @page {
        margin: 1.5cm;
        size: A4;
    }
                    body {
        background: white;
    }
    /* Hide sidebar and other layout elements if they are not properly hidden by print:hidden utility */
    aside, nav, header, .fixed, button {
        display: none!important;
    } 
                    main {
        padding: 0!important;
        margin: 0!important;
        overflow: visible!important;
    }
}
`}</style>
        </div>
    );
};

export default Reports;
