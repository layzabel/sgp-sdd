'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MenuPrincipal.module.css';

export const SECOES = [
  { href: '/projetos/', rotulo: 'Projetos' },
  { href: '/times/', rotulo: 'Times' },
  { href: '/desenvolvedores/', rotulo: 'Desenvolvedores' },
  { href: '/usuarios/', rotulo: 'Usuários' },
  { href: '/administradores/', rotulo: 'Administradores' },
] as const;

function semBarraFinal(caminho: string): string {
  return caminho.endsWith('/') ? caminho.slice(0, -1) : caminho;
}

function secaoAtual(caminho: string, href: string): boolean {
  const atual = `${semBarraFinal(caminho)}/`;
  return atual.startsWith(href);
}

export function MenuPrincipal() {
  const caminho = usePathname();
  return (
    <nav aria-label="Menu principal" className={styles.menu}>
      <ul className={styles.links}>
        {SECOES.map((secao) => (
          <li key={secao.href}>
            <Link
              href={secao.href}
              className={styles.link}
              aria-current={secaoAtual(caminho, secao.href) ? 'page' : undefined}
            >
              {secao.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
