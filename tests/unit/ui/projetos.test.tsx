import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import DetalhesProjeto from '../../../src/app/projetos/detalhes/page.tsx';
import EditarProjeto from '../../../src/app/projetos/editar/page.tsx';
import NovoProjeto from '../../../src/app/projetos/novo/page.tsx';
import ListaProjetos from '../../../src/app/projetos/page.tsx';
import { doc, item, marco, projeto, relatorio, time } from '../app/apoio.ts';
import { renderizar } from './apoio.tsx';
import { definirRota, roteador } from './setup.ts';

const DOC = doc({
  times: [time('t1', 'Plataforma', 1), time('t2', 'Mobile', 2)],
  projetos: [
    projeto('p1', 'Portal do Cliente', 3, 't1', {
      inicio: '2026-03-10',
      terminoPrevisto: '2026-06-30',
      situacao: 'em_andamento',
    }),
    projeto('p2', 'App', 4, 't2'),
  ],
  relatorios: [relatorio('r1', 'p1', 5, '2026-03-11T10:00:00.000Z')],
  marcos: [marco('m1', 'p1', 6, 'Kickoff'), marco('m2', 'p1', 7, 'Entrega')],
  itensCronograma: [item('i1', 'p1', 8, '2026-04-01')],
});

describe('telas de projetos', () => {
  it('sem times, o cadastro mostra o aviso com link "Cadastrar time"', () => {
    renderizar(<NovoProjeto />, doc());
    expect(
      screen.getByText('É preciso cadastrar um time antes de cadastrar projetos.'),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Cadastrar time' }).getAttribute('href')).toBe(
      '/times/novo/',
    );
    expect(screen.queryByRole('button', { name: 'Salvar' })).toBeNull();
  });

  it('selects de Situação e Time começam em "Selecione…" com os times em ordem alfabética', () => {
    renderizar(<NovoProjeto />, DOC);
    const situacao = screen.getByLabelText(/^Situação/) as HTMLSelectElement;
    const timeSelect = screen.getByLabelText(/^Time responsável/) as HTMLSelectElement;
    expect(situacao.value).toBe('');
    expect(timeSelect.value).toBe('');
    expect(Array.from(timeSelect.options).map((o) => o.textContent)).toEqual([
      'Selecione…',
      'Mobile',
      'Plataforma',
    ]);
  });

  it('término antes do início mostra erro no campo de término', async () => {
    renderizar(<NovoProjeto />, DOC);
    await userEvent.type(screen.getByLabelText(/^Nome/), 'Portal');
    await userEvent.type(screen.getByLabelText(/^Data de início/), '2026-03-10');
    await userEvent.type(screen.getByLabelText(/^Data de término prevista/), '2026-03-09');
    await userEvent.selectOptions(screen.getByLabelText(/^Situação/), 'planejado');
    await userEvent.selectOptions(screen.getByLabelText(/^Time responsável/), 't1');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(document.getElementById('erro-terminoPrevisto')?.textContent).toBe(
      'A data de término prevista não pode ser anterior à data de início.',
    );
    expect(document.activeElement).toBe(screen.getByLabelText(/^Data de término prevista/));
  });

  it('cadastro válido navega para os detalhes', async () => {
    const { repositorio } = renderizar(<NovoProjeto />, DOC);
    await userEvent.type(screen.getByLabelText(/^Nome/), 'Novo Portal');
    await userEvent.type(screen.getByLabelText(/^Data de início/), '2026-03-10');
    await userEvent.selectOptions(screen.getByLabelText(/^Situação/), 'planejado');
    await userEvent.selectOptions(screen.getByLabelText(/^Time responsável/), 't2');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(roteador.push).toHaveBeenCalledWith('/projetos/detalhes/?id=novo-1');
    expect(screen.getByRole('status').textContent).toContain('Projeto cadastrado com sucesso.');
    expect(repositorio.getSnapshot().projetos).toHaveLength(3);
  });

  it('lista com colunas, datas dd/mm/aaaa e filtros', async () => {
    renderizar(<ListaProjetos />, DOC);
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent)).toEqual([
      'Nome',
      'Situação',
      'Time',
      'Início',
      'Término previsto',
    ]);
    const linha = screen.getByRole('link', { name: 'Portal do Cliente' }).closest('tr');
    expect(
      within(linha as HTMLElement)
        .getAllByRole('cell')
        .map((c) => c.textContent),
    ).toEqual(['Portal do Cliente', 'Em andamento', 'Plataforma', '10/03/2026', '30/06/2026']);
    const outra = screen.getByRole('link', { name: 'App' }).closest('tr');
    expect(within(outra as HTMLElement).getAllByRole('cell')[4]?.textContent).toBe('Não informado');
    await userEvent.selectOptions(screen.getByLabelText('Situação'), 'planejado');
    expect(screen.getByRole('status').textContent).toBe('1 registro(s) encontrado(s)');
    await userEvent.selectOptions(screen.getByLabelText('Time'), 't1');
    expect(screen.getByText('Nenhum registro atende à busca e aos filtros.')).toBeTruthy();
  });

  it('detalhes: dados, time como link e diálogo com as contagens do acompanhamento', async () => {
    definirRota('/projetos/detalhes', { id: 'p1' });
    const { repositorio } = renderizar(<DetalhesProjeto />, DOC);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Projeto: Portal do Cliente' }),
    ).toBeTruthy();
    expect(screen.getByText('10/03/2026')).toBeTruthy();
    expect(screen.getByText('Em andamento')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Plataforma' }).getAttribute('href')).toBe(
      '/times/detalhes/?id=t1',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    const dialogo = screen.getByRole('dialog');
    expect(dialogo.textContent).toContain(
      'Excluir projeto "Portal do Cliente"? Esta ação não pode ser desfeita.',
    );
    expect(dialogo.textContent).toContain(
      'Também serão excluídos 1 relatório(s), 2 marco(s) e 1 item(ns) de cronograma.',
    );
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Excluir' }));
    expect(roteador.push).toHaveBeenCalledWith('/projetos/');
    expect(screen.getByRole('status').textContent).toContain(
      'Projeto excluído com sucesso, junto com seus relatórios, marcos e cronograma.',
    );
    const snapshot = repositorio.getSnapshot();
    expect(snapshot.projetos.map((p) => p.id)).toEqual(['p2']);
    expect(snapshot.marcos).toEqual([]);
  });

  it('edição troca situação e time', async () => {
    definirRota('/projetos/editar', { id: 'p1' });
    const { repositorio } = renderizar(<EditarProjeto />, DOC);
    expect((screen.getByLabelText(/^Data de início/) as HTMLInputElement).value).toBe('2026-03-10');
    await userEvent.selectOptions(screen.getByLabelText(/^Situação/), 'concluido');
    await userEvent.selectOptions(screen.getByLabelText(/^Time responsável/), 't2');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(roteador.push).toHaveBeenCalledWith('/projetos/detalhes/?id=p1');
    expect(screen.getByRole('status').textContent).toContain('Projeto atualizado com sucesso.');
    expect(repositorio.getSnapshot().projetos[0]).toMatchObject({
      situacao: 'concluido',
      timeId: 't2',
    });
  });

  it('edição sem times mostra o aviso', () => {
    definirRota('/projetos/editar', { id: 'p1' });
    renderizar(<EditarProjeto />, doc({ projetos: [projeto('p1', 'Órfão', 1, 'apagado')] }));
    expect(
      screen.getByText('É preciso cadastrar um time antes de cadastrar projetos.'),
    ).toBeTruthy();
  });
});
