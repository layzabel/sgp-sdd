'use client';

import { ROTULOS_NIVEL } from '../../domain/mensagens.ts';
import { DESCRITORES_DESENVOLVEDOR } from '../../domain/regras/desenvolvedor.ts';
import type { Desenvolvedor, Documento } from '../../domain/tipos.ts';
import type { CampoDetalhe } from '../Detalhes.tsx';
import type { ConfigCadastro } from '../cadastro/config.ts';
import { LinkDoTime, comOpcoesDeTime } from './comum.tsx';

export const DESENVOLVEDORES: ConfigCadastro<Desenvolvedor> = {
  base: '/desenvolvedores',
  entidade: 'desenvolvedor',
  Entidade: 'Desenvolvedor',
  plural: 'Desenvolvedores',
  campos: (doc) => comOpcoesDeTime(DESCRITORES_DESENVOLVEDOR, doc),
  exigeTimes: 'desenvolvedores',
  obter: (doc, id) => doc.desenvolvedores.find((d) => d.id === id),
  criar: (repositorio, valores) => repositorio.criarDesenvolvedor(valores),
  atualizar: (repositorio, id, valores) => repositorio.atualizarDesenvolvedor(id, valores),
  excluir: (repositorio, id) => repositorio.excluirDesenvolvedor(id),
};

export function camposDetalheDesenvolvedor(doc: Documento, d: Desenvolvedor): CampoDetalhe[] {
  return [
    { rotulo: 'Nome', valor: d.nome },
    { rotulo: 'E-mail', valor: d.email },
    { rotulo: 'Telefone', valor: d.telefone },
    { rotulo: 'Cargo', valor: d.cargo },
    { rotulo: 'Nível', valor: ROTULOS_NIVEL[d.nivel] },
    { rotulo: 'Principal tecnologia', valor: d.tecnologia },
    { rotulo: 'Time', valor: <LinkDoTime doc={doc} timeId={d.timeId} /> },
  ];
}
