import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import DetalhesTime from '../../../src/app/times/detalhes/page.tsx';
import EditarTime from '../../../src/app/times/editar/page.tsx';
import NovoTime from '../../../src/app/times/novo/page.tsx';
import ListaTimes from '../../../src/app/times/page.tsx';
import { dev, doc, projeto, time } from '../app/apoio.ts';
import { renderizar } from './apoio.tsx';
import { definirRota, roteador } from './setup.ts';

const COM_VINCULOS = doc({
  times: [time('t1', 'Plataforma', 1, { area: 'Web' }), time('t2', 'Mobile', 2)],
  desenvolvedores: [dev('d1', 'Bruno', 3, 't1'), dev('d2', 'Ana', 4, 't1')],
  projetos: [projeto('p1', 'Portal do Cliente', 5, 't1')],
});

describe('telas de times', () => {
  it('lista: título, link Novo, busca e nomes como links', async () => {
    definirRota('/times');
    renderizar(<ListaTimes />, COM_VINCULOS);
    expect(screen.getByRole('heading', { level: 1, name: 'Times' })).toBeTruthy();
    expect(screen.getAllByRole('link', { name: 'Novo time' })[0]?.getAttribute('href')).toBe(
      '/times/novo/',
    );
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent)).toEqual([
      'Nome',
      'Área de atuação',
    ]);
    await userEvent.type(screen.getByLabelText('Buscar por nome'), 'plat');
    expect(screen.getByRole('status').textContent).toBe('1 registro(s) encontrado(s)');
    expect(screen.getByRole('link', { name: 'Plataforma' }).getAttribute('href')).toBe(
      '/times/detalhes/?id=t1',
    );
  });

  it('lista vazia', () => {
    renderizar(<ListaTimes />, doc());
    expect(screen.getByText('Nenhum time cadastrado.')).toBeTruthy();
  });

  it('cadastro válido navega para os detalhes e publica a mensagem de sucesso', async () => {
    definirRota('/times/novo');
    const { repositorio } = renderizar(<NovoTime />);
    expect(screen.getByRole('heading', { level: 1, name: 'Novo time' })).toBeTruthy();
    await userEvent.type(screen.getByLabelText(/^Nome/), 'Plataforma');
    await userEvent.type(screen.getByLabelText(/^Área de atuação/), 'Web');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(roteador.push).toHaveBeenCalledWith('/times/detalhes/?id=novo-1');
    expect(screen.getByRole('status').textContent).toContain('Time cadastrado com sucesso.');
    expect(repositorio.getSnapshot().times[0]?.nome).toBe('Plataforma');
  });

  it('nome duplicado mostra erro no campo', async () => {
    renderizar(<NovoTime />, COM_VINCULOS);
    await userEvent.type(screen.getByLabelText(/^Nome/), ' plataforma ');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(document.getElementById('erro-nome')?.textContent).toBe(
      'Já existe um time com esse nome. Escolha outro nome.',
    );
    expect(roteador.push).not.toHaveBeenCalled();
  });

  it('Cancelar no cadastro volta para a lista', async () => {
    renderizar(<NovoTime />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(roteador.push).toHaveBeenCalledWith('/times/');
  });

  it('detalhes mostram dados, desenvolvedores e projetos do time', () => {
    definirRota('/times/detalhes', { id: 't1' });
    renderizar(<DetalhesTime />, COM_VINCULOS);
    expect(screen.getByRole('heading', { level: 1, name: 'Time: Plataforma' })).toBeTruthy();
    expect(screen.getByText('Não informado')).toBeTruthy();
    const devs = screen.getByRole('region', { name: 'Desenvolvedores do time' });
    expect(
      within(devs)
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual(['Ana', 'Bruno']);
    const projetos = screen.getByRole('region', { name: 'Projetos do time' });
    expect(within(projetos).getByRole('link', { name: 'Portal do Cliente' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Editar' }).getAttribute('href')).toBe(
      '/times/editar/?id=t1',
    );
  });

  it('exclusão com vínculos não abre o diálogo e explica o bloqueio', async () => {
    definirRota('/times/detalhes', { id: 't1' });
    renderizar(<DetalhesTime />, COM_VINCULOS);
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('alert').textContent).toContain(
      'Não é possível excluir o time "Plataforma": ele possui 2 desenvolvedor(es) e 1 projeto(s) vinculados. Transfira ou exclua esses registros antes.',
    );
  });

  it('exclusão sem vínculos: cancelar mantém, confirmar remove e volta à lista', async () => {
    definirRota('/times/detalhes', { id: 't2' });
    const { repositorio } = renderizar(<DetalhesTime />, COM_VINCULOS);
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    let dialogo = screen.getByRole('dialog');
    expect(dialogo.textContent).toContain(
      'Excluir time "Mobile"? Esta ação não pode ser desfeita.',
    );
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));
    expect(repositorio.getSnapshot().times).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    dialogo = screen.getByRole('dialog');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Excluir' }));
    expect(repositorio.getSnapshot().times.map((t) => t.id)).toEqual(['t1']);
    expect(roteador.push).toHaveBeenCalledWith('/times/');
    expect(screen.getByRole('status').textContent).toContain('Time excluído com sucesso.');
  });

  it('falha de gravação na exclusão mostra erro e mantém o registro', async () => {
    definirRota('/times/detalhes', { id: 't2' });
    const { repositorio, armazenamento } = renderizar(<DetalhesTime />, COM_VINCULOS);
    armazenamento.falharProximaGravacao();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
    );
    expect(screen.getByRole('alert').textContent).toContain(
      'Não foi possível excluir: o armazenamento do navegador está cheio ou indisponível. Nada foi alterado.',
    );
    expect(repositorio.getSnapshot().times).toHaveLength(2);
    expect(roteador.push).not.toHaveBeenCalled();
  });

  it('id inexistente mostra "Registro não encontrado." com link de volta', () => {
    definirRota('/times/detalhes', { id: 'nao-existe' });
    renderizar(<DetalhesTime />, COM_VINCULOS);
    expect(screen.getByText(/Registro não encontrado\./)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Voltar para Times' }).getAttribute('href')).toBe(
      '/times/',
    );
  });

  it('edição: valores atuais, salva e volta aos detalhes com mensagem', async () => {
    definirRota('/times/editar', { id: 't1' });
    const { repositorio } = renderizar(<EditarTime />, COM_VINCULOS);
    expect(screen.getByRole('heading', { level: 1, name: 'Editar time' })).toBeTruthy();
    const nome = screen.getByLabelText(/^Nome/) as HTMLInputElement;
    expect(nome.value).toBe('Plataforma');
    await userEvent.clear(nome);
    await userEvent.type(nome, 'Plataforma Web');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(roteador.push).toHaveBeenCalledWith('/times/detalhes/?id=t1');
    expect(screen.getByRole('status').textContent).toContain('Time atualizado com sucesso.');
    expect(repositorio.getSnapshot().times[0]?.nome).toBe('Plataforma Web');
  });

  it('edição: Cancelar volta aos detalhes; id inexistente mostra não encontrado', async () => {
    definirRota('/times/editar', { id: 't1' });
    renderizar(<EditarTime />, COM_VINCULOS);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(roteador.push).toHaveBeenCalledWith('/times/detalhes/?id=t1');
  });

  it('edição de id inexistente', () => {
    definirRota('/times/editar', { id: 'x' });
    renderizar(<EditarTime />, COM_VINCULOS);
    expect(screen.getByText(/Registro não encontrado\./)).toBeTruthy();
  });
});
