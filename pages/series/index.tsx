import React, { useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Layout from '@/components/layout/Layout';
import MovieRow from '@/components/home/MovieRow';
import GenreSelector from '@/components/home/GenreSelector';
import { imdbService } from '@/lib/services/imdb';
import { FaFire, FaStar, FaClock, FaCalendarAlt } from 'react-icons/fa';

interface SeriesPageProps {
  popularSeries: any[];
  topRatedSeries: any[];
  airingTodaySeries: any[];
  onTheAirSeries: any[];
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const [popular, topRated, airingToday, onTheAir] = await Promise.all([
      imdbService.getPopular('tv'),
      imdbService.getTopRated('tv'),
      imdbService.getAiringToday(),
      imdbService.getOnTheAir()
    ]);

    return {
      props: {
        popularSeries: popular.results.slice(0, 20),
        topRatedSeries: topRated.results.slice(0, 20),
        airingTodaySeries: airingToday.results.slice(0, 20),
        onTheAirSeries: onTheAir.results.slice(0, 20)
      }
    };
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return {
      props: {
        popularSeries: [],
        topRatedSeries: [],
        airingTodaySeries: [],
        onTheAirSeries: []
      }
    };
  }
};

const SeriesPage: React.FC<SeriesPageProps> = ({ 
  popularSeries, 
  topRatedSeries, 
  airingTodaySeries, 
  onTheAirSeries 
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Todas', icon: <FaFire /> },
    { id: 'popular', name: 'Populares', icon: <FaFire /> },
    { id: 'top_rated', name: 'Mais Avaliadas', icon: <FaStar /> },
    { id: 'airing_today', name: 'Hoje', icon: <FaCalendarAlt /> },
    { id: 'on_the_air', name: 'Em Exibição', icon: <FaClock /> },
  ];

  return (
    <Layout>
      <Head>
        <title>Séries | CineVerso</title>
        <meta name="description" content="Explore as melhores séries da atualidade no CineVerso. Séries populares, mais avaliadas, em exibição e muito mais." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="pb-10">
        {/* Espaço reservado para compensar o header principal */}
        <div className="h-16"></div>
        
        {/* Título da página */}
        <div className="container mx-auto px-6 pt-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Séries</h1>
            <p className="text-gray-400">
              Explore as melhores séries da atualidade no CineVerso. Séries populares, mais avaliadas e em exibição.
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
              title="Séries Populares" 
              movies={popularSeries} 
              viewAllLink="/series/popular" 
            />
          )}

          {(activeCategory === 'all' || activeCategory === 'top_rated') && (
            <MovieRow 
              title="Séries Mais Avaliadas" 
              movies={topRatedSeries} 
              viewAllLink="/series/top-rated" 
            />
          )}

          {(activeCategory === 'all' || activeCategory === 'airing_today') && (
            <MovieRow 
              title="Exibindo Hoje" 
              movies={airingTodaySeries} 
              viewAllLink="/series/airing-today" 
            />
          )}

          {(activeCategory === 'all' || activeCategory === 'on_the_air') && (
            <MovieRow 
              title="Em Exibição" 
              movies={onTheAirSeries} 
              viewAllLink="/series/on-the-air" 
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

export default SeriesPage; 