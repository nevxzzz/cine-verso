import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import MovieRow from '@/components/home/MovieRow';
import { imdbService } from '@/lib/services/imdb';
import { FaFire, FaClock, FaStar, FaFilm, FaTv } from 'react-icons/fa';

interface TrendingPageProps {
  trendingDay: any[];
  trendingWeek: any[];
  trendingMovies: any[];
  trendingSeries: any[];
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const [trendingDay, trendingWeek, trendingMovies, trendingSeries] = await Promise.all([
      imdbService.get('/trending/all/day', {}),
      imdbService.get('/trending/all/week', {}),
      imdbService.get('/trending/movie/week', {}),
      imdbService.get('/trending/tv/week', {})
    ]);

    return {
      props: {
        trendingDay: trendingDay.results.slice(0, 12),
        trendingWeek: trendingWeek.results.slice(0, 12),
        trendingMovies: trendingMovies.results.slice(0, 12),
        trendingSeries: trendingSeries.results.slice(0, 12)
      }
    };
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return {
      props: {
        trendingDay: [],
        trendingWeek: [],
        trendingMovies: [],
        trendingSeries: []
      }
    };
  }
};

const TrendingPage: React.FC<TrendingPageProps> = ({ 
  trendingDay, 
  trendingWeek,
  trendingMovies,
  trendingSeries
}) => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const { filter } = router.query;
    if (filter === 'movies' || filter === 'series') {
      setActiveCategory(filter);
    }
  }, [router.query]);

  const categories = [
    { id: 'all', name: 'Todos', icon: <FaFire /> },
    { id: 'today', name: 'Hoje', icon: <FaClock /> },
    { id: 'week', name: 'Esta Semana', icon: <FaStar /> },
    { id: 'movies', name: 'Filmes', icon: <FaFilm /> },
    { id: 'series', name: 'Séries', icon: <FaTv /> },
  ];

  return (
    <Layout>
      <Head>
        <title>Em Alta | CineVerse</title>
        <meta name="description" content="Descubra o que está em alta no momento. Filmes e séries mais populares do dia e da semana." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="pb-10">
        {/* Espaço reservado para compensar o header principal */}
        <div className="h-16"></div>
        
        {/* Título da página */}
        <div className="container mx-auto px-6 pt-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Em Alta</h1>
            <p className="text-gray-400">
              Descubra o que está bombando no momento. Os filmes e séries mais populares do dia e da semana.
            </p>
          </div>
        
          {/* Categorias - sem fundo */}
          <div className="mb-8">
            <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    activeCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-background-light text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6">
          {(activeCategory === 'all' || activeCategory === 'today') && (
            <MovieRow 
              title="Trending Hoje" 
              movies={trendingDay} 
              viewAllLink="/trending/day" 
            />
          )}

          {(activeCategory === 'all' || activeCategory === 'week') && (
            <MovieRow 
              title="Trending da Semana" 
              movies={trendingWeek} 
              viewAllLink="/trending/week" 
            />
          )}

          {(activeCategory === 'all' || activeCategory === 'movies') && (
            <MovieRow 
              title="Filmes em Alta" 
              movies={trendingMovies} 
              viewAllLink="/movies/trending" 
            />
          )}

          {(activeCategory === 'all' || activeCategory === 'series') && (
            <MovieRow 
              title="Séries em Alta" 
              movies={trendingSeries} 
              viewAllLink="/series/trending" 
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TrendingPage; 