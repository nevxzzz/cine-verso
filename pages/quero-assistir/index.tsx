import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { useUserLists } from '@/hooks/useUserLists';
import { imdbService } from '@/lib/services/imdb';
import { useAuth } from '@/hooks/useAuth';
import { FaFilm, FaTv, FaList } from 'react-icons/fa';
import MovieCard from '@/components/ui/MovieCard';
import Link from 'next/link';
import Image from 'next/image';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  media_type: 'movie' | 'tv';
  added_at: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

const WatchlistPage = () => {
  const { watchlist, loading } = useUserLists();
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredItems(watchlist);
    } else {
      setFilteredItems(watchlist.filter(item => item.media_type === activeFilter));
    }
  }, [watchlist, activeFilter]);

  // Função para obter o ano de lançamento
  const getYear = (item: MediaItem) => {
    const dateString = item.release_date || item.first_air_date || '';
    return dateString ? dateString.substring(0, 4) : '';
  };

  const filters = [
    { id: 'all', name: 'Todos', icon: <FaList /> },
    { id: 'movie', name: 'Filmes', icon: <FaFilm /> },
    { id: 'tv', name: 'Séries', icon: <FaTv /> },
  ];

  return (
    <Layout>
      <Head>
        <title>Quero Assistir | CineVerso</title>
        <meta name="description" content="Sua lista de filmes e séries para assistir no CineVerso." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="pb-10">
        {/* Espaço reservado para compensar o header principal */}
        <div className="h-16"></div>
        
        {/* Título da página */}
        <div className="container mx-auto px-6 pt-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Quero Assistir</h1>
            <p className="text-gray-400">
              Sua lista personalizada de filmes e séries para assistir mais tarde.
            </p>
          </div>
        
          {/* Filtros */}
          <div className="mb-8">
            <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap category-button ${
                    activeFilter === filter.id
                      ? 'bg-primary text-white active'
                      : 'bg-background-light text-gray-300'
                  }`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  <span className="mr-2">{filter.icon}</span>
                  {filter.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : !user ? (
            <div className="bg-background-alt/50 rounded-xl p-8 text-center">
              <h2 className="text-xl font-bold mb-4">Faça login para ver sua lista</h2>
              <p className="text-gray-400 mb-6">
                Você precisa estar logado para adicionar filmes e séries à sua lista "Quero Assistir".
              </p>
              <Link 
                href="/auth/login"
                className="btn-primary inline-block"
              >
                Fazer Login
              </Link>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-background-alt/50 rounded-xl p-8 text-center">
              <h2 className="text-xl font-bold mb-4">Sua lista está vazia</h2>
              <p className="text-gray-400 mb-6">
                Você ainda não adicionou nenhum {activeFilter === 'movie' ? 'filme' : activeFilter === 'tv' ? 'série' : 'filme ou série'} à sua lista "Quero Assistir".
              </p>
              <Link 
                href={activeFilter === 'movie' ? '/movies' : activeFilter === 'tv' ? '/series' : '/'}
                className="btn-primary inline-block"
              >
                Explorar {activeFilter === 'movie' ? 'Filmes' : activeFilter === 'tv' ? 'Séries' : 'Conteúdo'}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredItems.map((item) => (
                <div key={`${item.id}-${item.media_type}`} className="flex flex-col">
                  <MovieCard 
                    id={item.id}
                    title={item.title || item.name || ''}
                    poster={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    year={getYear(item)}
                    rating={item.vote_average || 0}
                    mediaType={item.media_type}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WatchlistPage; 