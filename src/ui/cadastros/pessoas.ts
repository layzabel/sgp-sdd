// Configuração dos cadastros de apoio: administradores (US5) e usuários (US6).

import { DESCRITORES_ADMINISTRADOR } from '../../domain/regras/administrador.ts';
import { DESCRITORES_USUARIO } from '../../domain/regras/usuario.ts';
import type { Administrador, Usuario } from '../../domain/tipos.ts';
import type { CampoDetalhe } from '../Detalhes.tsx';
import type { ConfigCadastro } from '../cadastro/config.ts';

export const ADMINISTRADORES: ConfigCadastro<Administrador> = {
  base: '/administradores',
  entidade: 'administrador',
  Entidade: 'Administrador',
  plural: 'Administradores',
  campos: () => DESCRITORES_ADMINISTRADOR,
  obter: (doc, id) => doc.administradores.find((a) => a.id === id),
  criar: (repositorio, valores) => repositorio.criarAdministrador(valores),
  atualizar: (repositorio, id, valores) => repositorio.atualizarAdministrador(id, valores),
  excluir: (repositorio, id) => repositorio.excluirAdministrador(id),
};

export const USUARIOS: ConfigCadastro<Usuario> = {
  base: '/usuarios',
  entidade: 'usuário',
  Entidade: 'Usuário',
  plural: 'Usuários',
  campos: () => DESCRITORES_USUARIO,
  obter: (doc, id) => doc.usuarios.find((u) => u.id === id),
  criar: (repositorio, valores) => repositorio.criarUsuario(valores),
  atualizar: (repositorio, id, valores) => repositorio.atualizarUsuario(id, valores),
  excluir: (repositorio, id) => repositorio.excluirUsuario(id),
};

/** Campos rotulados a partir dos descritores do cadastro (todos texto simples). */
function camposPorDescritor(
  registro: object,
  descritores: readonly { campo: string; rotulo: string }[],
): CampoDetalhe[] {
  const fonte = registro as Record<string, unknown>;
  return descritores.map((d) => ({ rotulo: d.rotulo, valor: String(fonte[d.campo] ?? '') }));
}

export function camposDetalheAdministrador(_doc: unknown, a: Administrador): CampoDetalhe[] {
  return camposPorDescritor(a, DESCRITORES_ADMINISTRADOR);
}

export function camposDetalheUsuario(_doc: unknown, u: Usuario): CampoDetalhe[] {
  return camposPorDescritor(u, DESCRITORES_USUARIO);
}
