import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import DetalhesAdministrador from '../../../src/app/administradores/detalhes/page.tsx';
import EditarAdministrador from '../../../src/app/administradores/editar/page.tsx';
import NovoAdministrador from '../../../src/app/administradores/novo/page.tsx';
import ListaAdministradores from '../../../src/app/administradores/page.tsx';
import DetalhesUsuario from '../../../src/app/usuarios/detalhes/page.tsx';
import EditarUsuario from '../../../src/app/usuarios/editar/page.tsx';
import NovoUsuario from '../../../src/app/usuarios/novo/page.tsx';
import ListaUsuarios from '../../../src/app/usuarios/page.tsx';
import { doc } from '../app/apoio.ts';
import { renderizar } from './apoio.tsx';
import { definirRota, roteador } from './setup.ts';

const DOC = doc({
  administradores: [
    {
      id: 'a1',
      seq: 1,
      nome: 'João',
      email: 'joao@empresa.com',
      telefone: '11 9',
      cargo: 'Gerente',
      setor: 'TI',
    },
    {
      id: 'a2',
      seq: 2,
      nome: 'Bia',
      email: 'bia@financeiro.com',
      telefone: '11 8',
      cargo: 'Analista',
      setor: 'Fin',
    },
  ],
  usuarios: [
    {
      id: 'u1',
      seq: 3,
      nome: 'Maria',
      email: 'maria@cliente.com',
      telefone: '',
      organizacao: 'Cliente S.A.',
    },
    { id: 'u2', seq: 4, nome: 'Carlos', email: 'carlos@x.com', telefone: '', organizacao: '' },
  ],
});

describe('telas de administradores', () => {
  it('lista com colunas e busca por e-mail', async () => {
    renderizar(<ListaAdministradores />, DOC);
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent)).toEqual([
      'Nome',
      'E-mail',
      'Cargo',
      'Setor',
    ]);
    await userEvent.type(screen.getByLabelText('Buscar por nome ou e-mail'), 'financeiro');
    expect(screen.getByRole('status').textContent).toBe('1 registro(s) encontrado(s)');
    expect(screen.getByRole('link', { name: 'Bia' })).toBeTruthy();
  });

  it('cadastro com os cinco campos obrigatórios', async () => {
    renderizar(<NovoAdministrador />, DOC);
    expect(screen.getByRole('heading', { level: 1, name: 'Novo administrador' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(document.getElementById('erro-setor')?.textContent).toBe('Informe o setor.');
    await userEvent.type(screen.getByLabelText(/^Nome/), 'Ana');
    await userEvent.type(screen.getByLabelText(/^E-mail/), 'ana@empresa.com');
    await userEvent.type(screen.getByLabelText(/^Telefone/), '1');
    await userEvent.type(screen.getByLabelText(/^Cargo/), 'c');
    await userEvent.type(screen.getByLabelText(/^Setor/), 's');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(roteador.push).toHaveBeenCalledWith('/administradores/detalhes/?id=novo-1');
  });

  it('detalhes, exclusão e edição', async () => {
    definirRota('/administradores/detalhes', { id: 'a1' });
    const { repositorio } = renderizar(<DetalhesAdministrador />, DOC);
    expect(screen.getByRole('heading', { level: 1, name: 'Administrador: João' })).toBeTruthy();
    expect(screen.getByText('Gerente')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir' }),
    );
    expect(repositorio.getSnapshot().administradores.map((a) => a.id)).toEqual(['a2']);
    expect(screen.getByRole('status').textContent).toContain('Administrador excluído com sucesso.');
  });

  it('edição mostra os valores atuais', async () => {
    definirRota('/administradores/editar', { id: 'a2' });
    renderizar(<EditarAdministrador />, DOC);
    expect((screen.getByLabelText(/^Setor/) as HTMLInputElement).value).toBe('Fin');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByRole('status').textContent).toContain(
      'Administrador atualizado com sucesso.',
    );
  });
});

describe('telas de usuários', () => {
  it('lista com busca por organização', async () => {
    renderizar(<ListaUsuarios />, DOC);
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent)).toEqual([
      'Nome',
      'E-mail',
      'Organização',
    ]);
    await userEvent.type(screen.getByLabelText('Buscar por nome ou organização'), 'cliente');
    expect(screen.getByRole('status').textContent).toBe('1 registro(s) encontrado(s)');
  });

  it('lista vazia', () => {
    renderizar(<ListaUsuarios />, doc());
    expect(screen.getByText('Nenhum usuário cadastrado.')).toBeTruthy();
  });

  it('cadastro e e-mail repetido', async () => {
    renderizar(<NovoUsuario />, DOC);
    expect(screen.getByRole('heading', { level: 1, name: 'Novo usuário' })).toBeTruthy();
    await userEvent.type(screen.getByLabelText(/^Nome/), 'Outra');
    await userEvent.type(screen.getByLabelText(/^E-mail/), 'MARIA@cliente.com');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(document.getElementById('erro-email')?.textContent).toBe(
      'Este e-mail já está em uso por outro usuário.',
    );
  });

  it('detalhes com opcionais vazios e edição', async () => {
    definirRota('/usuarios/detalhes', { id: 'u2' });
    renderizar(<DetalhesUsuario />, DOC);
    expect(screen.getByRole('heading', { level: 1, name: 'Usuário: Carlos' })).toBeTruthy();
    expect(screen.getAllByText('Não informado')).toHaveLength(2);
  });

  it('edição salva e volta aos detalhes', async () => {
    definirRota('/usuarios/editar', { id: 'u1' });
    const { repositorio } = renderizar(<EditarUsuario />, DOC);
    await userEvent.type(screen.getByLabelText(/^Telefone/), '11 7777');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(roteador.push).toHaveBeenCalledWith('/usuarios/detalhes/?id=u1');
    expect(repositorio.getSnapshot().usuarios[0]?.telefone).toBe('11 7777');
  });
});
