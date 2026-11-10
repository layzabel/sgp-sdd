import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { MensagensProvider } from '../ui/Mensagens.tsx';
import { MenuPrincipal } from '../ui/MenuPrincipal.tsx';
import { RepositorioProvider } from '../ui/RepositorioProvider.tsx';
import './globals.css';

// Sem `title` aqui: o <title> de cada tela é renderizado por `Pagina` (o título do metadata do
// Next teria precedência no <head> e esconderia o título específico da tela).
export const metadata: Metadata = {
  description: 'Sistema Web de Gerenciamento de Projetos de Software',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a href="#conteudo" className="pular">
          Pular para o conteúdo
        </a>
        <RepositorioProvider>
          <MensagensProvider>
            <div className="estrutura">
              <header className="cabecalho">
                <Link href="/" className="marca">
                  SGP
                </Link>
                <MenuPrincipal />
              </header>
              <main id="conteudo" tabIndex={-1} className="conteudo">
                {children}
              </main>
            </div>
          </MensagensProvider>
        </RepositorioProvider>
      </body>
    </html>
  );
}
