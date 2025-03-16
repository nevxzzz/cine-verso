/**
 * Documento HTML Personalizado
 * 
 * Este componente personaliza o documento HTML base da aplicação Next.js.
 * Define o idioma, fontes, metadados e estrutura básica do HTML.
 */
import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Componente Document que estende o documento HTML padrão do Next.js
 * Configura o idioma como português do Brasil e carrega as fontes necessárias
 * 
 * @returns {JSX.Element} Documento HTML personalizado
 */
export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* Pré-conexão com servidores de fontes para carregamento mais rápido */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Carregamento das fontes Lato e Open Sans do Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="bg-background text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 