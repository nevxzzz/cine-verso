/**
 * Página 404 - Não Encontrada
 * 
 * Esta página é exibida quando o usuário tenta acessar uma URL que não existe.
 * Oferece links para as principais seções do site para ajudar o usuário a navegar.
 */
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { FaHome, FaSearch, FaFilm, FaTv } from 'react-icons/fa';
import { motion } from 'framer-motion';

/**
 * Componente que renderiza a página 404 (Não Encontrada)
 * Inclui animações e links para as principais seções do site
 * 
 * @component
 * @returns {JSX.Element} Página 404 estilizada
 */
const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Página Não Encontrada | CineVerso</title>
        <meta name="description" content="A página que você está procurando não foi encontrada." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-6 py-12 mt-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          {/* Seção de título e mensagem de erro com animação */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-9xl font-bold text-primary">404</h1>
            <div className="h-2 w-40 bg-gradient-to-r from-primary to-primary-dark mx-auto my-6 rounded-full"></div>
            <h2 className="text-4xl font-bold mb-4">Página Não Encontrada</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Ops! Parece que o filme que você está procurando não está em cartaz. 
              A página solicitada não existe ou foi movida para outro endereço.
            </p>
          </motion.div>

          {/* Grade de links para navegação rápida */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {/* Link para a página inicial */}
            <Link href="/">
              <div className="bg-background-light hover:bg-background-light/80 p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                <FaHome className="text-primary text-3xl mb-3 mx-auto" />
                <h3 className="font-semibold mb-1">Página Inicial</h3>
                <p className="text-sm text-gray-400">Voltar para o início</p>
              </div>
            </Link>

            {/* Link para a página de filmes */}
            <Link href="/movies">
              <div className="bg-background-light hover:bg-background-light/80 p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                <FaFilm className="text-primary text-3xl mb-3 mx-auto" />
                <h3 className="font-semibold mb-1">Filmes</h3>
                <p className="text-sm text-gray-400">Explorar filmes</p>
              </div>
            </Link>

            {/* Link para a página de séries */}
            <Link href="/series">
              <div className="bg-background-light hover:bg-background-light/80 p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                <FaTv className="text-primary text-3xl mb-3 mx-auto" />
                <h3 className="font-semibold mb-1">Séries</h3>
                <p className="text-sm text-gray-400">Explorar séries</p>
              </div>
            </Link>

            {/* Link para a página de busca */}
            <Link href="/search">
              <div className="bg-background-light hover:bg-background-light/80 p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                <FaSearch className="text-primary text-3xl mb-3 mx-auto" />
                <h3 className="font-semibold mb-1">Buscar</h3>
                <p className="text-sm text-gray-400">Encontrar conteúdo</p>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage; 