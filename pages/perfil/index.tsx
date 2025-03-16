import React, { useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FaUser, FaHeart, FaClock, FaHistory, FaEdit, FaCamera, FaCog, FaKey, FaSignOutAlt, FaTrash, FaStar, FaPlay } from 'react-icons/fa';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useUserLists } from '@/hooks/useUserLists';
import { getImageUrl } from '@/lib/services/imdb';
import { useRouter } from 'next/router';
import { sendPasswordResetEmail, deleteUser, EmailAuthProvider, reauthenticateWithCredential, GoogleAuthProvider, reauthenticateWithPopup, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Toast from '@/components/ui/Toast';
import MovieCard from '@/components/ui/MovieCard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface ToastMessage {
  type: 'success' | 'error';
  message: string;
}

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { favorites, watchlist, loading } = useUserLists();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'favoritos' | 'assistir' | 'historico'>('favoritos');
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const tabs = [
    { id: 'favoritos', label: 'Favoritos', icon: FaHeart, count: favorites.length },
    { id: 'assistir', label: 'Quero Assistir', icon: FaClock, count: watchlist.length },
    { id: 'historico', label: 'Histórico', icon: FaHistory, count: 0 }
  ];

  const getMediaLink = (item: { id: number; media_type: 'movie' | 'tv' }) => {
    return item.media_type === 'movie' ? `/movie/${item.id}` : `/series/${item.id}`;
  };

  const handleLogout = async () => {
    const { error } = await logout();
    if (!error) {
      router.push('/');
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setToast({
        type: 'success',
        message: 'Email de redefinição de senha enviado! Verifique sua caixa de entrada.'
      });
    } catch (error) {
      console.error('Erro ao enviar email de redefinição:', error);
      setToast({
        type: 'error',
        message: 'Erro ao enviar email de redefinição de senha. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Verifica se o usuário está logado com Google
      const isGoogleUser = user.providerData[0]?.providerId === 'google.com';

      if (isGoogleUser) {
        // Reautentica com Google
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else {
        // Reautentica com email/senha
        if (!deletePassword) {
          setToast({
            type: 'error',
            message: 'Por favor, digite sua senha.'
          });
          setIsLoading(false);
          return;
        }
        const credential = EmailAuthProvider.credential(user.email!, deletePassword);
        await reauthenticateWithCredential(user, credential);
      }

      await deleteUser(user);
      router.push('/');
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      let errorMessage = 'Erro ao excluir conta. Tente novamente.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta. Tente novamente.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Operação cancelada. Tente novamente.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por favor, faça login novamente para continuar.';
      }

      setToast({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentList = () => {
    switch (activeTab) {
      case 'favoritos':
        return favorites;
      case 'assistir':
        return watchlist;
      case 'historico':
        return [];
      default:
        return [];
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setIsUploadingPhoto(true);
    try {
      // Criar FormData para enviar a imagem
      const formData = new FormData();
      formData.append('image', file);
      
      // Fazer upload para o ImgBB
      const response = await fetch('https://api.imgbb.com/1/upload?key=59d3261438b3d682dc25743a35d01eda', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Atualizar foto do perfil no Firebase Auth
        await updateProfile(user!, {
          photoURL: data.data.url
        });
        
        setToast({
          type: 'success',
          message: 'Foto de perfil atualizada com sucesso!'
        });
      } else {
        throw new Error('Falha ao fazer upload da imagem');
      }
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      setToast({
        type: 'error',
        message: 'Erro ao atualizar foto de perfil. Tente novamente.'
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tamanho do arquivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setToast({
          type: 'error',
          message: 'A imagem deve ter no máximo 2MB'
        });
        return;
      }
      
      // Verificar tipo do arquivo
      if (!file.type.startsWith('image/')) {
        setToast({
          type: 'error',
          message: 'Por favor, selecione apenas arquivos de imagem'
        });
        return;
      }
      
      handlePhotoUpload(file);
    }
  };

  const handleUpdateDisplayName = async () => {
    if (!user || !newDisplayName.trim()) return;
    
    setIsLoading(true);
    try {
      await updateProfile(user, {
        displayName: newDisplayName.trim()
      });
      
      setToast({
        type: 'success',
        message: 'Nome atualizado com sucesso!'
      });
      setShowEditName(false);
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      setToast({
        type: 'error',
        message: 'Erro ao atualizar nome. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para mudar de aba com animação
  const handleTabChange = (tabId: typeof activeTab) => {
    if (tabId === activeTab) return;
    
    setIsTabChanging(true);
    setTimeout(() => {
      setActiveTab(tabId);
      setIsTabChanging(false);
    }, 200);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Meu Perfil | CineVerso</title>
          <meta name="description" content="Gerencie seu perfil, favoritos e lista de filmes para assistir no CineVerso." />
        </Head>

        <div className="container mx-auto px-6 py-12 mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna da Esquerda - Perfil e Conteúdo */}
            <div className="lg:col-span-2 space-y-6">
              {/* Seção do Perfil */}
              <div className="bg-background-alt rounded-xl p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-background-light relative ring-2 ring-primary/20">
                      {user?.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt={user.displayName || 'Avatar'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaUser size={32} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="absolute bottom-0 right-0 z-10 bg-primary hover:bg-primary-dark p-2 rounded-full transition-colors disabled:opacity-50 shadow-lg"
                    >
                      {isUploadingPhoto ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaCamera size={12} />
                      )}
                    </button>
                  </div>

                  {/* Informações do Perfil */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <h1 className="text-2xl font-bold">{user?.displayName || 'Usuário'}</h1>
                      <button 
                        onClick={() => {
                          setNewDisplayName(user?.displayName || '');
                          setShowEditName(true);
                        }}
                        className="text-primary hover:text-primary-dark transition-colors"
                      >
                        <FaEdit size={18} />
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    
                    {/* Estatísticas Básicas */}
                    <div className="flex items-center gap-6 mt-4 justify-center md:justify-start">
                      <div className="text-center">
                        <p className="text-xl font-bold text-primary">{favorites.length}</p>
                        <p className="text-xs text-gray-400">Favoritos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-primary">{watchlist.length}</p>
                        <p className="text-xs text-gray-400">Para Assistir</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs e Conteúdo */}
              <div className="bg-background-alt rounded-xl p-6 overflow-hidden">
                <div className="flex overflow-x-auto hide-scrollbar gap-4 mb-6">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id as typeof activeTab)}
                      className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'bg-background-light text-gray-300 hover:bg-background-light/80'
                      }`}
                    >
                      <tab.icon className="mr-2" />
                      <span>{tab.label}</span>
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-background-light/10 text-sm font-medium">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div 
                  className="transition-all duration-200 rounded-lg" 
                  style={{ 
                    opacity: isTabChanging ? 0.95 : 1,
                    transform: isTabChanging ? 'scale(0.995)' : 'scale(1)',
                    backgroundColor: isTabChanging ? 'rgba(20, 20, 20, 0.3)' : 'transparent'
                  }}
                >
                  {loading ? (
                    <div className="text-center py-8 text-gray-400">Carregando...</div>
                  ) : getCurrentList().length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="mb-2">Nenhum item encontrado</p>
                      <p className="text-sm">
                        {activeTab === 'favoritos' 
                          ? 'Favorite filmes e séries para encontrá-los aqui'
                          : activeTab === 'assistir'
                            ? 'Adicione filmes e séries que você quer assistir'
                            : 'Seu histórico aparecerá aqui'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {getCurrentList().map((item) => (
                        <div key={item.id} className="flex flex-col">
                          <MovieCard 
                            id={item.id}
                            title={item.title || item.name || ''}
                            poster={getImageUrl(item.poster_path)}
                            year={new Date(item.added_at).getFullYear().toString()}
                            rating={item.vote_average || 0}
                            mediaType={item.media_type}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna da Direita - Configurações */}
            <div className="lg:col-span-1">
              <div className="bg-background-alt rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Configurações da Conta</h2>
                
                {/* Lista de Configurações */}
                <div className="space-y-4">
                  <button 
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-4 rounded-lg bg-background-light hover:bg-background text-left group transition-colors"
                  >
                    <div className="flex items-center">
                      <FaKey className="text-primary group-hover:text-primary-dark mr-3" />
                      <div>
                        <p className="font-medium">Alterar Senha</p>
                        <p className="text-sm text-gray-400">Atualize sua senha</p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full flex items-center justify-between p-4 rounded-lg bg-background-light hover:bg-background text-left group transition-colors">
                    <div className="flex items-center">
                      <FaCog className="text-primary group-hover:text-primary-dark mr-3" />
                      <div>
                        <p className="font-medium">Preferências</p>
                        <p className="text-sm text-gray-400">Personalize sua experiência</p>
                      </div>
                    </div>
                  </button>

                  <div className="pt-4 border-t border-gray-700">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-background-light hover:bg-red-500/10 text-left group transition-colors"
                    >
                      <div className="flex items-center">
                        <FaSignOutAlt className="text-red-500 mr-3" />
                        <div>
                          <p className="font-medium text-red-500">Sair da Conta</p>
                          <p className="text-sm text-gray-400">Encerrar sessão atual</p>
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-background-light hover:bg-red-500/10 text-left group transition-colors mt-2"
                    >
                      <div className="flex items-center">
                        <FaTrash className="text-red-500 mr-3" />
                        <div>
                          <p className="font-medium text-red-500">Excluir Conta</p>
                          <p className="text-sm text-gray-400">Remover permanentemente sua conta</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-background-alt rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Excluir Conta</h3>
            <p className="text-gray-400 mb-6">
              Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão perdidos.
            </p>
            {user?.providerData[0]?.providerId !== 'google.com' && (
              <div className="space-y-4 mb-6">
                <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-300">
                  Digite sua senha para confirmar
                </label>
                <input
                  type="password"
                  id="deletePassword"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background text-white border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Digite sua senha"
                />
              </div>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                }}
                className="px-4 py-2 rounded bg-background-light hover:bg-background text-gray-300"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isLoading || (!user?.providerData[0]?.providerId.includes('google.com') && !deletePassword)}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
              >
                {isLoading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Nome */}
      {showEditName && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-background-alt rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Alterar Nome</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                  Novo nome
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background text-white border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Digite seu novo nome"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowEditName(false)}
                className="px-4 py-2 rounded bg-background-light hover:bg-background text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateDisplayName}
                disabled={isLoading || !newDisplayName.trim()}
                className="px-4 py-2 rounded bg-primary hover:bg-primary-dark text-white disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de Notificações */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </ProtectedRoute>
  );
};

export default ProfilePage; 