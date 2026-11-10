import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MenuPrincipal } from '../../../src/ui/MenuPrincipal.tsx';
import { definirRota } from './setup.ts';

describe('MenuPrincipal', () => {
  it('links na ordem do contrato', () => {
    render(<MenuPrincipal />);
    const nav = screen.getByRole('navigation', { name: 'Menu principal' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual([
      'Projetos',
      'Times',
      'Desenvolvedores',
      'Usuários',
      'Administradores',
    ]);
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/projetos/',
      '/times/',
      '/desenvolvedores/',
      '/usuarios/',
      '/administradores/',
    ]);
  });

  it('nenhum link atual na tela inicial', () => {
    definirRota('/');
    render(<MenuPrincipal />);
    expect(document.querySelector('[aria-current]')).toBeNull();
  });

  it.each([
    ['/projetos', 'Projetos'],
    ['/projetos/detalhes', 'Projetos'],
    ['/times/novo/', 'Times'],
    ['/usuarios/editar', 'Usuários'],
  ])('aria-current="page" em %s → %s', (caminho, atual) => {
    definirRota(caminho);
    render(<MenuPrincipal />);
    const correntes = Array.from(document.querySelectorAll('[aria-current="page"]'));
    expect(correntes.map((c) => c.textContent)).toEqual([atual]);
  });
});
