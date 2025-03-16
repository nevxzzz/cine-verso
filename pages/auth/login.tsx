import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import AuthLayout from '@/components/layout/AuthLayout';
import FormField from '@/components/ui/FormField';
import { useAuth } from '@/hooks/useAuth';
import PublicRoute from '@/components/auth/PublicRoute';

const LoginPage = () => {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Validação básica
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = 'O email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'A senha é obrigatória';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { user, error } = await signIn(email, password);
      
      if (error) {
        if (error.includes('auth/wrong-password') || error.includes('auth/user-not-found')) {
          setLoginError('Email ou senha incorretos');
        } else {
          setLoginError('Ocorreu um erro ao fazer login. Tente novamente.');
        }
        return;
      }

      if (user) {
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setLoginError('Ocorreu um erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { user, error } = await signInWithGoogle();
      if (error) {
        setLoginError('Erro ao fazer login com Google');
        return;
      }
      if (user) {
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
      setLoginError('Erro ao fazer login com Google');
    }
  };

  return (
    <PublicRoute>
      <>
        <Head>
          <title>Login | CineVerso</title>
          <meta name="description" content="Faça login na sua conta CineVerso para acessar filmes e séries exclusivos." />
        </Head>
        
        <AuthLayout 
          title="Entrar na sua conta" 
          subtitle="Bem-vindo de volta! Entre com suas credenciais para continuar."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {loginError}
              </div>
            )}

            <FormField
              label="Email"
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<FaEnvelope />}
              required
            />
            
            <FormField
              label="Senha"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={<FaLock />}
              required
            />
            
            <div className="flex items-center justify-end">
              <Link href="/auth/recuperar-senha" className="text-sm text-primary hover:text-primary-dark transition-colors">
                Esqueceu a senha?
              </Link>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full btn-primary flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : 'Entrar'}
            </button>
          </form>
          
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-gray-400">Ou</span>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded bg-background-alt hover:bg-background-light transition-colors duration-200"
              >
                <FaGoogle className="text-red-500 w-5 h-5" />
                <span className="text-sm font-medium">Entrar com Google</span>
              </button>
            </div>
          </div>
          
          <p className="mt-4 text-center text-sm text-gray-400">
            Não tem uma conta?{' '}
            <Link href="/auth/criar-conta" className="text-primary hover:text-primary-dark transition-colors font-medium">
              Criar conta
            </Link>
          </p>
        </AuthLayout>
      </>
    </PublicRoute>
  );
};

export default LoginPage; 