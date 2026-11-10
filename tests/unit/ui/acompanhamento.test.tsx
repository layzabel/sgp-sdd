import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import DetalhesProjeto from '../../../src/app/projetos/detalhes/page.tsx';
import { formatarDataDeMomento } from '../../../src/domain/datas.ts';
import { doc, item, marco, projeto, relatorio, time } from '../app/apoio.ts';
import { renderizar } from './apoio.tsx';
import { definirRota } from './setup.ts';

const DOC = doc({
  times: [time('t1', 'Plataforma', 1)],
  projetos: [projeto('p1', 'Portal', 2, 't1')],
  relatorios: [
    { ...relatorio('r1', 'p1', 3, '2026-03-05T12:00:00.000Z'), texto: 'linha 1\nlinha 2' },
  ],
  marcos: [marco('m1', 'p1', 4, 'Kickoff'), marco('m2', 'p1', 5, 'Entrega')],
  itensCronograma: [
    item('i1', 'p1', 6, '2026-04-20', 'Implantação'),
    item('i2', 'p1', 7, '2026-04-05', 'Testes'),
  ],
});

function secao(nome: string) {
  return screen.getByRole('region', { name: nome });
}

function montar(documento = DOC) {
  definirRota('/projetos/detalhes', { id: 'p1' });
  return renderizar(<DetalhesProjeto />, documento);
}

