import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import DetalhesDesenvolvedor from '../../../src/app/desenvolvedores/detalhes/page.tsx';
import EditarDesenvolvedor from '../../../src/app/desenvolvedores/editar/page.tsx';
import NovoDesenvolvedor from '../../../src/app/desenvolvedores/novo/page.tsx';
import ListaDesenvolvedores from '../../../src/app/desenvolvedores/page.tsx';
import { dev, doc, time } from '../app/apoio.ts';
import { renderizar } from './apoio.tsx';
import { definirRota, roteador } from './setup.ts';

const DOC = doc({
  times: [time('t1', 'Plataforma', 1), time('t2', 'Mobile', 2)],
  desenvolvedores: [
    dev('d1', 'Ana', 3, 't1', { email: 'ana@empresa.com', nivel: 'senior' }),
    dev('d2', 'Bruno', 4, 't2', { nivel: 'junior' }),
  ],
});

describe('telas de desenvolvedores', () => {
  it('sem times mostra o aviso', () => {
    renderizar(<NovoDesenvolvedor />, doc());
    expect(
      screen.getByText('É preciso cadastrar um time antes de cadastrar desenvolvedores.'),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Cadastrar time' })).toBeTruthy();
  });

  it('selects de Nível e Time começam em "Selecione…"', () => {
    renderizar(<NovoDesenvolvedor />, DOC);
    const nivel = screen.getByLabelText(/^Nível/) as HTMLSelectElement;
    expect(nivel.value).toBe('');
    expect(Array.from(nivel.options).map((o) => o.textContent)).toEqual([
      'Selecione…',
      'Júnior',
      'Pleno',
      'Sênior',
    ]);
    expect((screen.getByLabelText(/^Time/) as HTMLSelectElement).value).toBe('');
    expect(screen.getByLabelText(/^Telefone/).getAttribute('type')).toBe('tel');
    expect(screen.getByLabelText(/^E-mail/).getAttribute('type')).toBe('email');
  });

  it('cadastro válido navega aos detalhes', async () => {
    renderizar(<NovoDesenvolvedor />, DOC);
    await userEvent.type(screen.getByLabelText(/^Nome/), 'Carla');
    await userEvent.type(screen.getByLabelText(/^E-mail/), 'carla@empresa.com');
    await userEvent.selectOptions(screen.getByLabelText(/^Nível/), 'pleno');
    await userEvent.selectOptions(screen.getByLabelText(/^Time/), 't2');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(roteador.push).toHaveBeenCalledWith('/desenvolvedores/detalhes/?id=novo-1');
    expect(screen.getByRole('status').textContent).toContain(
      'Desenvolvedor cadastrado com sucesso.',
    );
  });

  it('e-mail em uso por outro desenvolvedor', async () => {
    renderizar(<NovoDesenvolvedor />, DOC);
    await userEvent.type(screen.getByLabelText(/^Nome/), 'Outra Ana');
    await userEvent.type(screen.getByLabelText(/^E-mail/), 'Ana@Empresa.com');
    await userEvent.selectOptions(screen.getByLabelText(/^Nível/), 'pleno');
    await userEvent.selectOptions(screen.getByLabelText(/^Time/), 't1');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(document.getElementById('erro-email')?.textContent).toBe(
      'Este e-mail já está em uso por outro desenvolvedor.',
    );
  });

  it('lista com colunas e filtros de Time e Nível', async () => {
    renderizar(<ListaDesenvolvedores />, DOC);
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent)).toEqual([
      'Nome',
      'E-mail',
      'Nível',
      'Time',
    ]);
    const linha = screen.getByRole('link', { name: 'Ana' }).closest('tr') as HTMLElement;
    expect(
      within(linha)
        .getAllByRole('cell')
        .map((c) => c.textContent),
    ).toEqual(['Ana', 'ana@empresa.com', 'Sênior', 'Plataforma']);
    await userEvent.selectOptions(screen.getByLabelText('Nível'), 'junior');
    expect(screen.getByRole('status').textContent).toBe('1 registro(s) encontrado(s)');
    await userEvent.selectOptions(screen.getByLabelText('Time'), 't1');
    expect(screen.getByRole('status').textContent).toBe('0 registro(s) encontrado(s)');
  });

  it('detalhes: time como link e opcionais vazios como "Não informado"', async () => {
    definirRota('/desenvolvedores/detalhes', { id: 'd1' });
    const { repositorio } = renderizar(<DetalhesDesenvolvedor />, DOC);
    expect(screen.getByRole('heading', { level: 1, name: 'Desenvolvedor: Ana' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Plataforma' }).getAttribute('href')).toBe(
      '/times/detalhes/?id=t1',
    );
    expect(screen.getAllByText('Não informado')).toHaveLength(3);
    expect(screen.getByText('Sênior')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    const dialogo = screen.getByRole('dialog');
    expect(dialogo.textContent).toContain('Excluir desenvolvedor "Ana"?');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Excluir' }));
    expect(roteador.push).toHaveBeenCalledWith('/desenvolvedores/');
    expect(screen.getByRole('status').textContent).toContain('Desenvolvedor excluído com sucesso.');
    expect(repositorio.getSnapshot().desenvolvedores.map((d) => d.id)).toEqual(['d2']);
  });

  it('edição permite trocar o time', async () => {
    definirRota('/desenvolvedores/editar', { id: 'd1' });
    const { repositorio } = renderizar(<EditarDesenvolvedor />, DOC);
    expect((screen.getByLabelText(/^Time/) as HTMLSelectElement).value).toBe('t1');
    await userEvent.selectOptions(screen.getByLabelText(/^Time/), 't2');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByRole('status').textContent).toContain(
      'Desenvolvedor atualizado com sucesso.',
    );
    expect(repositorio.getSnapshot().desenvolvedores[0]?.timeId).toBe('t2');
  });
});
