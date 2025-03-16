/**
 * Definições de tipos globais para o CineVerso
 * 
 * Este arquivo contém declarações de tipos que são usados globalmente na aplicação.
 * Ele estende as definições padrão do React para permitir elementos personalizados.
 */
import 'react';

declare global {
  namespace JSX {
    /**
     * Estende a interface IntrinsicElements do JSX para permitir
     * elementos personalizados ou elementos com propriedades dinâmicas
     */
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
} 