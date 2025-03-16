import React, { useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Layout from '@/components/layout/Layout';
import MovieRow from '@/components/home/MovieRow';
import GenreSelector from '@/components/home/GenreSelector';
import { imdbService } from '@/lib/services/imdb';
import { FaFire, FaStar, FaClock } from 'react-icons/fa';

interface MoviesPageProps {
  popularMovies: any[];
  topRatedMovies: any[];
  upcomingMovies: any[];
  nowPlayingMovies: any[];
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const [popular, topRated, upcoming, nowPlaying] = await Promise.all([
      imdbService.getPopular('movie'),
      imdbService.getTopRated('movie'),
      imdbService.getUpcoming(),
      imdbService.getNowPlaying()
    ]);

    return {
      props: {
        popularMovies: popular.results.slice(0, 20),
        topRatedMovies: topRated.results.slice(0, 20),
        upcomingMovies: upcoming.results.slice(0, 20),
        nowPlayingMovies: nowPlaying.results.slice(0, 20)
      }
    };
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return {
      props: {
        popularMovies: [],
        topRatedMovies: [],
        upcomingMovies: [],
        nowPlayingMovies: []
      }
    };
  }
};

const MoviesPage: React.FC<MoviesPageProps> = ({ 
  popularMovies, 
  topRatedMovies, 
  upcomingMovies, 
  nowPlayingMovies 
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: <FaFire /> },
    { id: 'popular', name: 'Populares', icon: <FaFire /> },
    { id: 'top_rated', name: 'Mais Avaliados', icon: <FaStar /> },
    { id: 'upcoming', name: 'Em Breve', icon: <FaClock /> },
    { id: 'now_playing', name: 'Em Exibição', icon: <FaFire /> },
  ];

  return (
    <Layout>
      <Head>
        <title>Filmes | CineVerso</title>
        <meta name="description" content="Explore os melhores filmes da atualidade no CineVerso. Filmes populares, mais avaliados, lançamentos e muito mais." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="pb-10">
        {/* Espaço reservado para compensar o header principal */}
        <div className="h-16"></div>
        
        {/* Título da página */}
        <div className="container mx-auto px-6 pt-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Filmes</h1>
            <p className="text-gray-400">
              Explore os melhores filmes da atualidade no CineVerso. Filmes populares, mais avaliados e lançamentos.
            </p>
          </div>
        
          {/* Categorias - sem fundo */}
          <div className="mb-8">
            <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap category-button ${
                    activeCategory === category.id
                      ? 'bg-primary text-white active'
                      : 'bg-background-light text-gray-300'
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
          {(activeCategory === 'all' || activeCategory === 'popular') && (
            <MovieRow 
              title="Filmes Populares" 
              movies={popularMovies} 
              viewAllLink="/movies/popular" 
            />
          )}

          {(activeCategory === 'all' || activeCategory === 'top_rated') && (
            <MovieRow 
              title="Filmes Mais Avaliados" 
              movies={topRatedMovies} 
              viewAllLink="/movies/top-rated" 
            />
          )}

          {(activeCategory === 'all' || activeCategory === 'upcoming') && (
            <MovieRow 
              title="Em Breve" 
              movies={upcomingMovies} 
              viewAllLink="/movies/upcoming" 
            />
          )}

          {(activeCategory === 'all' || activeCategory === 'now_playing') && (
            <MovieRow 
              title="Em Exibição" 
              movies={nowPlayingMovies} 
              viewAllLink="/movies/now-playing" 
            />
          )}

          {/* Seletor de Gêneros - Movido para o final */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Explorar por Gênero</h2>
            <GenreSelector />
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default MoviesPage; 