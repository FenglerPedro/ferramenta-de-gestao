
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        ownerName: '',
        businessName: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!supabase) throw new Error('Supabase não configurado');

            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        owner_name: formData.ownerName,
                        business_name: formData.businessName,
                    },
                },
            });

            if (error) throw error;

            toast.success('Conta criada com sucesso! Verifique seu email.');
            navigate('/auth/login');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Crie sua conta</h1>
                <p className="text-muted-foreground">
                    Comece a gerenciar seu negócio gratuitamente
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="ownerName">Seu Nome</Label>
                    <Input
                        id="ownerName"
                        placeholder="Ex: João Silva"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="businessName">Nome do Negócio</Label>
                    <Input
                        id="businessName"
                        placeholder="Ex: Consultoria Silva"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="nome@exemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        disabled={loading}
                        minLength={6}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Conta
                </Button>
            </form>

            <div className="text-center text-sm">
                Já tem uma conta?{' '}
                <Link to="/auth/login" className="font-medium text-primary hover:underline">
                    Entrar
                </Link>
            </div>
        </div>
    );
}
