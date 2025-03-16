import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { GetServerSideProps } from 'next';
import Layout from '@/components/layout/Layout';
import { imdbService, getImageUrl, getBackdropUrl } from '@/lib/services/imdb';
import { FaStar, FaCalendarAlt, FaClock, FaGlobe, FaPlayCircle, FaPlay, FaFilm, FaTimes, FaChevronDown, FaInfoCircle, FaCalendar, FaCheck, FaEye, FaPlus, FaList, FaThLarge } from 'react-icons/fa';
import Link from 'next/link';
import MovieRow from '@/components/home/MovieRow';
import MediaActions from '@/components/ui/MediaActions';
import MoviePlayer from '@/components/ui/MoviePlayer';
import { useAuth } from '@/hooks/useAuth';
import { watchHistoryService } from '@/lib/services/watchHistory';

interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string;
  runtime?: number;
  vote_average?: number;
}

interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episodes: Episode[];
}

interface SeriesDetailsProps {
  series: {
    id: number;
    name: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    first_air_date: string;
    episode_run_time: number[];
    vote_average: number;
    genres: Array<{ id: number; name: string }>;
    production_companies: Array<{ id: number; name: string; logo_path: string | null }>;
    number_of_seasons: number;
    number_of_episodes: number;
    videos: {
      results: Array<{
        id: string;
        key: string;
        name: string;
        site: string;
        type: string;
      }>;
    };
    credits: {
      cast: Array<{
        id: number;
        name: string;
        character: string;
        profile_path: string | null;
      }>;
    };
    similar: {
      results: Array<{
        id: number;
        name: string;
        poster_path: string;
        vote_average: number;
        first_air_date: string;
      }>;
    };
  };
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const seriesId = params?.id;
    const [seriesDetails, credits, similar] = await Promise.all([
      imdbService.get(`/tv/${seriesId}`, {
        append_to_response: 'videos'
      }),
      imdbService.get(`/tv/${seriesId}/credits`, {}),
      imdbService.get(`/tv/${seriesId}/similar`, {})
    ]);

    return {
      props: {
        series: {
          ...seriesDetails,
          credits,
          similar
        }
      }
    };
  } catch (error) {
    console.error('Erro ao carregar dados da série:', error);
    return {
      notFound: true
    };
  }
};

