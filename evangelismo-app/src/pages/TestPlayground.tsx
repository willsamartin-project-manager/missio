import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import Dashboard from './Dashboard';
import NewEvent from './NewEvent';
import Collaborators from './Collaborators';
import Settings from './Settings';
import { LayoutDashboard, PlusCircle, Users, Settings as SettingsIcon, AlertTriangle } from 'lucide-react';

export default function TestPlayground() {
    const [activeView, setActiveView] = useState('dashboard');

    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <Dashboard />;
            case 'new-event': return <NewEvent />;
            case 'collaborators': return <Collaborators />;
            case 'settings': return <Settings />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Test Header */}
            <div className="bg-amber-100 border-b border-amber-200 p-4 sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-800 font-bold">
                        <AlertTriangle className="w-5 h-5" />
                        <span>TEST MODE / PLAYGROUND</span>
                    </div>
                    <div className="text-xs text-amber-700 font-mono">
                        Bypassing Authentication
                    </div>
                </div>
            </div>

            {/* Layout Simulation */}
            <div className="flex flex-1 container mx-auto p-4 gap-6">
                {/* Mini Sidebar for Test */}
                <Card className="w-64 h-fit p-4 space-y-2 sticky top-24">
                    <div className="text-sm font-semibold text-slate-500 mb-4 px-2">Navegação de Teste</div>

                    <Button
                        variant={activeView === 'dashboard' ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveView('dashboard')}
                    >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                    </Button>

                    <Button
                        variant={activeView === 'new-event' ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveView('new-event')}
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Novo Evento
                    </Button>

                    <Button
                        variant={activeView === 'collaborators' ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveView('collaborators')}
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Colaboradores
                    </Button>

                    <Button
                        variant={activeView === 'settings' ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveView('settings')}
                    >
                        <SettingsIcon className="w-4 h-4 mr-2" />
                        Configurações
                    </Button>
                </Card>

                {/* Content Area */}
                <main className="flex-1">
                    {renderView()}
                </main>
            </div>
        </div>
    );
}
