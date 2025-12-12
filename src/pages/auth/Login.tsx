
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmail(formData.email, formData.password);
      navigate('/');
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
        <p className="text-muted-foreground">
          Entre com suas credenciais para acessar sua conta
        </p>
      </div>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <LogIn className="h-4 w-4" />
          Entrar com Google (Demo)
        </Button>

        <div className="flex items-center justify-center text-sm text-muted-foreground">ou</div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <span className="text-sm text-muted-foreground">Sem recuperação (demo)</span>
            </div>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>
      </div>

      <div className="text-center text-sm">
        Não tem uma conta?{' '}
        <Link to="/auth/register" className="font-medium text-primary hover:underline">
          Cadastre-se
        </Link>
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 rounded text-sm">
        <p className="font-semibold">Demo Mode</p>
        <p className="text-xs mt-1">
          Use: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">test@example.com</code> /
          <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded ml-1">password123</code>
        </p>
        <p className="text-xs mt-2">Dados salvos apenas em localStorage (não persistem após limpar cache)</p>
      </div>
    </div>
  );
}