const SeriesDetails: React.FC<SeriesDetailsProps> = ({ series }) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState('');
  const [showNoTrailerMessage, setShowNoTrailerMessage] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonData, setSeasonData] = useState<Season | null>(null);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [watchedEpisodes, setWatchedEpisodes] = useState<Record<string, boolean>>({});
  const [showWatchedMessage, setShowWatchedMessage] = useState(false);
  const [lastWatchedEpisode, setLastWatchedEpisode] = useState<string>('');
  const [isLoadingWatchHistory, setIsLoadingWatchHistory] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Verificar a disponibilidade do Firebase
  useEffect(() => {
    const checkFirebaseAvailability = async () => {
      if (user) {
        try {
          const isAvailable = await watchHistoryService.checkFirestoreAvailability();
          if (!isAvailable) {
            setFirebaseError('Não foi possível conectar ao Firebase. Suas marcações serão salvas apenas localmente.');
            console.error('Firebase não está disponível');
          } else {
            setFirebaseError(null);
          }
        } catch (error) {
          setFirebaseError('Erro ao verificar a disponibilidade do Firebase. Suas marcações serão salvas apenas localmente.');
          console.error('Erro ao verificar Firebase:', error);
        }
      }
    };
    
    checkFirebaseAvailability();
  }, [user]);

  // Função para formatar a duração do episódio
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}min` : `${remainingMinutes}min`;
  };

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Função para abrir o trailer
  const openTrailer = () => {
    // Procurar por um trailer oficial
    const trailer = series.videos?.results.find(
      video => video.site === 'YouTube' && 
      (video.type === 'Trailer' || video.type === 'Teaser') &&
      video.name.toLowerCase().includes('trailer')
    );
    
    // Se não encontrar um trailer oficial, pegar o primeiro trailer ou teaser
    const fallbackTrailer = series.videos?.results.find(
      video => video.site === 'YouTube' && 
      (video.type === 'Trailer' || video.type === 'Teaser')
    );
    
    if (trailer || fallbackTrailer) {
      setTrailerKey((trailer || fallbackTrailer)?.key || '');
      setShowTrailer(true);
    } else {
      // Em vez de usar alert, mostrar o card personalizado
      setShowNoTrailerMessage(true);
      
      // Esconder a mensagem após 5 segundos
      setTimeout(() => {
        setShowNoTrailerMessage(false);
      }, 5000);
    }
  };
  
  // Função para fechar o trailer
  const closeTrailer = () => {
    setShowTrailer(false);
    setTrailerKey('');
  };
  
  // Função para fechar a mensagem de "sem trailer"
  const closeNoTrailerMessage = () => {
    setShowNoTrailerMessage(false);
  };

  // Buscar dados da temporada selecionada
  useEffect(() => {
    const fetchSeasonData = async () => {
      try {
        setLoadingEpisodes(true);
        const data = await imdbService.getSeasonDetails(series.id, selectedSeason);
        setSeasonData(data);
        
        // Se houver episódios, selecione o primeiro por padrão
        if (data.episodes && data.episodes.length > 0) {
          setSelectedEpisode(data.episodes[0].episode_number);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da temporada:', error);
      } finally {
        setLoadingEpisodes(false);
      }
    };

    fetchSeasonData();
  }, [series.id, selectedSeason]);

  // Formatar data de lançamento do episódio
  const formatEpisodeDate = (dateString: string | undefined) => {
    if (!dateString) return 'Data não disponível';
    
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Selecionar um episódio e iniciar o player
  const selectEpisodeAndPlay = (episodeNumber: number) => {
    setSelectedEpisode(episodeNumber);
    setShowPlayer(true);
  };

  // Obter episódios da temporada atual
  const episodes = seasonData?.episodes || [];

  // Carregar episódios assistidos quando o usuário ou a série mudar
  useEffect(() => {
    // Adicionando uma flag para controlar quando o useEffect deve ser executado
    let isMounted = true;
    
    const fetchWatchedEpisodes = async () => {
      if (!isMounted) return;
      
      setIsLoadingWatchHistory(true);
      
      try {
        if (user) {
          // Se o usuário estiver autenticado, carregar do Firebase
          const watchedFromFirebase = await watchHistoryService.getWatchedEpisodes(series.id);
          if (isMounted) {
            setWatchedEpisodes(watchedFromFirebase);
          }
        } else {
          // Se não estiver autenticado, carregar do localStorage
          const seriesKey = `series_${series.id}_watched`;
          const savedWatched = JSON.parse(localStorage.getItem(seriesKey) || '{}');
          if (isMounted) {
            setWatchedEpisodes(savedWatched);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar episódios assistidos:', error);
        // Em caso de erro, tentar carregar do localStorage como fallback
        if (isMounted) {
          try {
            const seriesKey = `series_${series.id}_watched`;
            const savedWatched = JSON.parse(localStorage.getItem(seriesKey) || '{}');
            setWatchedEpisodes(savedWatched);
          } catch (e) {
            console.error('Erro ao carregar episódios assistidos do localStorage:', e);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingWatchHistory(false);
        }
      }
    };
    
    fetchWatchedEpisodes();
    
    // Cleanup function para evitar atualizações de estado após o componente ser desmontado
    return () => {
      isMounted = false;
    };
  }, [series.id, user]);

  // Modificando a função markAsWatched para mostrar o modal de login
  const markAsWatched = async (event: React.MouseEvent, episodeId: number, seasonNumber: number, episodeNumber: number) => {
    event.stopPropagation(); // Impedir que o card seja clicado
    
    // Se o usuário não estiver autenticado, mostrar modal de login
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    const episodeKey = `s${seasonNumber}e${episodeNumber}`;
    const isCurrentlyWatched = watchedEpisodes[episodeKey];
    
    // Atualizar estado local imediatamente para feedback instantâneo
    setWatchedEpisodes(prev => ({
      ...prev,
      [episodeKey]: !isCurrentlyWatched
    }));
    
    // Salvar no localStorage independentemente do status de autenticação
    try {
      const seriesKey = `series_${series.id}_watched`;
      const savedWatched = JSON.parse(localStorage.getItem(seriesKey) || '{}');
      
      if (isCurrentlyWatched) {
        // Se já estava marcado, remover
        delete savedWatched[episodeKey];
      } else {
        // Se não estava marcado, adicionar
        savedWatched[episodeKey] = true;
      }
      
      localStorage.setItem(seriesKey, JSON.stringify(savedWatched));
    } catch (error) {
      console.error('Erro ao salvar episódio assistido no localStorage:', error);
    }
    
    if (firebaseError) {
      // Se houver erro no Firebase, usar apenas localStorage
      // Mostrar mensagem de confirmação
      if (isCurrentlyWatched) {
        setLastWatchedEpisode(`Temporada ${seasonNumber}, Episódio ${episodeNumber} desmarcado`);
      } else {
        setLastWatchedEpisode(`Temporada ${seasonNumber}, Episódio ${episodeNumber} marcado como assistido`);
      }
      setShowWatchedMessage(true);
      setTimeout(() => setShowWatchedMessage(false), 3000);
      return;
    }
    
    try {
      // Obter o nome do episódio atual
      const episodeName = seasonData?.episodes.find(ep => ep.episode_number === episodeNumber)?.name || '';
      
      // Salvar no Firebase
      let success;
      if (isCurrentlyWatched) {
        success = await watchHistoryService.unmarkEpisodeAsWatched(
          series.id,
          seasonNumber,
          episodeNumber
        );
      } else {
        success = await watchHistoryService.markEpisodeAsWatched(
          series.id,
          seasonNumber,
          episodeNumber,
          episodeName
        );
      }
      
      if (!success) {
        // Se falhar, não reverter o estado local, pois já salvamos no localStorage
        console.error('Erro ao atualizar histórico de episódios no Firebase');
        setFirebaseError('Não foi possível salvar no Firebase. Suas marcações foram salvas apenas localmente.');
      }
      
      // Mostrar mensagem de confirmação
      if (isCurrentlyWatched) {
        setLastWatchedEpisode(`Temporada ${seasonNumber}, Episódio ${episodeNumber} desmarcado`);
      } else {
        setLastWatchedEpisode(`Temporada ${seasonNumber}, Episódio ${episodeNumber} marcado como assistido`);
      }
      setShowWatchedMessage(true);
      setTimeout(() => setShowWatchedMessage(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar episódio assistido no Firebase:', error);
      // Não reverter o estado local, pois já salvamos no localStorage
      setFirebaseError('Erro ao salvar no Firebase. Suas marcações foram salvas apenas localmente.');
    }
  };
  
  // Modificando a função markSeasonAsWatched para mostrar o modal de login
  const markSeasonAsWatched = async () => {
    if (!seasonData || !seasonData.episodes.length) return;
    
    // Se o usuário não estiver autenticado, mostrar modal de login
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // Verificar se todos os episódios da temporada já estão marcados
    const allEpisodesWatched = seasonData.episodes.every(episode => {
      const episodeKey = `s${selectedSeason}e${episode.episode_number}`;
      return watchedEpisodes[episodeKey];
    });
    
    // Atualizar estado local imediatamente para feedback instantâneo
    const updatedWatched = { ...watchedEpisodes };
    
    if (allEpisodesWatched) {
      // Se todos já estão marcados, desmarcar todos
      seasonData.episodes.forEach(episode => {
        const episodeKey = `s${selectedSeason}e${episode.episode_number}`;
        delete updatedWatched[episodeKey];
      });
    } else {
      // Se nem todos estão marcados, marcar todos
      seasonData.episodes.forEach(episode => {
        const episodeKey = `s${selectedSeason}e${episode.episode_number}`;
        updatedWatched[episodeKey] = true;
      });
    }
    
    setWatchedEpisodes(updatedWatched);
    
    // Salvar no localStorage independentemente do status de autenticação
    try {
      const seriesKey = `series_${series.id}_watched`;
      const existingSaved = JSON.parse(localStorage.getItem(seriesKey) || '{}');
      
      if (allEpisodesWatched) {
        // Se todos já estão marcados, desmarcar todos
        seasonData.episodes.forEach(episode => {
          const episodeKey = `s${selectedSeason}e${episode.episode_number}`;
          delete existingSaved[episodeKey];
        });
      } else {
        // Se nem todos estão marcados, marcar todos
        seasonData.episodes.forEach(episode => {
          const episodeKey = `s${selectedSeason}e${episode.episode_number}`;
          existingSaved[episodeKey] = true;
        });
      }
      
      localStorage.setItem(seriesKey, JSON.stringify(existingSaved));
    } catch (error) {
      console.error('Erro ao salvar temporada no localStorage:', error);
    }
    
    // Definir mensagem de confirmação
    if (allEpisodesWatched) {
      setLastWatchedEpisode(`Temporada ${selectedSeason} desmarcada`);
    } else {
      setLastWatchedEpisode(`Temporada ${selectedSeason} marcada como assistida`);
    }
    
    // Mostrar mensagem de confirmação
    setShowWatchedMessage(true);
    setTimeout(() => setShowWatchedMessage(false), 3000);
    
    if (firebaseError) {
      // Se houver erro no Firebase, usar apenas localStorage
      return;
    }
    
    try {
      // Salvar no Firebase
      let success;
      if (allEpisodesWatched) {
        success = await watchHistoryService.unmarkSeasonAsWatched(
          series.id,
          selectedSeason,
          seasonData.episodes.map(ep => ({ episodeNumber: ep.episode_number }))
        );
      } else {
        success = await watchHistoryService.markSeasonAsWatched(
          series.id,
          selectedSeason,
          seasonData.episodes.map(ep => ({ 
            episodeNumber: ep.episode_number,
            episodeName: ep.name
          }))
        );
      }
      
      if (!success) {
        // Se falhar, não reverter o estado local, pois já salvamos no localStorage
        console.error('Erro ao atualizar histórico de temporada no Firebase');
        setFirebaseError('Não foi possível salvar no Firebase. Suas marcações foram salvas apenas localmente.');
      }
    } catch (error) {
      console.error('Erro ao marcar temporada como assistida no Firebase:', error);
      // Não reverter o estado local, pois já salvamos no localStorage
      setFirebaseError('Erro ao salvar no Firebase. Suas marcações foram salvas apenas localmente.');
    }
  };

  // Função para fechar o modal de login
  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  return (
    <Layout>
      <Head>
        <title>{series.name} | CineVerso</title>
        <meta name="description" content={series.overview} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section com Backdrop - Ajustado para começar no topo da página */}
      <div className="relative min-h-[90vh] pt-16">
        {/* Imagem de fundo */}
        <div className="absolute inset-0 top-0 z-0">
          {series.backdrop_path ? (
            <>
              <Image
                src={getBackdropUrl(series.backdrop_path)}
                alt={series.name}
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  // Quando a imagem falhar, remover a src para não mostrar o ícone de imagem quebrada
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {/* Gradiente para melhorar a legibilidade do conteúdo */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </>
          ) : (
            // Fundo sólido quando não houver imagem de backdrop
            <div className="absolute inset-0 bg-background" />
          )}
        </div>

        {/* Conteúdo - Ajustado para garantir que esteja sobre o gradiente e visível */}
        <div className="container mx-auto px-6 relative z-10 h-full flex items-end pt-32 pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <div className="w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={getImageUrl(series.poster_path)}
                alt={series.name}
                width={256}
                height={384}
                className="w-full h-auto"
              />
            </div>

            {/* Informações da Série - Ajustado para lidar com descrições longas */}
            <div className="flex-1 z-10">
              <h1 className="text-4xl font-bold mb-4">{series.name}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-500" />
                  <span>{series.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  <span>{formatDate(series.first_air_date)}</span>
                </div>
                {series.episode_run_time && series.episode_run_time.length > 0 && (
                  <div className="flex items-center gap-2">
                    <FaClock className="text-gray-400" />
                    <span>{formatRuntime(series.episode_run_time[0])} por episódio</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {series.genres.map(genre => (
                  <Link
                    key={genre.id}
                    href={`/categorias?genre=${genre.id}`}
                    className="px-3 py-1 bg-background-light rounded-full text-sm hover:bg-primary hover:text-white transition-colors duration-200"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              {/* Descrição com altura máxima e scroll quando necessário */}
              <div className="mb-8 max-w-3xl">
                {series.overview ? (
                  <p className="text-gray-300">
                    {series.overview}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">
                    Ops! Parece que ainda não temos uma descrição para esta série. Estamos trabalhando para adicioná-la em breve!
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Temporadas:</span>
                  <span>{series.number_of_seasons}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Episódios:</span>
                  <span>{series.number_of_episodes}</span>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={openTrailer}
                  className="bg-background-alt hover:bg-opacity-60 text-white px-8 py-3 rounded-full flex items-center gap-2 transition-colors"
                >
                  <FaFilm />
                  Ver Trailer
                </button>
              </div>

              <div className="mt-6 mb-8">
                <MediaActions
                  mediaId={series.id}
                  mediaType="tv"
                  title={series.name}
                  posterPath={series.poster_path}
                  vote_average={series.vote_average}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Episódios */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-background-light rounded-xl overflow-hidden shadow-lg border border-gray-800">
          {/* Cabeçalho da seção */}
          <div className="bg-background-alt p-4 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold">Episódios</h2>
              <div className="relative">
                <select 
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="appearance-none bg-background text-white px-4 py-2 pr-8 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: series.number_of_seasons }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Temporada {i + 1}
                    </option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              
              {seasonData && (
                <div className="text-sm text-gray-400">
                  {seasonData.episodes.length} episódios
                </div>
              )}
            </div>
            
            {/* Botão para marcar toda a temporada como assistida */}
            {seasonData && seasonData.episodes.length > 0 && (
              <button
                onClick={markSeasonAsWatched}
                className="bg-background text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-background-alt transition-colors"
              >
                <FaCheck className="text-green-500" />
                <span>
                  {seasonData.episodes.every(episode => watchedEpisodes[`s${selectedSeason}e${episode.episode_number}`])
                    ? "Desmarcar temporada"
                    : "Marcar temporada como assistida"}
                </span>
              </button>
            )}
          </div>
          
          {/* Estado de carregamento */}
          {loadingEpisodes && (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Carregando episódios...</p>
            </div>
          )}
          
          {/* Mensagem de nenhum episódio */}
          {!loadingEpisodes && episodes.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12">
              <FaInfoCircle className="text-gray-500 text-4xl mb-4" />
              <p className="text-gray-400 text-center">
                Não encontramos informações sobre os episódios desta temporada.
                <br />
                Tente selecionar outra temporada ou volte mais tarde.
              </p>
            </div>
          )}
          
          {/* Lista de episódios - Visualização em grade */}
          {!loadingEpisodes && episodes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
              {episodes.map(episode => {
                const episodeKey = `s${selectedSeason}e${episode.episode_number}`;
                const isWatched = watchedEpisodes[episodeKey];
                
                return (
                  <div 
                    key={episode.id}
                    className={`bg-background rounded-lg overflow-hidden border border-gray-800 hover:border-primary transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${isWatched ? 'border-green-500/70' : ''}`}
                    onClick={() => selectEpisodeAndPlay(episode.episode_number)}
                  >
                    <div className="aspect-video bg-background-alt relative">
                      {episode.still_path ? (
                        <Image
                          src={getImageUrl(episode.still_path, 'medium')}
                          alt={episode.name}
                          fill
                          className={`object-cover ${isWatched ? 'opacity-70' : ''}`}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-background-alt">
                          <span className="text-4xl text-gray-700 font-bold">E{episode.episode_number}</span>
                        </div>
                      )}
                      
                      {/* Indicador de assistido */}
                      {isWatched && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 z-10">
                          <FaCheck size={12} />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm bg-primary/80 px-2 py-1 rounded">Ep {episode.episode_number}</span>
                            <div className="bg-black/50 rounded-full p-2 transform group-hover:scale-110 transition-transform">
                              <FaPlay className="text-white text-sm" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-white group-hover:text-primary transition-colors line-clamp-1">
                          {episode.name}
                        </h3>
                        
                        {/* Botão para marcar/desmarcar como assistido */}
                        <button
                          onClick={(e) => markAsWatched(e, episode.id, selectedSeason, episode.episode_number)}
                          className={`ml-2 p-1 rounded-full ${isWatched ? 'text-green-500 bg-green-500/10' : 'text-gray-400 hover:text-white bg-background-alt'} transition-colors`}
                          title={isWatched ? "Desmarcar como assistido" : "Marcar como assistido"}
                        >
                          <FaEye size={14} />
                        </button>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-400 mt-2 mb-3">
                        <FaCalendar className="mr-1" />
                        <span>{formatEpisodeDate(episode.air_date)}</span>
                        
                        {episode.vote_average && episode.vote_average > 0 && (
                          <div className="flex items-center ml-3">
                            <FaStar className="text-yellow-500 mr-1" />
                            <span>{episode.vote_average.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-400 line-clamp-2 h-8">
                        {episode.overview || "Nenhuma descrição disponível para este episódio."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal do Trailer */}
      {showTrailer && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button 
              onClick={closeTrailer}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title={`${series.name} - Trailer`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
      
      {/* Card de aviso "Sem Trailer" */}
      {showNoTrailerMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-slideUp">
          <div className="bg-background-alt border border-gray-700 rounded-lg shadow-xl p-4 max-w-md">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <FaFilm className="text-primary mr-2" size={20} />
                <h3 className="font-medium text-lg">Trailer Indisponível</h3>
              </div>
              <button 
                onClick={closeNoTrailerMessage}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <p className="text-gray-300">
              Ops! Parece que ainda não temos um trailer disponível para esta série. Tente novamente mais tarde!
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-12">
        {/* Elenco */}
        {series.credits.cast && series.credits.cast.filter(actor => actor.profile_path).length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Elenco Principal</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {series.credits.cast
                .filter(actor => actor.profile_path) // Filtra apenas atores com foto
                .slice(0, 8)
                .map(actor => (
                  <div key={actor.id} className="bg-background-light rounded-lg overflow-hidden">
                    <div className="aspect-[3/4] relative">
                      <Image
                        src={getImageUrl(actor.profile_path)}
                        alt={actor.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="font-medium text-xs">{actor.name}</h3>
                      <p className="text-gray-400 text-xs">{actor.character}</p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Séries Similares */}
        <MovieRow
          title="Séries Similares"
          movies={series.similar.results
            .filter(item => item.poster_path)
            .map(item => ({
              ...item,
              title: item.name,
              release_date: item.first_air_date
            }))}
          viewAllLink={`/series/${series.id}/similar`}
        />
      </div>

      {/* Player da série */}
      {showPlayer && (
        <MoviePlayer
          movieId={series.id}
          title={series.name}
          mediaType="tv"
          season={selectedSeason}
          episode={selectedEpisode}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {/* Mensagem de confirmação de episódio assistido */}
      {showWatchedMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-slideUp">
          <div className="bg-background-alt border border-green-500 rounded-lg shadow-xl p-4 max-w-md">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className="bg-green-500/20 rounded-full p-1 mr-2">
                  <FaCheck className="text-green-500" size={16} />
                </div>
                <h3 className="font-medium text-lg">Status atualizado</h3>
              </div>
              <button 
                onClick={() => setShowWatchedMessage(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <p className="text-gray-300">
              {lastWatchedEpisode}
            </p>
          </div>
        </div>
      )}

      {/* Aviso de autenticação para salvar progresso na nuvem */}
      {!user && !isLoadingWatchHistory && episodes.length > 0 && (
        <div className="mb-6 bg-background-alt border border-primary/30 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-primary/20 rounded-full p-2 mr-3">
              <FaInfoCircle className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1">Salve seu progresso na nuvem</h3>
              <p className="text-gray-300 mb-3">
                Faça login para salvar seu progresso de episódios assistidos e acessá-lo em qualquer dispositivo.
              </p>
              <Link href="/auth/login" className="inline-flex items-center bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors">
                <span className="mr-2">Fazer Login</span>
                <FaChevronDown className="transform -rotate-90" size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de erro do Firebase */}
      {firebaseError && (
        <div className="fixed bottom-8 left-8 z-50 animate-slideUp">
          <div className="bg-background-alt border border-yellow-500 rounded-lg shadow-xl p-4 max-w-md">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className="bg-yellow-500/20 rounded-full p-1 mr-2">
                  <FaInfoCircle className="text-yellow-500" size={16} />
                </div>
                <h3 className="font-medium text-lg">Aviso</h3>
              </div>
              <button 
                onClick={() => setFirebaseError(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <p className="text-gray-300">
              {firebaseError}
            </p>
          </div>
        </div>
      )}

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fadeIn overflow-auto">
          <div className="bg-background-alt rounded-xl overflow-hidden shadow-2xl max-w-md w-full relative animate-scaleIn my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <button 
                onClick={closeLoginModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes size={20} />
              </button>
              
              <div className="text-center mb-6">
                <div className="bg-primary/20 rounded-full p-4 inline-flex mb-4">
                  <FaEye className="text-primary" size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Faça login para continuar</h2>
                <p className="text-gray-300">
                  Para marcar episódios como assistidos e acompanhar seu progresso em qualquer dispositivo, você precisa estar logado.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-background p-4 rounded-lg border border-gray-700">
                  <h3 className="font-medium mb-2 flex items-center">
                    <FaCheck className="text-green-500 mr-2" />
                    Acompanhe seu progresso
                  </h3>
                  <p className="text-sm text-gray-400">
                    Marque episódios como assistidos e continue de onde parou.
                  </p>
                </div>
                
                <div className="bg-background p-4 rounded-lg border border-gray-700">
                  <h3 className="font-medium mb-2 flex items-center">
                    <FaCheck className="text-green-500 mr-2" />
                    Sincronize entre dispositivos
                  </h3>
                  <p className="text-sm text-gray-400">
                    Acesse seu histórico de qualquer lugar, em qualquer dispositivo.
                  </p>
                </div>
                
                <div className="bg-background p-4 rounded-lg border border-gray-700">
                  <h3 className="font-medium mb-2 flex items-center">
                    <FaCheck className="text-green-500 mr-2" />
                    Receba recomendações personalizadas
                  </h3>
                  <p className="text-sm text-gray-400">
                    Descubra novas séries baseadas no que você já assistiu.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col space-y-3">
                <Link 
                  href="/auth/login" 
                  className="bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center"
                >
                  Fazer Login
                </Link>
                <Link 
                  href="/auth/criar-conta" 
                  className="bg-background hover:bg-background-light text-white py-3 px-4 rounded-md font-medium flex items-center justify-center border border-gray-700"
                >
                  Criar Conta
                </Link>
                <button 
                  onClick={closeLoginModal}
                  className="text-gray-400 hover:text-white py-2 transition-colors text-sm"
                >
                  Continuar sem login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SeriesDetails; 