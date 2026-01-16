import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { useCongregations } from '../hooks/useCongregations';

export default function Register() {
    const navigate = useNavigate();
    const { congregations, loading: loadingCongs } = useCongregations();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [congregation, setCongregation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (!congregation) {
            setError('Selecione sua congregação.');
            return;
        }

        setLoading(true);

        try {
            // 1. Sign up the user
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) throw signUpError;

            // 2. Update the profile with the selected congregation
            if (data.user) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ congregation })
                    .eq('id', data.user.id);

                if (updateError) {
                    console.error('Error updating profile with congregation:', updateError);
                    // We continue anyway, as the user is created
                }
            }

            // Successful registration
            navigate('/pending-approval');

        } catch (error: any) {
            setError(error.message || 'Erro ao criar conta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
                    <CardDescription className="text-center">
                        Cadastre-se para acessar o sistema de evangelismo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="congregation">Congregação</Label>
                            <select
                                id="congregation"
                                value={congregation}
                                onChange={(e) => setCongregation(e.target.value)}
                                required
                                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Selecione...</option>
                                {congregations.map(cong => (
                                    <option key={cong.id} value={cong.name}>
                                        {cong.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={loading || loadingCongs}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <span>Cadastrar</span>
                        </Button>
                        <div className="text-center text-sm text-slate-500 mt-4">
                            Já tem uma conta? <Link to="/login" className="text-indigo-600 hover:underline">Faça login</Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
