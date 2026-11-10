import { describe, expect, it } from 'vitest';
import { CHAVE, documentoVazio, lerDocumento } from '../../../../src/data/documento.ts';

const COLECOES = [
  'administradores',
  'usuarios',
  'desenvolvedores',
  'times',
  'projetos',
  'relatorios',
  'marcos',
  'itensCronograma',
] as const;

describe('documento', () => {
  it('chave do localStorage', () => {
    expect(CHAVE).toBe('sgp:dados');
  });

  it('null → documento vazio', () => {
    const resultado = lerDocumento(null);
    expect(resultado).toEqual({ estado: 'ok', documento: documentoVazio() });
    const doc = documentoVazio();
    expect(doc.versao).toBe(1);
    expect(doc.seq).toBe(0);
    for (const colecao of COLECOES) expect(doc[colecao]).toEqual([]);
  });

  it('JSON válido versão 1 → ok', () => {
    const doc = {
      ...documentoVazio(),
      seq: 3,
      times: [{ id: 'a', seq: 1, nome: 'X', descricao: '', area: '' }],
    };
    expect(lerDocumento(JSON.stringify(doc))).toEqual({ estado: 'ok', documento: doc });
  });

  it.each([
    ['JSON inválido', '{nao é json'],
    ['não objeto', '42'],
    ['null', 'null'],
    ['versão diferente', JSON.stringify({ ...documentoVazio(), versao: 2 })],
    ['seq não numérico', JSON.stringify({ ...documentoVazio(), seq: 'x' })],
    ['coleção ausente', JSON.stringify({ versao: 1, seq: 0 })],
    ['coleção não-array', JSON.stringify({ ...documentoVazio(), marcos: {} })],
  ])('%s → corrompido', (_nome, texto) => {
    expect(lerDocumento(texto)).toEqual({ estado: 'corrompido' });
  });
});
