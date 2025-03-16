/**
 * Hook de Autenticação
 * 
 * Este hook personalizado gerencia a autenticação de usuários no CineVerso,
 * fornecendo funções para login, registro, autenticação com Google e logout.
 */
import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * Hook que gerencia o estado de autenticação e fornece métodos para autenticação
 * @returns Objeto com o usuário atual, estado de carregamento e funções de autenticação
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Efeito que observa mudanças no estado de autenticação
   * Atualiza o estado do usuário quando ele faz login ou logout
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Cria uma nova conta de usuário com email e senha
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @returns Objeto com o usuário criado ou mensagem de erro
   */
  const signUp = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  };

  /**
   * Realiza login com email e senha
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @returns Objeto com o usuário autenticado ou mensagem de erro
   */
  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  };

  /**
   * Realiza login com a conta Google do usuário
   * Abre um popup para seleção da conta Google
   * @returns Objeto com o usuário autenticado ou mensagem de erro
   */
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return { user: userCredential.user, error: null };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  };

  /**
   * Realiza o logout do usuário atual
   * @returns Objeto com status de sucesso ou mensagem de erro
   */
  const logout = async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout
  };
} 