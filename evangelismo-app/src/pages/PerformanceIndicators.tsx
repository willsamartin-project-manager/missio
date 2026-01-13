import { useEffect, useState, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useCollaborators } from '../hooks/useCollaborators';
import { useCongregations } from '../hooks/useCongregations';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart3, Users, Target, CalendarDays, TrendingUp, Shield, Loader2 } from 'lucide-react';

export default function PerformanceIndicators() {
    const { events, loading: loadingEvents } = useEvents();
    const { collaborators, loading: loadingCollabs } = useCollaborators();
    const { congregations } = useCongregations();
    const { isAdmin, loading: authLoading } = useAuth();

    // Safety check just in case, though route protection should handle it
    if (!authLoading && !isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
                <Shield className="w-12 h-12 mb-4 text-red-400" />
                <h2 className="text-xl font-bold text-slate-900">Acesso Restrito</h2>
                <p>Esta página é exclusiva para administradores.</p>
            </div>
        );
    }

    const [period, setPeriod] = useState<'all' | 'year' | 'quarter' | 'month'>('all');

    const {
        eventsByCongregation,
        decisionsByCongregation,
        collaboratorsByCongregation,
        maxEvents,
        maxDecisions,
        maxCollaborators
    } = useMemo(() => {
        const eventsMap: Record<string, number> = {};
        const decisionsMap: Record<string, number> = {};
        const colabMap: Record<string, number> = {};

        // Initialize maps
        congregations.forEach(c => {
            eventsMap[c.name] = 0;
            decisionsMap[c.name] = 0;
            colabMap[c.name] = 0;
        });

        // Date Cutoff Calculation
        const now = new Date();
        let cutoffDate: Date | null = null;

        if (period === 'year') {
            cutoffDate = new Date();
            cutoffDate.setFullYear(now.getFullYear() - 1);
        } else if (period === 'quarter') {
            cutoffDate = new Date();
            cutoffDate.setMonth(now.getMonth() - 3);
        } else if (period === 'month') {
            cutoffDate = new Date();
            cutoffDate.setMonth(now.getMonth() - 1);
        }

        // 1. Process Events & Decisions (Filtered by Date)
        events.forEach(event => {
            // Filter by Date
            if (cutoffDate) {
                const eventDate = new Date(event.when);
                if (eventDate < cutoffDate) return;
            }

            const congName = event.congregation || 'Não Informada';

            // Count Events
            eventsMap[congName] = (eventsMap[congName] || 0) + 1;

            // Count Decisions
            if (event.status === 'completed' && event.result?.decisionsCount) {
                decisionsMap[congName] = (decisionsMap[congName] || 0) + event.result.decisionsCount;
            }
        });

        // 2. Process Collaborators (NOT Filtered by Date - showing total strength)
        collaborators.forEach(collab => {
            const congName = collab.congregation || 'Não Informada';
            colabMap[congName] = (colabMap[congName] || 0) + 1;
        });

        // Helper to convert to sorted array
        const toArray = (map: Record<string, number>) => {
            return Object.entries(map)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
        };

        const eventsSorted = toArray(eventsMap);
        const decisionsSorted = toArray(decisionsMap);
        const collaboratorsSorted = toArray(colabMap);

        return {
            eventsByCongregation: eventsSorted,
            decisionsByCongregation: decisionsSorted,
            collaboratorsByCongregation: collaboratorsSorted,
            maxEvents: Math.max(...eventsSorted.map(i => i.value), 1),
            maxDecisions: Math.max(...decisionsSorted.map(i => i.value), 1),
            maxCollaborators: Math.max(...collaboratorsSorted.map(i => i.value), 1),
        };

    }, [events, collaborators, congregations, period]);


    const loading = loadingEvents || loadingCollabs || authLoading;

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Indicadores de Performance</h2>
                    <p className="text-slate-500">Acompanhamento estatístico das congregações.</p>
                </div>

                {/* DATE FILTER BUTTONS */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setPeriod('all')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${period === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Todo Histórico
                    </button>
                    <button
                        onClick={() => setPeriod('year')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${period === 'year' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Último Ano
                    </button>
                    <button
                        onClick={() => setPeriod('quarter')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${period === 'quarter' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Últimos 3 Meses
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${period === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Últimos 30 Dias
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. EVENTS CHART */}
                <Card className="border-indigo-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-indigo-700 text-lg">
                            <CalendarDays className="w-5 h-5" />
                            Eventos Realizados
                        </CardTitle>
                        <CardDescription>Total de evangelismos por congregação</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            {eventsByCongregation.map((item, index) => (
                                <div key={item.name} className="space-y-1">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="truncate max-w-[180px]" title={item.name}>{item.name}</span>
                                        <span className="text-slate-600">{item.value}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${(item.value / maxEvents) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {eventsByCongregation.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Sem dados</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. DECISIONS CHART */}
                <Card className="border-emerald-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-emerald-700 text-lg">
                            <Target className="w-5 h-5" />
                            Almas Alcançadas
                        </CardTitle>
                        <CardDescription>Decisões registradas nos eventos</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            {decisionsByCongregation.map((item) => (
                                <div key={item.name} className="space-y-1">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="truncate max-w-[180px]" title={item.name}>{item.name}</span>
                                        <span className="text-slate-600">{item.value}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${(item.value / maxDecisions) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {decisionsByCongregation.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Sem dados</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. COLLABORATORS CHART */}
                <Card className="border-blue-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-blue-700 text-lg">
                            <Users className="w-5 h-5" />
                            Força de Trabalho
                        </CardTitle>
                        <CardDescription>Voluntários cadastrados por local</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            {collaboratorsByCongregation.map((item) => (
                                <div key={item.name} className="space-y-1">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="truncate max-w-[180px]" title={item.name}>{item.name}</span>
                                        <span className="text-slate-600">{item.value}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${(item.value / maxCollaborators) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {collaboratorsByCongregation.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Sem dados</p>}
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* GENERAL STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <TrendingUp className="w-8 h-8 text-indigo-500 mb-2" />
                        <span className="text-3xl font-bold text-slate-900">
                            {eventsByCongregation.reduce((acc, curr) => acc + curr.value, 0)}
                        </span>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Eventos</span>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <Target className="w-8 h-8 text-emerald-500 mb-2" />
                        <span className="text-3xl font-bold text-slate-900">
                            {decisionsByCongregation.reduce((acc, curr) => acc + curr.value, 0)}
                        </span>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Vidas</span>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <Users className="w-8 h-8 text-blue-500 mb-2" />
                        <span className="text-3xl font-bold text-slate-900">
                            {collaborators.length}
                        </span>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Voluntários</span>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <CalendarDays className="w-8 h-8 text-amber-500 mb-2" />
                        <span className="text-3xl font-bold text-slate-900">
                            {new Date().getFullYear()}
                        </span>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ano Corrente</span>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
