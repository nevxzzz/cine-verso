/**
 * Componente Layout
 * 
 * Este é o componente principal de layout que envolve todas as páginas da aplicação.
 * Ele fornece uma estrutura consistente com cabeçalho, conteúdo principal e rodapé.
 */
import React from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * Interface que define as props do componente Layout
 * @property children - Conteúdo a ser renderizado dentro do layout
 */
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Componente que define a estrutura básica de todas as páginas
 * Inclui cabeçalho fixo, área de conteúdo principal e rodapé
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout; 