describe('acompanhamento nos detalhes do projeto', () => {
  it('três seções na ordem Relatórios, Marcos, Cronograma com formulário acima da lista', () => {
    montar();
    const titulos = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(titulos).toEqual(['Relatórios', 'Marcos', 'Cronograma']);
    const relatorios = secao('Relatórios');
    expect(within(relatorios).getByLabelText(/^Texto do relatório/).tagName).toBe('TEXTAREA');
    expect(within(relatorios).getByRole('button', { name: 'Adicionar relatório' })).toBeTruthy();
    const form = relatorios.querySelector('form');
    const lista = relatorios.querySelector('ul, ol');
    expect(
      form && lista && form.compareDocumentPosition(lista) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(within(secao('Marcos')).getByLabelText(/^Descrição do marco/)).toBeTruthy();
    expect(within(secao('Marcos')).getByRole('button', { name: 'Adicionar marco' })).toBeTruthy();
    expect(within(secao('Cronograma')).getByLabelText(/^Atividade/)).toBeTruthy();
    expect(
      within(secao('Cronograma'))
        .getByLabelText(/^Data prevista/)
        .getAttribute('type'),
    ).toBe('date');
    expect(
      within(secao('Cronograma')).getByRole('button', { name: 'Adicionar item' }),
    ).toBeTruthy();
  });

  it('relatório mostra só a data dd/mm/aaaa e preserva quebras de linha', () => {
    montar();
    const relatorios = secao('Relatórios');
    const itemLista = within(relatorios).getAllByRole('listitem')[0] as HTMLElement;
    expect(itemLista.textContent).toContain(formatarDataDeMomento('2026-03-05T12:00:00.000Z'));
    expect(itemLista.textContent).not.toMatch(/\d{2}:\d{2}/);
    expect(within(itemLista).getByText(/linha 1/).textContent).toBe('linha 1\nlinha 2');
  });

  it('marcos em <ol> na ordem de criação; cronograma por data', () => {
    montar();
    const ol = secao('Marcos').querySelector('ol');
    expect(Array.from(ol?.querySelectorAll('li') ?? []).map((li) => li.textContent)).toEqual([
      'Kickoff',
      'Entrega',
    ]);
    const itens = within(secao('Cronograma'))
      .getAllByRole('listitem')
      .map((li) => li.textContent);
    expect(itens).toEqual(['05/04/2026 — Testes', '20/04/2026 — Implantação']);
  });

  it('nenhum botão de editar/excluir nos itens de acompanhamento', () => {
    montar();
    for (const nome of ['Relatórios', 'Marcos', 'Cronograma']) {
      const botoes = within(secao(nome))
        .getAllByRole('button')
        .map((b) => b.textContent);
      expect(botoes.every((t) => t?.startsWith('Adicionar'))).toBe(true);
      expect(within(secao(nome)).queryByRole('link', { name: /Editar|Excluir/ })).toBeNull();
    }
  });

  it('adicionar relatório limpa o formulário e anuncia o sucesso', async () => {
    const { repositorio } = montar();
    const relatorios = secao('Relatórios');
    const campo = within(relatorios).getByLabelText(/^Texto do relatório/) as HTMLTextAreaElement;
    await userEvent.type(campo, 'Sprint 2 concluída');
    await userEvent.click(within(relatorios).getByRole('button', { name: 'Adicionar relatório' }));
    expect(campo.value).toBe('');
    expect(screen.getByRole('status').textContent).toContain('Relatório adicionado com sucesso.');
    expect(repositorio.getSnapshot().relatorios).toHaveLength(2);
    expect(within(relatorios).getAllByRole('listitem')[0]?.textContent).toContain(
      'Sprint 2 concluída',
    );
  });

  it('adicionar marco e item anunciam as mensagens próprias', async () => {
    montar();
    const marcos = secao('Marcos');
    await userEvent.type(within(marcos).getByLabelText(/^Descrição do marco/), 'Protótipo');
    await userEvent.click(within(marcos).getByRole('button', { name: 'Adicionar marco' }));
    expect(screen.getByRole('status').textContent).toContain('Marco adicionado com sucesso.');
    expect(
      within(marcos)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['Kickoff', 'Entrega', 'Protótipo']);
    const cronograma = secao('Cronograma');
    await userEvent.type(within(cronograma).getByLabelText(/^Atividade/), 'Homologação');
    await userEvent.type(within(cronograma).getByLabelText(/^Data prevista/), '2026-04-12');
    await userEvent.click(within(cronograma).getByRole('button', { name: 'Adicionar item' }));
    expect(screen.getByRole('status').textContent).toContain(
      'Item de cronograma adicionado com sucesso.',
    );
    expect(within(cronograma).getAllByRole('listitem')[1]?.textContent).toBe(
      '12/04/2026 — Homologação',
    );
  });

  it('em erro o texto digitado é mantido e o campo é indicado', async () => {
    const { armazenamento } = montar();
    const cronograma = secao('Cronograma');
    const atividade = within(cronograma).getByLabelText(/^Atividade/) as HTMLInputElement;
    await userEvent.type(atividade, 'Sem data');
    await userEvent.click(within(cronograma).getByRole('button', { name: 'Adicionar item' }));
    expect(atividade.value).toBe('Sem data');
    expect(within(cronograma).getByText('Informe a data prevista.')).toBeTruthy();
    armazenamento.falharProximaGravacao();
    const marcos = secao('Marcos');
    const descricao = within(marcos).getByLabelText(/^Descrição do marco/) as HTMLInputElement;
    await userEvent.type(descricao, 'Go-live');
    await userEvent.click(within(marcos).getByRole('button', { name: 'Adicionar marco' }));
    expect(descricao.value).toBe('Go-live');
    expect(within(marcos).getByRole('alert').textContent).toContain(
      'Não foi possível salvar os dados no navegador',
    );
  });

  it('listas vazias exibem mensagem', () => {
    montar(
      doc({ times: [time('t1', 'Plataforma', 1)], projetos: [projeto('p1', 'Portal', 2, 't1')] }),
    );
    expect(within(secao('Relatórios')).getByText('Nenhum relatório registrado.')).toBeTruthy();
    expect(within(secao('Marcos')).getByText('Nenhum marco registrado.')).toBeTruthy();
    expect(
      within(secao('Cronograma')).getByText('Nenhum item de cronograma registrado.'),
    ).toBeTruthy();
  });
});
