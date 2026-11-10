import { cleanup } from '@testing-library/react';
import {
  createElement,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';
import { afterEach, vi } from 'vitest';

// ---------------------------------------------------------------------------------------------
// Dublê de next/navigation (research R14): rota controlável e roteador espionável.
// ---------------------------------------------------------------------------------------------

type Rota = { caminho: string; params: URLSearchParams };

let rotaAtual: Rota = { caminho: '/', params: new URLSearchParams() };
const ouvintes = new Set<() => void>();

function notificar(): void {
  for (const ouvinte of ouvintes) ouvinte();
}

/** Define a rota atual (caminho e parâmetros de busca) vista por usePathname/useSearchParams. */
export function definirRota(caminho: string, params: Record<string, string> = {}): void {
  rotaAtual = { caminho, params: new URLSearchParams(params) };
  notificar();
}

function navegar(url: string): void {
  const destino = new URL(url, 'http://localhost');
  const caminho = destino.pathname.length > 1 ? destino.pathname.replace(/\/$/, '') : '/';
  rotaAtual = { caminho, params: destino.searchParams };
  notificar();
}

export const roteador = {
  push: vi.fn((url: string) => navegar(url)),
  replace: vi.fn((url: string) => navegar(url)),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

function assinar(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

function useRota(): Rota {
  return useSyncExternalStore(
    assinar,
    () => rotaAtual,
    () => rotaAtual,
  );
}

vi.mock('next/navigation', () => ({
  useRouter: () => roteador,
  usePathname: () => useRota().caminho,
  useSearchParams: () => useRota().params,
}));

type PropsLink = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode };

vi.mock('next/link', () => ({
  default: ({ href, children, ...resto }: PropsLink) =>
    createElement('a', { href, ...resto }, children),
}));

// ---------------------------------------------------------------------------------------------
// Polyfill de <dialog> caso o jsdom não implemente showModal/close.
// ---------------------------------------------------------------------------------------------

const prototipo = HTMLDialogElement.prototype as Partial<HTMLDialogElement>;
if (typeof prototipo.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
}
if (typeof prototipo.close !== 'function') {
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

afterEach(() => {
  cleanup();
  definirRota('/');
  for (const espiao of Object.values(roteador)) espiao.mockClear();
  window.localStorage.clear();
});
