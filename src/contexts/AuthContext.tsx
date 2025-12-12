
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

// Mock User e Session interfaces (sem dependência do Supabase)
interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface Session {
  user: User | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
});

const STORAGE_KEY = 'app_auth_session';
const USERS_KEY = 'app_users_db';

interface StoredUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  createdAt: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sessão ao montar
  useEffect(() => {
    const storedSession = localStorage.getItem(STORAGE_KEY);
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        setUser(sessionData.user);
        setSession(sessionData);
      } catch (err) {
        console.error('Erro ao restaurar sessão:', err);
      }
    }
    setLoading(false);
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const usersData = localStorage.getItem(USERS_KEY);
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];

      const foundUser = users.find((u) => u.email === email && u.password === password);

      if (!foundUser) {
        throw new Error('Email ou senha incorretos');
      }

      const newUser: User = {
        id: foundUser.id,
        email: foundUser.email,
        user_metadata: {
          full_name: foundUser.fullName,
        },
      };

      const newSession: Session = { user: newUser };

      setUser(newUser);
      setSession(newSession);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));

      toast.success('Login realizado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao fazer login:', err);
      toast.error(err.message || 'Erro ao fazer login');
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const usersData = localStorage.getItem(USERS_KEY);
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];

      // Verificar se usuário já existe
      if (users.some((u) => u.email === email)) {
        throw new Error('Este email já está cadastrado');
      }

      // Criar novo usuário
      const newStoredUser: StoredUser = {
        id: `user_${Date.now()}`,
        email,
        password, // ⚠️ Apenas para demo! Em produção, usar hash
        fullName,
        createdAt: new Date().toISOString(),
      };

      users.push(newStoredUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      // Fazer login automaticamente
      await signInWithEmail(email, password);

      toast.success('Cadastro realizado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao fazer cadastro:', err);
      toast.error(err.message || 'Erro ao fazer cadastro');
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Simular login com Google - apenas demo
      const simulatedGoogleUser: User = {
        id: `google_${Date.now()}`,
        email: `user${Date.now()}@gmail.com`,
        user_metadata: {
          full_name: 'Google User Demo',
        },
      };

      const newSession: Session = { user: simulatedGoogleUser };

      setUser(simulatedGoogleUser);
      setSession(newSession);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));

      toast.success('Login com Google simulado (demo)');
    } catch (err: any) {
      console.error('Erro ao fazer login com Google:', err);
      toast.error('Erro ao autenticar com Google');
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setSession(null);
      localStorage.removeItem(STORAGE_KEY);
      toast.success('Você saiu da conta');
    } catch (err: any) {
      console.error('Erro ao sair:', err);
      toast.error('Erro ao sair');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signOut,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
