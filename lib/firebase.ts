/**
 * Configuração e inicialização do Firebase para o CineVerso
 * Este arquivo configura a conexão com o Firebase para autenticação e banco de dados
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Configuração do Firebase com as variáveis de ambiente
 * Estas configurações são carregadas do arquivo .env.local
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

/**
 * Inicializa o aplicativo Firebase com a configuração fornecida
 */
const app = initializeApp(firebaseConfig);

/**
 * Exporta o serviço de autenticação do Firebase
 * Usado para gerenciar login, registro e estado de autenticação dos usuários
 */
export const auth = getAuth(app);

/**
 * Exporta o serviço Firestore (banco de dados) do Firebase
 * Usado para armazenar dados de usuários, favoritos, listas, etc.
 */
export const db = getFirestore(app);

/**
 * Exporta a instância do aplicativo Firebase como padrão
 */
export default app; 