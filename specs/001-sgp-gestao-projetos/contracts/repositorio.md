# Contrato — Repositório e formato de armazenamento

Interface entre a interface (React) e os dados. Implementada em `src/data/`; regras puras em
`src/domain/`. Ver campos e regras em [../data-model.md](../data-model.md).

## Armazenamento físico

- Chave única do `localStorage`: `sgp:dados`.
- Valor: JSON do documento abaixo. Toda gravação substitui o documento inteiro com um único
  `setItem` (atomicidade — research R3).

```ts
type Documento = {
  versao: 1;
  seq: number; // último seq atribuído
  administradores: Administrador[];
  usuarios: Usuario[];
  desenvolvedores: Desenvolvedor[];
  times: Time[];
  projetos: Projeto[];
  relatorios: Relatorio[];
  marcos: Marco[];
  itensCronograma: ItemCronograma[];
};
```

- Chave ausente → documento vazio (`seq: 0`, coleções vazias); nada é gravado até a primeira
  operação.
- Valor ilegível (JSON inválido ou `versao` desconhecida) → o repositório **não** sobrescreve;
  expõe `estado: 'corrompido'` e a interface mostra erro (dados preservados para inspeção).
- Armazenamento indisponível na leitura (acesso negado) → `estado: 'indisponivel'`, interface
  mostra erro; nenhuma escrita é tentada.

## Interface de armazenamento (injetável)

```ts
interface Armazenamento {
  getItem(chave: string): string | null; // pode lançar
  setItem(chave: string, valor: string): void; // pode lançar (ex.: QuotaExceededError)
}
```

Implementações: `window.localStorage` (produção) e `ArmazenamentoEmMemoria` (testes, com opção
de falhar na próxima gravação).

## Resultado das operações

```ts
type Resultado<T> =
  | { ok: true; valor: T }
  | { ok: false; erro: { tipo: 'validacao'; campos: Partial<Record<string, string>> } }
  | { ok: false; erro: { tipo: 'vinculos'; desenvolvedores: number; projetos: number } }
  | { ok: false; erro: { tipo: 'nao_encontrado' } }
  | { ok: false; erro: { tipo: 'gravacao' } };
```

Garantias:

1. Nenhuma operação lança exceção para a interface; falhas viram `Resultado` com `ok: false`.
2. Em qualquer `ok: false`, o documento em memória e o armazenado permanecem **iguais** ao estado
   anterior (FR-009, FR-039).
3. Os valores devolvidos/gravados já estão normalizados (trim).

## Operações

Entradas `Dados*` são os campos editáveis da entidade (sem `id`, `seq`, `criadoEm`, `projetoId`
quando implícito). Todas as entradas de texto podem vir com espaços nas pontas.

### Leitura e assinatura

| Operação | Retorno |
| -------- | ------- |
| `subscribe(ouvinte)` | função para cancelar; o ouvinte é chamado após cada gravação bem-sucedida |
| `getSnapshot()` | `Documento` imutável atual (mesma referência até a próxima gravação) |

As consultas derivadas são funções puras de `src/domain/` sobre o `Documento`:

| Função | Regra |
| ------ | ----- |
| `listarAdministradores(doc, { busca })` | busca em nome ou e-mail; ordem alfabética |
| `listarUsuarios(doc, { busca })` | busca em nome ou organização; ordem alfabética |
| `listarDesenvolvedores(doc, { busca, timeId?, nivel? })` | busca em nome; filtros combinados; ordem alfabética |
| `listarTimes(doc, { busca })` | busca em nome; ordem alfabética |
| `listarProjetos(doc, { busca, situacao?, timeId? })` | busca em nome; filtros combinados; ordem alfabética |
| `detalharTime(doc, id)` | `{ time, desenvolvedores[], projetos[] }` (ambos alfabéticos) ou `null` |
| `detalharProjeto(doc, id)` | `{ projeto, time, relatorios[], marcos[], itensCronograma[] }` ordenados (FR-027/028/029) ou `null` |
| `contarAcompanhamento(doc, projetoId)` | `{ relatorios, marcos, itensCronograma }` para a confirmação de exclusão |

Busca/ordem: ver research R7 (sem acentos, sem maiúsculas, alfabético por nome, desempate `seq`).

### Escrita

| Operação | Sucesso | Erros possíveis |
| -------- | ------- | --------------- |
| `criarAdministrador(dados)` / `atualizarAdministrador(id, dados)` | registro | `validacao`, `nao_encontrado`\*, `gravacao` |
| `excluirAdministrador(id)` | `void` | `nao_encontrado`, `gravacao` |
| `criarUsuario` / `atualizarUsuario` / `excluirUsuario` | idem | idem |
| `criarDesenvolvedor` / `atualizarDesenvolvedor` / `excluirDesenvolvedor` | idem | idem (+ `validacao.timeId` se time inexistente) |
| `criarTime` / `atualizarTime` | registro | `validacao`, `nao_encontrado`\*, `gravacao` |
| `excluirTime(id)` | `void` | `vinculos`, `nao_encontrado`, `gravacao` |
| `criarProjeto` / `atualizarProjeto` | registro | `validacao`, `nao_encontrado`\*, `gravacao` |
| `excluirProjeto(id)` | `{ relatorios, marcos, itensCronograma }` removidos | `nao_encontrado`, `gravacao` |
| `criarRelatorio(projetoId, { texto })` | registro | `validacao`, `nao_encontrado`, `gravacao` |
| `criarMarco(projetoId, { descricao })` | registro | idem |
| `criarItemCronograma(projetoId, { atividade, dataPrevista })` | registro | idem |

\* só em `atualizar*`.

Não existem operações de edição ou exclusão de relatório, marco ou item de cronograma (FR-030).

## Dependências injetáveis

`criarRepositorio({ armazenamento, gerarId, agora })` — `gerarId` padrão
`crypto.randomUUID`, `agora` padrão `() => new Date()`. Os testes fornecem versões
determinísticas.
