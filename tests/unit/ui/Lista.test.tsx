import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { contem } from '../../../src/domain/texto.ts';
import { Lista, type CriteriosLista } from '../../../src/ui/Lista.tsx';

type Item = { id: string; nome: string; cor: string };

const ITENS: Item[] = [
  { id: '1', nome: 'Alfa', cor: 'azul' },
  { id: '2', nome: 'Beta', cor: 'verde' },
  { id: '3', nome: 'Gama', cor: 'azul' },
];

function consultar(itens: readonly Item[]) {
  return (c: CriteriosLista) =>
    itens.filter((i) => contem(i.nome, c.busca) && (!c.filtros.cor || i.cor === c.filtros.cor));
}

function montar(itens: readonly Item[] = ITENS) {
  return render(
    <Lista<Item>
      rotuloTabela="Itens cadastrados"
      entidade="item"
      linkNovo={{ href: '/itens/novo/', texto: 'Novo item' }}
      rotuloBusca="Buscar por nome"
      filtros={[
        {
          campo: 'cor',
          rotulo: 'Cor',
          opcoes: [
            { valor: 'azul', rotulo: 'Azul' },
            { valor: 'verde', rotulo: 'Verde' },
          ],
        },
      ]}
      colunas={[
        { titulo: 'Nome', valor: (i) => i.nome },
        { titulo: 'Cor', valor: (i) => i.cor },
      ]}
      total={itens.length}
      consultar={consultar(itens)}
      hrefDetalhes={(i) => `/itens/detalhes/?id=${i.id}`}
    />,
  );
}

describe('Lista', () => {
  it('mostra todos os itens, contagem e nome como link para detalhes', () => {
    montar();
    expect(screen.getByRole('status').textContent).toBe('3 registro(s) encontrado(s)');
    const link = screen.getByRole('link', { name: 'Beta' });
    expect(link.getAttribute('href')).toBe('/itens/detalhes/?id=2');
    expect(screen.getByRole('table', { name: 'Itens cadastrados' })).toBeTruthy();
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Nome', 'Cor']);
    expect(screen.getByRole('link', { name: 'Novo item' }).getAttribute('href')).toBe(
      '/itens/novo/',
    );
  });

  it('busca filtra a cada digitação e filtros combinam', async () => {
    montar();
    await userEvent.type(screen.getByLabelText('Buscar por nome'), 'a');
    expect(screen.getByRole('status').textContent).toBe('3 registro(s) encontrado(s)');
    await userEvent.type(screen.getByLabelText('Buscar por nome'), 'm');
    expect(screen.getByRole('status').textContent).toBe('1 registro(s) encontrado(s)');
    await userEvent.clear(screen.getByLabelText('Buscar por nome'));
    const filtro = screen.getByLabelText('Cor') as HTMLSelectElement;
    expect(filtro.options[0]?.textContent).toBe('Todos');
    await userEvent.selectOptions(filtro, 'azul');
    expect(screen.getByRole('status').textContent).toBe('2 registro(s) encontrado(s)');
  });

  it('sem resultado: mensagem e botão que limpa busca e filtros', async () => {
    montar();
    await userEvent.selectOptions(screen.getByLabelText('Cor'), 'verde');
    await userEvent.type(screen.getByLabelText('Buscar por nome'), 'zzz');
    expect(screen.getByText('Nenhum registro atende à busca e aos filtros.')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Limpar busca e filtros' }));
    expect((screen.getByLabelText('Buscar por nome') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Cor') as HTMLSelectElement).value).toBe('');
    expect(screen.getByRole('status').textContent).toBe('3 registro(s) encontrado(s)');
  });

  it('sem registros: "Nenhum {entidade} cadastrado." com link Novo', () => {
    montar([]);
    const vazio = screen.getByText('Nenhum item cadastrado.');
    expect(vazio).toBeTruthy();
    const links = within(document.body).getAllByRole('link', { name: 'Novo item' });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole('table')).toBeNull();
  });
});
