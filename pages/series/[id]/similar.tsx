import React, { useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Layout from '@/components/layout/Layout';
import { imdbService, getImageUrl } from '@/lib/services/imdb';
import Link from 'next/link';
import Image from 'next/image';
import { FaArrowLeft, FaPlay, FaStar, FaImage } from 'react-icons/fa';
import { useRouter } from 'next/router';

interface Series {
  id: number;
  name: string;
  poster_path: string;
  vote_average: number;
  first_air_date: string;
}

interface SimilarSeriesProps {
  seriesId: string;
  seriesName: string;
  similarSeries: Series[];
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const seriesId = params?.id as string;
    
    // Buscar detalhes da série original para obter o título
    const seriesDetails = await imdbService.get(`/tv/${seriesId}`, {});
    
    // Buscar séries similares
    const similarData = await imdbService.get(`/tv/${seriesId}/similar`, {});
    
    // Filtrar séries sem poster_path
    const filteredSeries = similarData.results.filter((series: any) => series.poster_path);
    
    return {
      props: {
        seriesId,
        seriesName: seriesDetails.name,
        similarSeries: filteredSeries || []
      }
    };
  } catch (error) {
    console.error('Erro ao carregar séries similares:', error);
    return {
      notFound: true
    };
  }
};

const SimilarSeriesPage: React.FC<SimilarSeriesProps> = ({ seriesId, seriesName, similarSeries }) => {
  const router = useRouter();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  
  // Função para lidar com erro de carregamento de imagem
  const handleImageError = (seriesId: number) => {
    setImageErrors(prev => ({ ...prev, [seriesId]: true }));
  };

  // Filtra séries com erros de imagem
  const validSeries = similarSeries.filter(series => !imageErrors[series.id]);
  
  return (
    <Layout>
      <Head>
        <title>Séries Similares a {seriesName} | CineVerso</title>
        <meta name="description" content={`Descubra séries similares a ${seriesName}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-6 py-12 mt-16">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => router.back()} 
            className="btn-secondary flex items-center gap-2 hover:bg-opacity-80 transition-all duration-200"
          >
            <FaArrowLeft /> Voltar
          </button>
          <h1 className="text-3xl font-bold ml-4">Séries Similares a {seriesName}</h1>
        </div>

        {validSeries.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <FaImage className="text-gray-600 mb-4" size={48} />
              <p className="text-xl text-gray-400">Nenhuma série similar encontrada.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {validSeries.map((series) => (
              <div key={series.id} className="relative w-[180px]">
                <Link href={`/series/${series.id}`}>
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden movie-card-hover group">
                    <Image
                      src={getImageUrl(series.poster_path)}
                      alt={series.name}
                      fill
                      className="object-cover"
                      onError={() => handleImageError(series.id)}
                    />
                    
                    {/* Overlay ao passar o mouse */}
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-center font-semibold mb-2 truncate w-full">
                        {series.name}
                      </h3>
                      <div className="flex items-center space-x-2 mb-4">
                        <FaStar className="text-accent" />
                        <span>{series.vote_average.toFixed(1)}</span>
                        <span className="text-gray-400">
                          {series.first_air_date ? `(${new Date(series.first_air_date).getFullYear()})` : ''}
                        </span>
                      </div>
                      <button className="btn-primary py-1 px-4 flex items-center text-sm">
                        <FaPlay className="mr-2" size={12} /> Assistir
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="mt-2 text-sm font-medium truncate">
                    {series.name}
                  </h3>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SimilarSeriesPage; 