import { useState, useEffect } from 'react';
import { LayoutDashboard, Settings, Users, Users2, Church, PlusCircle, BarChart3 } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut, user, isAdmin } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    // Initial fetch of pending approvals
    useEffect(() => {
        if (isAdmin) {
            fetchPendingCount();
        }
    }, [isAdmin]);

    // Set up polling interval to check for updates (every 60s)
    useEffect(() => {
        if (!isAdmin) return;

        const interval = setInterval(fetchPendingCount, 60000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    const fetchPendingCount = async () => {
        try {
            const { count, error } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('approved', false);

            if (!error && count !== null) {
                setPendingCount(count);
            }
        } catch (error) {
            console.error('Error fetching pending count:', error);
        }
    };

    const navItems: { icon: any; label: string; path: string; alert?: boolean }[] = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Colaboradores', path: '/collaborators' },
        { icon: PlusCircle, label: 'Novo Evento', path: '/new-event' },
    ];

    // Add admin-only links
    if (isAdmin) {
        navItems.push({ icon: BarChart3, label: 'Indicadores', path: '/performance' });
        // Add alert to Settings if meaningful
        navItems.push({
            icon: Settings,
            label: 'Configurações',
            path: '/settings',
            alert: pendingCount > 0
        });
        navItems.push({ icon: Users2, label: 'Usuários', path: '/users' });
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                            <Church size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl text-slate-800 leading-tight">Missio</h1>
                            <p className="text-xs text-slate-500 font-medium truncate max-w-[140px]">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <Icon size={20} className={cn(isActive ? "text-indigo-600" : "text-slate-400")} />
                                {item.label}
                                {item.alert && (
                                    <span className="ml-auto flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-indigo-900" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg shadow-indigo-500/20">
                        <p className="text-xs font-medium opacity-80 mb-1">Assembléia de Deus</p>
                        <p className="text-sm font-bold">Ministério do Belém</p>
                        <p className="text-xs opacity-70 mt-1">SJC - SP</p>
                    </div>
                </div>
            </aside>

            {/* Mobile Header (visible only on small screens) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center px-4 z-50 justify-between">
                <div className="flex items-center">
                    <Church className="text-indigo-600 mr-2" />
                    <span className="font-bold text-lg">Missio</span>
                </div>
                <span className="text-xs text-slate-500">{user?.email}</span>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto md:p-8 p-4 pt-20 md:pt-8">
                <div className="max-w-5xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
