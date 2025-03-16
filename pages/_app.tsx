/**
 * Arquivo principal da aplicação Next.js
 * 
 * Este componente envolve todas as páginas da aplicação e é responsável por:
 * - Importar estilos globais
 * - Configurar a fonte padrão (Inter)
 * - Aplicar correções para a biblioteca Slick Carousel
 */
import '@/styles/globals.css';
import '@/styles/slick-overrides.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';

/**
 * Configuração da fonte Inter do Google Fonts
 * Carrega apenas o subconjunto latino para melhor performance
 */
const inter = Inter({ subsets: ['latin'] });

/**
 * Componente principal da aplicação
 * 
 * @param Component - O componente da página atual
 * @param pageProps - As props da página atual
 */
export default function App({ Component, pageProps }: AppProps) {
  /**
   * Efeito para remover os botões de navegação padrão do Slick Carousel
   * 
   * Este script é necessário porque os botões padrão do Slick interferem
   * com a navegação personalizada implementada nos componentes de carrossel
   */
  useEffect(() => {
    /**
     * Função que remove os botões do Slick do DOM
     * Busca por seletores específicos do Slick e os oculta/remove
     */
    const removeSlickButtons = () => {
      const slickButtons = document.querySelectorAll('.slick-arrow, .slick-prev, .slick-next, [data-role="none"], button[type="button"][data-role="none"], button[type="button"].slick-arrow, button[type="button"].slick-prev, button[type="button"].slick-next');
      slickButtons.forEach(button => {
        if (button instanceof HTMLElement) {
          // Oculta o botão com várias propriedades CSS para garantir que fique invisível
          button.style.display = 'none';
          button.style.opacity = '0';
          button.style.visibility = 'hidden';
          button.style.pointerEvents = 'none';
          button.style.width = '0';
          button.style.height = '0';
          button.style.position = 'absolute';
          button.style.zIndex = '-999';
          
          // Tenta remover completamente o elemento do DOM
          if (button.parentNode) {
            try {
              button.parentNode.removeChild(button);
            } catch (e) {
              console.log('Não foi possível remover o botão do DOM');
            }
          }
        }
      });
    };

    // Executa após um pequeno delay para garantir que os botões foram renderizados
    const timeoutId = setTimeout(removeSlickButtons, 100);
    
    // Executa novamente após um delay maior para garantir que os botões foram renderizados após transições
    const timeoutId2 = setTimeout(removeSlickButtons, 500);
    
    /**
     * Configura um observador de mutações para executar a função
     * sempre que houver mudanças no DOM, garantindo que os botões
     * sejam removidos mesmo após atualizações dinâmicas
     */
    const observer = new MutationObserver(removeSlickButtons);
    observer.observe(document.body, { childList: true, subtree: true });

    // Limpeza dos timeouts e do observador quando o componente for desmontado
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      observer.disconnect();
    };
  }, []);

  // Renderiza o componente da página atual dentro do wrapper com a fonte Inter
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
} 