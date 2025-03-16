import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaEnvelope } from 'react-icons/fa';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AuthLayout from '@/components/layout/AuthLayout';
import FormField from '@/components/ui/FormField';

const RecuperarSenhaPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setMessage({ type: 'error', text: 'Por favor, insira um email válido.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({
        type: 'success',
        text: 'Email de recuperação enviado! Verifique sua caixa de entrada.'
      });
      setEmail('');
    } catch (error: any) {
      let errorMessage = 'Ocorreu um erro ao enviar o email de recuperação.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Não existe uma conta com este email.';
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Recuperar Senha | CineVerso</title>
        <meta name="description" content="Recupere sua senha da CineVerso" />
      </Head>

      <AuthLayout
        title="Recuperar senha"
        subtitle="Digite seu email para receber um link de recuperação de senha."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className={`p-3 rounded ${
              message.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-500' 
                : 'bg-red-500/10 border border-red-500/20 text-red-500'
            } text-sm`}>
              {message.text}
            </div>
          )}

          <FormField
            label="Email"
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<FaEnvelope />}
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full btn-primary flex items-center justify-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : 'Enviar link de recuperação'}
          </button>

          <p className="mt-4 text-center text-sm text-gray-400">
            Lembrou sua senha?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary-dark transition-colors font-medium">
              Voltar para o login
            </Link>
          </p>
        </form>
      </AuthLayout>
    </>
  );
};

export default RecuperarSenhaPage; 