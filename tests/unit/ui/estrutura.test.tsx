import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Inicio from '../../../src/app/page.tsx';
import ListaTimes from '../../../src/app/times/page.tsx';
import {
  ArmazenamentoEmMemoria,
  criarArmazenamentoNavegador,
} from '../../../src/data/armazenamento.ts';
import { criarRepositorio } from '../../../src/data/repositorio.ts';
import { MensagensProvider } from '../../../src/ui/Mensagens.tsx';
import { RepositorioProvider } from '../../../src/ui/RepositorioProvider.tsx';
import { renderizar } from './apoio.tsx';

describe('estrutura comum', () => {
  it('tela inicial: título e atalhos na ordem do menu', () => {
    renderizar(<Inicio />);
    expect(screen.getByRole('heading', { level: 1, name: 'SGP — Início' })).toBeTruthy();
    expect(screen.getAllByRole('link').map((l) => l.textContent)).toEqual([
      'Projetos',
      'Times',
      'Desenvolvedores',
      'Usuários',
      'Administradores',
    ]);
    expect(document.title).toBe('SGP — Início');
  });

  it('dados ilegíveis: alerta e conteúdo não exibido', () => {
    const repositorio = criarRepositorio({ armazenamento: new ArmazenamentoEmMemoria('{x') });
    render(
      <RepositorioProvider repositorio={repositorio}>
        <ListaTimes />
      </RepositorioProvider>,
    );
    expect(screen.getByRole('alert').textContent).toBe(
      'Os dados salvos neste navegador não puderam ser lidos. Nenhuma alteração será gravada para não perder informações.',
    );
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('armazenamento indisponível: alerta', () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    armazenamento.falharLeitura();
    render(
      <RepositorioProvider repositorio={criarRepositorio({ armazenamento })}>
        <ListaTimes />
      </RepositorioProvider>,
    );
    expect(screen.getByRole('alert').textContent).toContain(
      'O armazenamento do navegador está indisponível.',
    );
  });

  it('repositório padrão grava no localStorage do navegador', async () => {
    window.localStorage.clear();
    const { default: NovoTime } = await import('../../../src/app/times/novo/page.tsx');
    render(
      <RepositorioProvider>
        <MensagensProvider>
          <NovoTime />
        </MensagensProvider>
      </RepositorioProvider>,
    );
    await userEvent.type(screen.getByLabelText(/^Nome/), 'Plataforma');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    const salvo = JSON.parse(window.localStorage.getItem('sgp:dados') ?? '{}');
    expect(salvo.times[0].nome).toBe('Plataforma');
  });

  it('armazenamento do navegador delega ao localStorage', () => {
    const armazenamento = criarArmazenamentoNavegador();
    armazenamento.setItem('chave-teste', 'valor');
    expect(armazenamento.getItem('chave-teste')).toBe('valor');
    window.localStorage.removeItem('chave-teste');
  });
});
