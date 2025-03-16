import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { FaSearch, FaStar, FaPlay, FaImage } from 'react-icons/fa';
import { imdbService, getImageUrl } from '@/lib/services/imdb';
import Link from 'next/link';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  media_type: 'movie' | 'tv' | 'person';
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

const SearchPage: React.FC = () => {
  const router = useRouter();
  const { q } = router.query;
  
  const [searchQuery, setSearchQuery] = useState<string>((q as string) || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Realizar a pesquisa quando a query mudar
  useEffect(() => {
    if (q) {
      setSearchQuery(q as string);
      performSearch(q as string);
    }
  }, [q]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Buscar da API
      const data = await imdbService.search(query);
      
      if (!data || !data.results) {
        throw new Error('Formato de resposta inválido');
      }
      
      // Filtrar apenas filmes e séries
      const filteredResults = data.results.filter(
        (item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
      );
      
      setResults(filteredResults);
    } catch (err: any) {
      console.error('Erro ao buscar resultados:', err);
      setError('Ocorreu um erro ao buscar os resultados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Atualizar a URL com a query de pesquisa
    router.push({
      pathname: '/search',
      query: { q: searchQuery }
    }, undefined, { shallow: true });
    
    performSearch(searchQuery);
  };

  const getTitle = (item: SearchResult) => {
    return item.title || item.name || 'Sem título';
  };

  const getYear = (item: SearchResult) => {
    if (item.release_date) {
      return new Date(item.release_date).getFullYear();
    }
    if (item.first_air_date) {
      return new Date(item.first_air_date).getFullYear();
    }
    return '';
  };

  const getDetailUrl = (item: SearchResult) => {
    return item.media_type === 'movie' 
      ? `/movie/${item.id}` 
      : `/series/${item.id}`;
  };

  // Função para lidar com erro de carregamento de imagem
  const handleImageError = (itemId: number) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  // Filtra resultados com erros de imagem
  const validResults = results.filter(item => !imageErrors[item.id]);

  return (
    <Layout>
      <Head>
        <title>Buscar | CineVerse</title>
        <meta name="description" content="Busque por filmes e séries no CineVerse" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-6 py-12 mt-16">
        <h1 className="text-3xl font-bold mb-4">Buscar</h1>
        
        <div className="text-center mb-6">
          <FaSearch size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-medium mb-2">Busque por filmes e séries</h2>
          <p className="text-gray-400">
            Digite o nome de um filme ou série para começar a buscar.
          </p>
        </div>
        
        {/* Formulário de Busca */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar filmes, séries..."
              className="w-full bg-background-light py-3 px-5 pr-12 rounded-full focus:outline-none focus:ring-0"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <FaSearch size={18} />
            </button>
          </div>
        </form>

        {/* Estado de Carregamento */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Buscando resultados...</p>
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <div className="text-center py-8 bg-red-900/20 rounded-lg p-6">
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-500 font-semibold mb-2">{error}</p>
              <p className="text-gray-400 mb-4">Verifique sua conexão com a internet e tente novamente.</p>
              <button 
                onClick={() => performSearch(searchQuery)}
                className="btn-primary py-2 px-4"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {/* Resultados da Busca */}
        {!isLoading && !error && validResults.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Resultados para &quot;{q}&quot;</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {validResults.map((item) => (
                <div key={item.id} className="relative w-[180px]">
                  <Link href={getDetailUrl(item)}>
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden movie-card-hover group">
                      <Image
                        src={getImageUrl(item.poster_path)}
                        alt={getTitle(item)}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(item.id)}
                      />
                      
                      {/* Overlay ao passar o mouse */}
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="text-center text-sm font-semibold mb-2 truncate w-full">
                          {getTitle(item)}
                        </h3>
                        <div className="flex items-center space-x-2 mb-3">
                          <FaStar className="text-accent" size={12} />
                          <span>{item.vote_average.toFixed(1)}</span>
                          <span className="text-gray-400">
                            {getYear(item) ? `(${getYear(item)})` : ''}
                          </span>
                        </div>
                        <button className="btn-primary py-1 px-4 flex items-center text-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(getDetailUrl(item));
                          }}
                        >
                          <FaPlay className="mr-2" size={12} /> Assistir
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="mt-2 text-sm font-medium truncate">
                      {getTitle(item)}
                    </h3>
                    <div className="flex items-center text-xs text-gray-400">
                      <span>{item.media_type === 'movie' ? 'Filme' : 'Série'}</span>
                      {getYear(item) && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{getYear(item)}</span>
                        </>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nenhum Resultado */}
        {!isLoading && !error && searchQuery && validResults.length === 0 && (
          <div className="text-center py-12">
            <FaSearch size={48} className="mx-auto text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Nenhum resultado encontrado</h2>
            <p className="text-gray-400">
              Não encontramos nenhum resultado para &quot;{searchQuery}&quot;. Tente buscar por outro termo.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage; 