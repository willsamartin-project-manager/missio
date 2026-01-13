import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PendingApproval() {
    const { signOut, refreshProfile, isApproved } = useAuth();
    const navigate = useNavigate();

    const handleCheckStatus = async () => {
        await refreshProfile();
        if (isApproved) {
            navigate('/dashboard');
        } else {
            alert('Sua conta ainda está aguardando aprovação.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="bg-amber-100 p-4 rounded-full">
                            <Clock className="w-12 h-12 text-amber-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Aguardando Aprovação</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Seu cadastro foi realizado com sucesso!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-slate-600">
                        Por motivos de segurança, o acesso ao sistema requer aprovação de um administrador.
                        Você receberá acesso assim que sua solicitação for processada.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button onClick={handleCheckStatus} variant="outline" className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Verificar Status
                        </Button>
                        <Button onClick={() => signOut()} variant="ghost" className="w-full text-slate-500">
                            Sair e voltar depois
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
