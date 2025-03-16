/**
 * Página inicial do CineVerso
 * 
 * Esta é a página principal da aplicação, que exibe:
 * - Carrossel de destaque com filmes/séries em tendência
 * - Seletor de gêneros para navegação
 * - Várias linhas de filmes e séries por categoria
 */
import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Layout from '@/components/layout/Layout';
import HeroCarousel from '@/components/home/HeroCarousel';
import MovieRow from '@/components/home/MovieRow';
import GenreSelector from '@/components/home/GenreSelector';
import { imdbService } from '@/lib/services/imdb';

/**
 * Interface que define as props da página inicial
 * Contém as listas de filmes e séries que serão exibidas
 */
interface HomePageProps {
  trendingMovies: any[];  // Filmes/séries em tendência para o carrossel principal
  popularMovies: any[];   // Filmes populares
  popularSeries: any[];   // Séries populares
  animes: any[];          // Filmes/séries de animação
  familyMovies: any[];    // Filmes para família
  documentaries: any[];   // Documentários
}

/**
 * Função de renderização no servidor (SSR)
 * Busca os dados necessários da API do TMDB antes de renderizar a página
 * 
 * @returns Props com as listas de filmes e séries para a página
 */
export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Busca dados de várias categorias em paralelo para melhor performance
    const [trending, movies, series, animesData, familyData, docsData] = await Promise.all([
      imdbService.getTrending('all', 'week'),
      imdbService.getPopular('movie'),
      imdbService.getPopular('tv'),
      imdbService.get('/discover/movie', {
        with_genres: '16',
        sort_by: 'popularity.desc'
      }),
      imdbService.get('/discover/movie', {
        certification_country: 'BR',
        with_genres: '10751',
        sort_by: 'popularity.desc'
      }),
      imdbService.get('/discover/movie', {
        with_genres: '99',
        sort_by: 'popularity.desc'
      })
    ]);

    // Retorna os resultados limitando o número de itens por categoria
    return {
      props: {
        trendingMovies: trending.results.slice(0, 6),
        popularMovies: movies.results.slice(0, 20),
        popularSeries: series.results.slice(0, 20),
        animes: animesData.results.slice(0, 20),
        familyMovies: familyData.results.slice(0, 20),
        documentaries: docsData.results.slice(0, 20)
      }
    };
  } catch (error) {
    // Em caso de erro, retorna listas vazias para evitar quebrar a página
    console.error('Erro ao buscar dados da API:', error);
    return {
      props: {
        trendingMovies: [],
        popularMovies: [],
        popularSeries: [],
        animes: [],
        familyMovies: [],
        documentaries: []
      }
    };
  }
};

/**
 * Componente da página inicial
 * Renderiza o layout principal com o conteúdo da página
 */
const HomePage: React.FC<HomePageProps> = ({ 
  trendingMovies, 
  popularMovies, 
  popularSeries,
  animes,
  familyMovies,
  documentaries
}) => {
  return (
    <Layout>
      <Head>
        <title>CineVerso | Sua plataforma de streaming</title>
        <meta name="description" content="Assista aos melhores filmes e séries no CineVerso" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Carrossel principal com filmes/séries em destaque */}
      <HeroCarousel movies={trendingMovies} />
      
      <div className="container mx-auto px-4">
        {/* Seletor de gêneros para navegação rápida */}
        <GenreSelector />
        
        {/* Linhas de filmes e séries por categoria */}
        <MovieRow 
          title="Filmes Populares" 
          movies={popularMovies} 
          viewAllLink="/movies/popular" 
        />
        
        <MovieRow 
          title="Séries Populares" 
          movies={popularSeries} 
          viewAllLink="/series/popular" 
        />
        
        <MovieRow 
          title="Animações" 
          subtitle="Filmes de animação para todas as idades"
          movies={animes} 
          viewAllLink="/categorias?genre=16" 
        />
        
        <MovieRow 
          title="Para Família" 
          subtitle="Conteúdo para assistir com toda a família"
          movies={familyMovies} 
          viewAllLink="/categorias?genre=10751" 
        />
        
        <MovieRow 
          title="Documentários" 
          subtitle="Histórias reais e fascinantes"
          movies={documentaries} 
          viewAllLink="/categorias?genre=99" 
        />
      </div>
    </Layout>
  );
};

export default HomePage;