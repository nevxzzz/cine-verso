import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaUser, FaEnvelope, FaLock, FaGoogle } from 'react-icons/fa';
import { updateProfile } from 'firebase/auth';
import AuthLayout from '@/components/layout/AuthLayout';
import FormField from '@/components/ui/FormField';
import { useAuth } from '@/hooks/useAuth';
import PublicRoute from '@/components/auth/PublicRoute';

const CriarContaPage = () => {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    nome?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signUpError, setSignUpError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    
    // Validação básica
    const newErrors: {
      nome?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      terms?: string;
    } = {};
    
    if (!nome) {
      newErrors.nome = 'O nome é obrigatório';
    }
    
    if (!email) {
      newErrors.email = 'O email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'A senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    // Verificação dos termos sem adicionar ao objeto de erros
    const termsNotAccepted = !termsAccepted;
    
    if (Object.keys(newErrors).length > 0 || termsNotAccepted) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { user, error } = await signUp(email, password);
      
      if (error) {
        if (error.includes('auth/email-already-in-use')) {
          setSignUpError('Este email já está em uso');
        } else {
          setSignUpError('Ocorreu um erro ao criar a conta. Tente novamente.');
        }
        return;
      }

      if (user) {
        try {
          await updateProfile(user, {
            displayName: nome
          });
        } catch (error) {
          console.error('Erro ao atualizar o perfil:', error);
        }

        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      setSignUpError('Ocorreu um erro ao criar a conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { user, error } = await signInWithGoogle();
      if (error) {
        setSignUpError('Erro ao criar conta com Google');
        return;
      }
      if (user) {
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao criar conta com Google:', error);
      setSignUpError('Erro ao criar conta com Google');
    }
  };

  return (
    <PublicRoute>
      <>
        <Head>
          <title>Criar Conta | CineVerso</title>
          <meta name="description" content="Crie sua conta na CineVerso para acessar filmes e séries exclusivos." />
        </Head>
        
        <AuthLayout 
          title="Criar sua conta" 
          subtitle="Junte-se à CineVerso e tenha acesso a milhares de filmes e séries."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {signUpError && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {signUpError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Nome"
                id="nome"
                type="text"
                placeholder="Nome de Usuário"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                error={errors.nome}
                icon={<FaUser />}
                required
              />
              
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
              
              <FormField
                label="Confirmar senha"
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                icon={<FaLock />}
                required
              />
            </div>
            
            <div className="flex items-start mt-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-600 rounded bg-background-alt"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-300">
                  Eu concordo com os{' '}
                  <Link href="/termos" className="text-primary hover:text-primary-dark transition-colors">
                    Termos de Serviço
                  </Link>{' '}
                  e{' '}
                  <Link href="/privacidade" className="text-primary hover:text-primary-dark transition-colors">
                    Política de Privacidade
                  </Link>
                </label>
                {!termsAccepted && <p className="mt-1 text-sm text-red-500">Você deve aceitar os termos e condições</p>}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full btn-primary flex items-center justify-center mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando conta...
                </>
              ) : 'Criar conta'}
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
                <span className="text-sm font-medium">Continuar com Google</span>
              </button>
            </div>
          </div>
          
          <p className="mt-4 text-center text-sm text-gray-400">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary-dark transition-colors font-medium">
              Entrar
            </Link>
          </p>
        </AuthLayout>
      </>
    </PublicRoute>
  );
};

export default CriarContaPage; 