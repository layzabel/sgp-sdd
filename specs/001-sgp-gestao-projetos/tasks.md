---

description: "Lista de tarefas para implementar o SGP — Sistema Web de Gerenciamento de Projetos de Software"
---

# Tasks: SGP — Sistema Web de Gerenciamento de Projetos de Software

**Input**: Documentos de design em `specs/001-sgp-gestao-projetos/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: OBRIGATÓRIOS. A constituição (Princípio III) exige testes unitários do domínio, E2E
em navegador dos fluxos principais e cobertura ≥ 80% no código novo; o plano define as suítes
Vitest `app` (node), `ui` (jsdom) e Playwright. Em cada história os testes são escritos
**primeiro** e devem **falhar** antes da implementação.

**Organization**: tarefas agrupadas por história de usuário (US1–US6, na ordem de prioridade da
spec), cada uma implementável e testável de forma independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história a que a tarefa pertence (US1…US6)
- Todos os caminhos são relativos à raiz do repositório (`c:\Projeto_TCC_final\sgp-sdd`)

## Convenções que valem para todas as tarefas

- TypeScript `strict` + `noUncheckedIndexedAccess`; proibido `any`; complexidade ciclomática
  ≤ 10 e cognitiva ≤ 15 por função (ESLint já configurado); duplicação ≤ 3%.
- `src/domain/` é puro: sem React, sem DOM, sem `localStorage`. `src/data/` é o único lugar que
  toca armazenamento. `src/app/` e `src/ui/` só usam o repositório e as consultas do domínio.
- Proibido em `src/`: `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`,
  `navigator.sendBeacon`, `next/font/google`, scripts/imagens/fontes externos (FR-037).
- Todos os textos fixos vêm de `src/domain/mensagens.ts` (cópia literal de
  [contracts/mensagens.md](contracts/mensagens.md) e da tabela de mensagens de
  [data-model.md](data-model.md)). Interface em pt-BR; datas `dd/mm/aaaa`.
- Toda página em `src/app/**/page.tsx` (exceto `layout.tsx`) começa com `'use client'`.
- Rotas de detalhe/edição usam `?id=<uuid>` lido com `useSearchParams` dentro de `<Suspense>`
  (research R2).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: instalar Next.js/React e ferramentas de teste e integrá-los à infraestrutura de
qualidade existente.

- [ ] T001 Atualizar `package.json`: adicionar dependências com versão exata — prod: `next` 16.4.6, `react` 19.3.1, `react-dom` 19.3.1; dev: `@types/react` 19.3.0, `@types/react-dom` 19.3.0, `eslint-config-next` 16.4.6, `@playwright/test` 1.65.0, `@axe-core/playwright` 4.14.0, `@testing-library/react` 16.3.3, `@testing-library/user-event` 14.6.9, `jsdom` 31.0.0 — e rodar `npm install` para atualizar `package-lock.json` (nenhuma outra dependência: research "Dependências novas")
- [ ] T002 Criar o lançador multiplataforma `scripts/next/run-next.ts` (define `process.env.NEXT_TELEMETRY_DISABLED = '1'` e executa `next` com os argumentos recebidos via `child_process.spawn`, repassando o código de saída; funciona em PowerShell e Linux) e adicionar em `package.json` os scripts `dev` (`node scripts/next/run-next.ts dev`), `build` (`node scripts/next/run-next.ts build`), `start:estatico` (`node tests/e2e/servidor-estatico.ts`) e `test:e2e` (`playwright test`)
- [ ] T003 [P] Criar `next.config.ts` com `output: 'export'`, `trailingSlash: true`, `images: { unoptimized: true }` e nenhuma outra opção (research R1)
- [ ] T004 [P] Atualizar `tsconfig.json`: `jsx: "preserve"`, `lib: ["dom", "dom.iterable", "esnext"]`, `plugins: [{ "name": "next" }]`, `include` com `next-env.d.ts`, `src/**/*.ts`, `src/**/*.tsx`, `tests/**/*.ts`, `tests/**/*.tsx`, `.next/types/**/*.ts`, `vitest.config.mts`, `playwright.config.ts`, e `exclude` com `node_modules`, `scripts`, `tests/fixtures/**`, `out`, `.next`; manter `strict` e `noUncheckedIndexedAccess`; acrescentar `erasableSyntaxOnly: true`, porque `tests/e2e/servidor-estatico.ts` é executado diretamente pelo `node` (remoção de tipos) e sintaxe exclusiva de TypeScript (`enum`, `namespace`, propriedades de parâmetro) passaria no `tsc` mas falharia em tempo de execução (research R12)
- [ ] T005 [P] Atualizar `.gitignore` e `.prettierignore` acrescentando `.next/`, `out/`, `next-env.d.ts`, `playwright-report/`, `test-results/`
- [ ] T006 Atualizar `eslint.config.mjs`: incluir as configurações flat de `eslint-config-next/core-web-vitals` e `eslint-config-next/typescript` (sem registrar o plugin `@typescript-eslint` duas vezes), acrescentar aos `ignores` `.next/**`, `out/**`, `next-env.d.ts`, `playwright-report/**`, `test-results/**`, e adicionar bloco `files: ['src/**/*.{ts,tsx}']` com `no-restricted-globals` (`fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`), `no-restricted-syntax` (`MemberExpression[object.name='navigator'][property.name='sendBeacon']`) e `no-restricted-imports` (`next/font/google`), cada um com mensagem citando FR-037; manter `complexity: 10`, `sonarjs/cognitive-complexity: 15` e `no-explicit-any` e garantir que `tests/unit/scripts/complexity-rules.test.ts` continue passando (depende de T001)
- [ ] T007 [P] Atualizar `vitest.config.mts`: adicionar projeto `ui` (`environment: 'jsdom'`, `include: ['tests/unit/ui/**/*.test.tsx']`, `setupFiles: ['tests/unit/ui/setup.ts']`), definir `esbuild: { jsx: 'automatic' }`, manter os projetos `app` e `scripts` e a cobertura em `src/**` e `scripts/**` com saída `lcov` em `coverage/`
- [ ] T008 [P] Criar `tests/unit/ui/setup.ts`: `afterEach(cleanup)` do Testing Library; dublê de `next/navigation` (`useRouter` com `push`/`replace` espionáveis, `usePathname` e `useSearchParams` controláveis por uma função auxiliar exportada `definirRota(caminho, params)`); polyfill de `HTMLDialogElement.prototype.showModal`/`close` caso o jsdom não os implemente (research R14)
- [ ] T009 [P] Criar `tests/e2e/servidor-estatico.ts`: servidor Node `http` + `fs` que serve somente arquivos de `out/` em `localhost:4173`, aceita só GET/HEAD (405 para o resto), resolve `/x/` → `out/x/index.html`, impede `..` no caminho, define `Content-Type` por extensão (html, js, css, json, svg, ico, txt, woff2) e responde 404 para o resto; sem dependências (research R13)
- [ ] T010 [P] Criar `playwright.config.ts`: `testDir: 'tests/e2e'`, `webServer` com `command: 'node tests/e2e/servidor-estatico.ts'`, `url: 'http://localhost:4173'`, `reuseExistingServer: !process.env.CI`; `use.baseURL` = `http://localhost:4173`, viewport 1280×800, `trace: 'retain-on-failure'`; projetos `chromium`, `firefox` e `msedge` (`channel: 'msedge'`), este último incluído somente se o executável do Edge existir nos caminhos padrão do sistema operacional; quando o Edge não for encontrado, o arquivo de configuração DEVE escrever no console um aviso explícito ("Projeto msedge omitido: Microsoft Edge não encontrado. Justificativa: plan.md, Riscos — Chromium cobre o mesmo motor.") para que a omissão nunca seja silenciosa (Princípios I e III); `reporter` `list` + `html` em `playwright-report/`
**Checkpoint**: `npm run typecheck`, `npm run lint` e `npx vitest run --project scripts` passam.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: domínio comum, repositório com gravação atômica, componentes genéricos de
interface, layout e apoio aos testes E2E — tudo o que todas as histórias usam.

**⚠️ CRITICAL**: nenhuma história pode começar antes do fim desta fase.

### Testes da fundação (escrever primeiro; devem falhar)

- [ ] T012 [P] Testes de `src/domain/texto.ts` em `tests/unit/app/domain/texto.test.ts`: `aparar` remove espaços das pontas e só-espaços vira `''`; `normalizar('Ação')` = `'acao'`; `contem` casa trecho em qualquer posição sem acento/caixa e termo vazio casa tudo; `compararPorNome` ordena "álvaro", "Bruno", "andré" como "álvaro", "andré", "Bruno" e desempata por `seq` crescente; `chaveUnicidade('  Ana@Empresa.com ')` = `'ana@empresa.com'`
- [ ] T013 [P] Testes de `src/domain/datas.ts` em `tests/unit/app/domain/datas.test.ts`: `dataValida` aceita `2026-03-10` e `2024-02-29`, rejeita `2026-02-29`, `2026-13-01`, `2026-3-1`, `''` e texto livre; `formatarData('2026-03-10')` = `'10/03/2026'`; `formatarDataDeMomento(iso)` devolve a data **local** `dd/mm/aaaa` do instante ISO
- [ ] T014 [P] Testes de `src/domain/email.ts` em `tests/unit/app/domain/email.test.ts` (FR-006): válidos `ana@empresa.com`, `a.b@x.com.br`; inválidos `ana@empresa`, `@empresa.com`, `ana@.com`, `ana@empresa.`, `ana@@empresa.com`, `ana @empresa.com`, `ana@emp resa.com`, `''`
- [ ] T015 [P] Testes de `src/domain/validacao.ts` em `tests/unit/app/domain/validacao.test.ts` com um descritor de exemplo: obrigatório vazio/só espaços → "Informe {rótulo}."; acima do limite → "{Rótulo} deve ter no máximo {N} caracteres." (limite contado após `trim`, exatamente N aceito); e-mail inválido → "Informe um e-mail válido, como nome@empresa.com."; enum fora da lista ou vazio → "Selecione {rótulo}."; data inválida → "Informe uma data válida."; opcional vazio é devolvido como `''`; valores devolvidos já aparados
- [ ] T016 [P] Testes de `src/data/documento.ts` em `tests/unit/app/data/documento.test.ts`: `null` → documento vazio (`versao: 1`, `seq: 0`, oito coleções vazias); JSON válido `versao: 1` → `{ estado: 'ok', documento }`; JSON inválido, `versao` diferente de 1 ou coleção ausente/não-array → `{ estado: 'corrompido' }`
- [ ] T017 [P] Testes da base do repositório em `tests/unit/app/data/repositorio-base.test.ts` usando `ArmazenamentoEmMemoria`: chave ausente → nada gravado até a primeira operação; `getSnapshot()` mantém a mesma referência até gravar; `subscribe` notifica só após gravação bem-sucedida e devolve função de cancelamento; falha em `setItem` → `{ ok: false, erro: { tipo: 'gravacao' } }`, snapshot e valor armazenado idênticos aos anteriores e ninguém notificado; valor ilegível → `estado: 'corrompido'`, nenhuma escrita tentada e o valor original preservado; `getItem` que lança → `estado: 'indisponivel'`; cada gravação faz exatamente um `setItem` na chave `sgp:dados`; nenhuma operação lança exceção
- [ ] T018 [P] Testes de componente em `tests/unit/ui/Formulario.test.tsx`: rótulo `<label>` em todo campo, " *" nos obrigatórios e legenda "* campo obrigatório"; `noValidate`; selects começam em "Selecione…"; ao receber erros mostra a mensagem sob o campo com `aria-invalid="true"` e `aria-describedby`, foca o primeiro campo inválido e anuncia "Corrija os campos destacados." em `role="alert"`; erro de gravação mantém os valores digitados; "Cancelar" chama a navegação de volta sem confirmação
- [ ] T019 [P] Testes de componente em `tests/unit/ui/Lista.test.tsx`: busca filtra a cada digitação; contagem "{n} registro(s) encontrado(s)" em `role="status"`; estado vazio sem registros "Nenhum {entidade} cadastrado." com link "Novo …"; estado sem resultado "Nenhum registro atende à busca e aos filtros." com botão "Limpar busca e filtros" que zera busca e filtros; filtros `<select>` com opção "Todos"; nome é link para `…/detalhes?id=`
- [ ] T020 [P] Testes de componente em `tests/unit/ui/DialogoConfirmacao.test.tsx`: abre com `showModal`, foco inicial em "Cancelar", `Esc` e "Cancelar" chamam `aoCancelar` sem chamar `aoConfirmar`, "Excluir" chama `aoConfirmar`, foco volta ao elemento de origem ao fechar
- [ ] T021 [P] Testes de componente em `tests/unit/ui/Mensagens.test.tsx` e `tests/unit/ui/MenuPrincipal.test.tsx`: sucesso em `role="status"`, erro em `role="alert"`, botão "Fechar mensagem" remove a mensagem, mensagem publicada antes de uma navegação continua visível na tela de destino e some na navegação seguinte; menu com links na ordem Projetos, Times, Desenvolvedores, Usuários, Administradores e `aria-current="page"` no link da seção atual (inclusive em `/projetos/detalhes`)

### Implementação da fundação — domínio

- [ ] T022 [P] Criar `src/domain/tipos.ts` com os tipos de [data-model.md](data-model.md) e [contracts/repositorio.md](contracts/repositorio.md): `Nivel = 'junior' | 'pleno' | 'senior'`; `Situacao = 'planejado' | 'em_andamento' | 'concluido' | 'cancelado'`; `Administrador`, `Usuario`, `Desenvolvedor`, `Time`, `Projeto`, `Relatorio` (`projetoId`, `texto`, `criadoEm` ISO), `Marco` (`projetoId`, `descricao`), `ItemCronograma` (`projetoId`, `atividade`, `dataPrevista`), todos com `id: string` e `seq: number`; `Documento` (`versao: 1`, `seq`, oito coleções `readonly`); tipos de entrada `Dados*` (campos editáveis, sem `id`/`seq`/`criadoEm`/`projetoId`); `ErrosCampo = Partial<Record<string, string>>`; `Resultado<T>` com as variantes `validacao`, `vinculos` (`desenvolvedores`, `projetos`), `nao_encontrado`, `gravacao`
- [ ] T023 [P] Criar `src/domain/texto.ts`: `aparar`, `normalizar(t) = t.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR')`, `contem(campo, termo)` (termo vazio após trim não filtra), `compararPorNome` com um único `new Intl.Collator('pt-BR', { sensitivity: 'base' })` reutilizado e desempate por `seq`, `chaveUnicidade(v) = v.trim().toLocaleLowerCase('pt-BR')` (research R7) — faz T012 passar
- [ ] T024 [P] Criar `src/domain/datas.ts`: `dataValida` para `AAAA-MM-DD` com verificação de calendário (ano bissexto) sem usar `Date` para datas sem hora; `formatarData` → `dd/mm/aaaa` por manipulação de texto; `formatarDataDeMomento(iso)` → data local `dd/mm/aaaa` (research R8) — faz T013 passar
- [ ] T025 [P] Criar `src/domain/email.ts` com `emailValido` sem expressão regular de retrocesso: nenhum espaço no valor, exatamente um `@`, parte local não vazia, domínio com ao menos um `.` que não seja o primeiro nem o último caractere (FR-006, research R6) — faz T014 passar
- [ ] T026 [P] Criar `src/domain/mensagens.ts` com todos os textos literais de [contracts/mensagens.md](contracts/mensagens.md) (sucesso, erro, rótulos de enumeração `Júnior`/`Pleno`/`Sênior` e `Planejado`/`Em andamento`/`Concluído`/`Cancelado`, "Não informado") e as funções de mensagem de validação de [data-model.md](data-model.md#validação-mensagens-por-regra): `obrigatorio(rotuloComArtigo)` → "Informe {rótulo}.", `tamanho(rotulo, n)` → "{Rótulo} deve ter no máximo {N} caracteres.", `EMAIL_INVALIDO`, `emailRepetido('administrador'|'usuário'|'desenvolvedor')` → "Este e-mail já está em uso por outro {…}.", `NOME_TIME_REPETIDO` "Já existe um time com esse nome. Escolha outro nome.", `selecione(rotulo)` → "Selecione {rótulo}.", `TIME_INEXISTENTE` "Selecione um time cadastrado.", `DATA_INVALIDA` "Informe uma data válida.", `TERMINO_ANTES_INICIO` "A data de término prevista não pode ser anterior à data de início.", e `sucesso('cadastrado'|'atualizado'|'excluído', entidade)`, `timeComVinculos(nome, d, p)`, `confirmarExclusao(entidade, nome)`, `confirmarExclusaoProjeto(r, m, c)`
- [ ] T027 Criar `src/domain/validacao.ts`: tipo `CampoDescritor` (`campo`, `rotulo`, `rotuloComArtigo`, `obrigatorio`, `max?`, `tipo: 'texto' | 'email' | 'enum' | 'data' | 'referencia'`, `opcoes?`) e `validarCampos(descritores, entrada)` → `{ valores, erros }` aplicando, nesta ordem, `trim` (FR-005), obrigatório, tamanho após `trim` (FR-040), formato de e-mail (FR-006), enumeração e data; regras entre campos ficam nos módulos `regras/` (depende de T022–T026) — faz T015 passar

### Implementação da fundação — dados

- [ ] T028 [P] Criar `src/data/armazenamento.ts`: `interface Armazenamento { getItem(chave): string | null; setItem(chave, valor): void }`, `criarArmazenamentoNavegador()` sobre `window.localStorage` (acesso protegido por `try/catch`) e `class ArmazenamentoEmMemoria` (construtor aceita valor inicial; métodos `falharProximaGravacao(erro?)` e `falharLeitura()`; conta chamadas de `setItem`)
- [ ] T029 [P] Criar `src/data/documento.ts`: `CHAVE = 'sgp:dados'`, `documentoVazio()` (`versao: 1`, `seq: 0`, coleções vazias) e `lerDocumento(texto: string | null)` → `{ estado: 'ok'; documento } | { estado: 'corrompido' }` validando JSON, `versao === 1`, `seq` numérico e as oito coleções como arrays — faz T016 passar
- [ ] T030 Criar `src/data/repositorio.ts` (base): `criarRepositorio({ armazenamento, gerarId = () => crypto.randomUUID(), agora = () => new Date() })` com `estado: 'ok' | 'corrompido' | 'indisponivel'`, `subscribe`, `getSnapshot`, função interna `gravar(novoDocumento)` que serializa e chama `setItem` **uma única vez** dentro de `try/catch`, troca o snapshot e notifica só em sucesso e devolve `{ tipo: 'gravacao' }` em falha; em `corrompido`/`indisponivel` toda escrita devolve `gravacao` sem chamar `setItem`; e auxiliares genéricos reutilizáveis por todos os cadastros — `novoRegistro(colecao, valores)` (atribui `id` e `seq = documento.seq + 1`), `substituirRegistro`, `removerRegistro`, `verificarUnicidade(colecao, campo, valor, idIgnorado)` via `chaveUnicidade` (FR-007) — para evitar duplicação entre entidades (depende de T022, T027–T029) — faz T017 passar

### Implementação da fundação — interface

- [ ] T031 Criar `src/ui/RepositorioProvider.tsx` (`'use client'`): contexto com o repositório (prop opcional `repositorio` para testes; padrão = instância única criada sob demanda no navegador com `criarArmazenamentoNavegador()`), hooks `useRepositorio()` e `useDocumento()` via `useSyncExternalStore(subscribe, getSnapshot, () => null)` (research R4/R5), e `useEstadoArmazenamento()`
- [ ] T032 [P] Criar `src/ui/Mensagens.tsx` (`'use client'`): provedor + hook `useMensagens()` com `sucesso(texto)`, `erro(texto)` e `limpar()`; região renderizada com `role="status"` (sucesso) ou `role="alert"` (erro) e botão "Fechar mensagem"; a mensagem publicada antes de navegar sobrevive a uma troca de `usePathname()`/busca e é limpa na seguinte (contracts/rotas-e-telas.md "Mensagens de operação") — faz a parte de mensagens de T021 passar
- [ ] T033 [P] Criar `src/ui/MenuPrincipal.tsx` e `src/ui/MenuPrincipal.module.css`: `<nav aria-label="Menu principal">` com links na ordem Projetos, Times, Desenvolvedores, Usuários, Administradores, `aria-current="page"` quando `usePathname()` começa com o caminho da seção; menu lateral a partir de 768 px e barra no topo com links que quebram linha abaixo disso (FR-031) — faz a parte de menu de T021 passar
- [ ] T034 [P] Criar `src/ui/DialogoConfirmacao.tsx` e `src/ui/DialogoConfirmacao.module.css`: `<dialog>` nativo aberto com `showModal()`, `aria-labelledby` para o título, texto, botões "Excluir" e "Cancelar", foco inicial em "Cancelar", evento `cancel` (`Esc`) = cancelar, foco devolvido ao elemento que abriu (research R10) — faz T020 passar
- [ ] T035 [P] Criar `src/ui/Formulario.tsx` e `src/ui/Formulario.module.css`: formulário genérico dirigido por `CampoDescritor[]` (+ `controle: 'texto' | 'textarea' | 'email' | 'tel' | 'select' | 'date'` e `opcoes` para selects), `<form noValidate>`, legenda "* campo obrigatório", " *" nos obrigatórios, sem `maxLength`, selects iniciando em "Selecione…", props `valoresIniciais`, `aoSalvar(valores) => Resultado`, `aoCancelar`; trata `validacao` (erros sob campos, `aria-invalid`, `aria-describedby`, foco no primeiro inválido, resumo "Corrija os campos destacados." em `role="alert"`) e `gravacao` (mensagem de falha de gravação em `role="alert"`, valores mantidos — FR-039); funções internas pequenas para respeitar complexidade ≤ 10 — faz T018 passar
- [ ] T036 [P] Criar `src/ui/Lista.tsx` e `src/ui/Lista.module.css`: lista genérica com props `titulo`, `entidade`, `linkNovo`, `rotuloBusca`, `filtros` (cada um `{ rotulo, opcoes }` com "Todos"), `colunas`, `itens` e `hrefDetalhes`; estado de busca/filtros local; contagem "{n} registro(s) encontrado(s)" em `role="status"`; estados vazios do contrato; `<table>` com `<caption>`/`<th scope>` e, abaixo de 640 px, exibição em cartões com os mesmos dados e ordem; sem paginação (FR-008) — faz T019 passar
- [ ] T037 [P] Criar `src/ui/Detalhes.tsx` e `src/ui/Detalhes.module.css`: lista de definição com todos os campos rotulados, opcional vazio exibido como "Não informado", link "Editar" e botão "Excluir" que dispara um callback; e `src/ui/NaoEncontrado.tsx` com "Registro não encontrado." e link "Voltar para {lista}"
- [ ] T038 [P] Criar `src/ui/Pagina.tsx`: componente de tela que define `document.title`, renderiza o `<h1>` e, logo abaixo, a região de `Mensagens`; mostra "Carregando…" enquanto `useDocumento()` é `null`; quando `estado` é `corrompido` mostra o texto "Dados ilegíveis" e quando é `indisponivel` o texto "Armazenamento indisponível" de [contracts/mensagens.md](contracts/mensagens.md) em `role="alert"`
- [ ] T039 [P] Criar `src/ui/ComIdDaUrl.tsx`: lê `id` de `useSearchParams()` dentro de `<Suspense fallback="Carregando…">` e entrega ao filho (research R2)
- [ ] T040 [P] Criar `src/ui/SemTimes.tsx`: recebe `'desenvolvedores' | 'projetos'`, exibe "É preciso cadastrar um time antes de cadastrar {desenvolvedores|projetos}." e link "Cadastrar time" para `/times/novo`
- [ ] T041 Criar `src/app/globals.css` (fonte do sistema, variáveis de cor com contraste AA, `:focus-visible` com contorno de 3 px, estilo do link "Pular para o conteúdo" visível ao receber foco, layout de duas colunas ≥ 768 px, sem rolagem horizontal a partir de 360 px) e `src/app/layout.tsx` (`<html lang="pt-BR">`, `metadata` com título padrão "SGP", primeiro elemento focável "Pular para o conteúdo" → `#conteudo`, `MenuPrincipal`, `<main id="conteudo" tabIndex={-1}>`, provedores `RepositorioProvider` e `Mensagens`; nenhum recurso externo) (depende de T031–T033)
- [ ] T042 Criar `src/app/page.tsx` (`'use client'`): título "SGP — Início" via `Pagina` e atalhos para os cinco cadastros na ordem do menu (depende de T038, T041)

### Apoio aos testes E2E

- [ ] T043 [P] Criar `tests/e2e/apoio/dados.ts`: `limparDados(page)`, `semearDocumento(page, documentoParcial)` (grava em `sgp:dados` um documento `versao: 1` completo antes do carregamento via `page.addInitScript`, preenchendo coleções ausentes e `seq`), fábricas `umTime`, `umProjeto`, `umDesenvolvedor` etc. com `id` e `seq` determinísticos, e `lerDocumento(page)`
- [ ] T044 [P] Criar `tests/e2e/apoio/axe.ts`: `verificarAcessibilidade(page)` com `AxeBuilder` e tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, falhando com a lista de violações
- [ ] T045 Criar `tests/e2e/inicio.spec.ts`: a tela inicial carrega, o menu tem os cinco links na ordem do contrato, "Pular para o conteúdo" é o primeiro elemento focável e leva o foco ao `<main>`, sem violações axe (depende de T041–T044)

### Extensão do `verify`

- [ ] T011 Estender `npm run verify` para 5 etapas em `scripts/verify/stages.ts`: tipo `Stage.name` passa a `'tipos' | 'padroes' | 'testes' | 'build' | 'e2e'` e `code` a `1 | 2 | 3 | 4 | 5`; etapa `build` (código 4: `npm run build`) e `e2e` (código 5: `npx playwright test`); atualizar juntos `tests/unit/scripts/verify.test.ts` (hoje espera 3 etapas; passa a esperar 5 e `VERIFY OK: 5/5 etapas`) e `docs/infraestrutura/cli.md` (research R12; plan "Re-verificação pós-design" item b). Executada no fim da Fundação porque `next build` exige `src/app` (T041) e `playwright test` falha sem nenhuma spec (T045) (depende de T041–T045)

**Checkpoint**: `npm run verify` passa (tipos, padrões, testes, build, e2e); as histórias podem
começar.

---

## Phase 3: User Story 1 - Gerenciar times (Priority: P1) 🎯 MVP

**Goal**: cadastrar, buscar, ver detalhes (com desenvolvedores e projetos do time), editar e
excluir times sem vínculos, com persistência no navegador.

**Independent Test**: com a aplicação vazia, cadastrar, buscar, editar e excluir um time;
fechar e reabrir a aplicação e confirmar que os dados persistiram (cenários 1–8 da US1).

### Testes da US1 (escrever primeiro; devem falhar)

- [ ] T046 [P] [US1] Testes das regras de time em `tests/unit/app/domain/regras-time.test.ts`: `nome` obrigatório ("Informe o nome.") e "L100, único entre times (sem diferenciar maiúsculas/minúsculas)" — 100 caracteres aceito, 101 rejeitado com "Nome deve ter no máximo 100 caracteres."; `descricao` opcional "L1000"; `area` opcional "L100 (rótulo "Área de atuação")"; só espaços = vazio
- [ ] T047 [P] [US1] Testes das consultas de time em `tests/unit/app/domain/consultas-times.test.ts`: `listarTimes(doc, { busca })` busca em nome sem acento/caixa ("plat" acha "Plataforma"), ordem alfabética com desempate por `seq`; `detalharTime(doc, id)` devolve `{ time, desenvolvedores, projetos }` ambos alfabéticos e só do time, ou `null` se inexistente
- [ ] T048 [P] [US1] Testes de repositório em `tests/unit/app/data/repositorio-times.test.ts`: `criarTime` apara e grava; "Plataforma" e " plataforma " → `validacao.nome` "Já existe um time com esse nome. Escolha outro nome."; `atualizarTime` mantendo o próprio nome não é duplicidade; `atualizarTime`/`excluirTime` com id inexistente → `nao_encontrado`; `excluirTime` de time com 2 desenvolvedores e 1 projeto (documento semeado) → `{ tipo: 'vinculos', desenvolvedores: 2, projetos: 1 }` sem gravar; sem vínculos → removido; falha de gravação → documento inalterado
- [ ] T049 [P] [US1] Testes de componente das telas de times em `tests/unit/ui/times.test.tsx` (repositório em memória + dublê de navegação): cadastro válido navega para `/times/detalhes?id=` e publica "Time cadastrado com sucesso."; nome duplicado mostra erro no campo; detalhes mostram "Desenvolvedores do time" e "Projetos do time"; exclusão com vínculos não abre o diálogo e mostra "Não é possível excluir o time \"{nome}\": ele possui {d} desenvolvedor(es) e {p} projeto(s) vinculados. Transfira ou exclua esses registros antes."; id inexistente mostra "Registro não encontrado."
- [ ] T050 [P] [US1] Teste E2E em `tests/e2e/us1-times.spec.ts` cobrindo os cenários de aceitação 1–8 da US1 (cadastro com mensagem de sucesso, duplicidade "plataforma", nome só com espaços, busca "plat", detalhes com 2 desenvolvedores e 1 projeto semeados, bloqueio de exclusão com contagens, exclusão confirmada e cancelada, persistência após `page.reload()` e nova página no mesmo contexto) e verificação axe em lista, novo, detalhes e editar

### Implementação da US1

- [ ] T051 [P] [US1] Criar `src/domain/regras/time.ts`: descritores — `nome` (rótulo "Nome", obrigatório, max 100), `descricao` (rótulo "Descrição", opcional, max 1000, controle `textarea`), `area` (rótulo "Área de atuação", opcional, max 100); função `validarTime(entrada)` usando `validarCampos` — faz T046 passar
- [ ] T052 [US1] Criar `src/domain/consultas.ts` com `listarTimes(doc, { busca })` e `detalharTime(doc, id)` usando `contem` e `compararPorNome` (FR-008, FR-019) — faz T047 passar
- [ ] T053 [US1] Adicionar a `src/data/repositorio.ts` as operações `criarTime(dados)`, `atualizarTime(id, dados)` (unicidade de nome via `verificarUnicidade`, ignorando o próprio id) e `excluirTime(id)` (bloqueio por vínculos com contagem de `desenvolvedores` e `projetos` com o `timeId`, FR-020), cada uma com uma única gravação (depende de T051) — faz T048 passar
- [ ] T054 [P] [US1] Criar `src/app/times/page.tsx`: `Pagina` "Times" + `Lista` com link "Novo time", busca rotulada "Buscar por nome", colunas Nome e Área de atuação, itens de `listarTimes`
- [ ] T055 [P] [US1] Criar `src/app/times/novo/page.tsx`: `Pagina` "Novo time" + `Formulario` com os descritores de time; sucesso → `router.push('/times/detalhes/?id=…')` e "Time cadastrado com sucesso."; "Cancelar" → `/times`
- [ ] T056 [P] [US1] Criar `src/app/times/detalhes/page.tsx`: via `ComIdDaUrl`, título "Time: {nome}", `Detalhes` (Nome, Descrição, Área de atuação), seções "Desenvolvedores do time" e "Projetos do time" com links (alfabéticas, mensagem quando vazias); "Excluir" → se `excluirTime` puder bloquear (contagem > 0) mostra a mensagem de vínculos em `role="alert"` sem abrir o diálogo, senão abre `DialogoConfirmacao` com "Excluir time \"{nome}\"? Esta ação não pode ser desfeita."; após excluir → `/times` com "Time excluído com sucesso."; inexistente → `NaoEncontrado` com "Voltar para Times"
- [ ] T057 [P] [US1] Criar `src/app/times/editar/page.tsx`: via `ComIdDaUrl`, título "Editar time", `Formulario` com valores atuais; sucesso → detalhes com "Time atualizado com sucesso."; "Cancelar" → detalhes; inexistente → `NaoEncontrado` (faz T049 e T050 passarem)

**Checkpoint**: US1 completa e testável sozinha (`npx vitest run` + `npx playwright test us1`).

---

## Phase 4: User Story 2 - Gerenciar projetos (Priority: P1)

**Goal**: cadastrar, buscar e filtrar (situação, time), ver detalhes, editar e excluir projetos
(com exclusão em cascata do acompanhamento).

**Independent Test**: com um time cadastrado (semeado), cadastrar, consultar com busca e filtros,
editar e excluir um projeto (cenários 1–8 da US2).

### Testes da US2 (escrever primeiro; devem falhar)

- [ ] T058 [P] [US2] Testes das regras de projeto em `tests/unit/app/domain/regras-projeto.test.ts`: `nome` obrigatório "L100 (não único — spec não exige)"; `descricao` opcional "L1000"; `inicio` obrigatório, "data válida"; `terminoPrevisto` opcional, "data válida; se informada, `>= inicio` (FR-022)" — 09/03 com início 10/03 rejeitado com "A data de término prevista não pode ser anterior à data de início." no campo `terminoPrevisto`, igual ou vazio aceito; `situacao` obrigatória entre `'planejado' | 'em_andamento' | 'concluido' | 'cancelado'` ("Selecione a situação."); `timeId` obrigatório; todos os obrigatórios vazios indicados ao mesmo tempo
- [ ] T059 [P] [US2] Testes das consultas de projeto em `tests/unit/app/domain/consultas-projetos.test.ts`: `listarProjetos(doc, { busca, situacao, timeId })` combina os três critérios, ordem alfabética; `detalharProjeto(doc, id)` devolve `{ projeto, time, relatorios, marcos, itensCronograma }` ou `null`; `contarAcompanhamento(doc, projetoId)` conta relatórios, marcos e itens do projeto
- [ ] T060 [P] [US2] Testes de repositório em `tests/unit/app/data/repositorio-projetos.test.ts`: `criarProjeto` com `timeId` inexistente → `validacao.timeId` "Selecione um time cadastrado."; `atualizarProjeto` trocando situação e time; `excluirProjeto` remove o projeto e todos os `relatorios`, `marcos` e `itensCronograma` com o mesmo `projetoId` (preservando os de outros projetos) num único `setItem` e devolve as quantidades removidas; falha de gravação na exclusão → nada removido; inexistente → `nao_encontrado`
- [ ] T061 [P] [US2] Testes de componente das telas de projetos em `tests/unit/ui/projetos.test.tsx`: sem times, `/projetos/novo` mostra `SemTimes` com link "Cadastrar time"; selects de Situação e Time começam em "Selecione…"; erro de término no campo certo; diálogo de exclusão contém "Também serão excluídos {r} relatório(s), {m} marco(s) e {c} item(ns) de cronograma."; após excluir publica "Projeto excluído com sucesso, junto com seus relatórios, marcos e cronograma."
- [ ] T062 [P] [US2] Teste E2E em `tests/e2e/us2-projetos.spec.ts` cobrindo os cenários 1–8 da US2 (time semeado; datas digitadas em `<input type="date">` e exibidas `dd/mm/aaaa`; busca + filtro de situação + filtro de time combinados; troca de time refletida nos detalhes dos dois times; exclusão com acompanhamento semeado e mensagem de confirmação com contagens) e verificação axe nas quatro telas

### Implementação da US2

- [ ] T063 [P] [US2] Criar `src/domain/regras/projeto.ts`: descritores — `nome` ("Nome", obrigatório, max 100), `descricao` ("Descrição", opcional, max 1000, `textarea`), `inicio` ("Data de início", obrigatório, `data`), `terminoPrevisto` ("Data de término prevista", opcional, `data`), `situacao` ("Situação", obrigatório, `enum` com rótulos "Planejado", "Em andamento", "Concluído", "Cancelado"), `timeId` ("Time responsável", obrigatório, `referencia`); `validarProjeto(entrada)` acrescenta a regra `terminoPrevisto >= inicio` por comparação de texto `AAAA-MM-DD` (FR-022) — faz T058 passar
- [ ] T064 [US2] Adicionar a `src/domain/consultas.ts` `listarProjetos`, `detalharProjeto` (acompanhamento ainda sem ordenação específica; ordenado na US3) e `contarAcompanhamento` (FR-024, FR-025) — faz T059 passar
- [ ] T065 [US2] Adicionar a `src/data/repositorio.ts` `criarProjeto`, `atualizarProjeto` (time deve existir, senão `validacao.timeId` = "Selecione um time cadastrado.") e `excluirProjeto` (cascata numa única gravação, devolve `{ relatorios, marcos, itensCronograma }`) (depende de T063) — faz T060 passar
- [ ] T066 [P] [US2] Criar `src/app/projetos/page.tsx`: `Pagina` "Projetos" + `Lista` com "Novo projeto", busca "Buscar por nome", filtros Situação e Time (opção "Todos"), colunas Nome, Situação, Time, Início, Término previsto (datas `dd/mm/aaaa`, término vazio "Não informado")
- [ ] T067 [P] [US2] Criar `src/app/projetos/novo/page.tsx`: `Pagina` "Novo projeto"; sem times → `SemTimes('projetos')`; senão `Formulario` com select de time alimentado pelos times em ordem alfabética; sucesso → detalhes com "Projeto cadastrado com sucesso."
- [ ] T068 [P] [US2] Criar `src/app/projetos/detalhes/page.tsx`: via `ComIdDaUrl`, título "Projeto: {nome}", `Detalhes` (Nome, Descrição, Data de início, Data de término prevista, Situação com rótulo, Time responsável como link para os detalhes do time); "Excluir" abre `DialogoConfirmacao` com o texto padrão + "Também serão excluídos {r} relatório(s), {m} marco(s) e {c} item(ns) de cronograma." (de `contarAcompanhamento`); após excluir → `/projetos` com "Projeto excluído com sucesso, junto com seus relatórios, marcos e cronograma."; inexistente → `NaoEncontrado`; reservar a área onde a US3 inserirá as seções de acompanhamento
- [ ] T069 [P] [US2] Criar `src/app/projetos/editar/page.tsx`: título "Editar projeto", `Formulario` com valores atuais (sem times → `SemTimes`), sucesso → detalhes com "Projeto atualizado com sucesso." (faz T061 e T062 passarem)

**Checkpoint**: US1 + US2 = MVP (times e projetos) funcionando e testado.

---

## Phase 5: User Story 3 - Acompanhar o projeto (relatórios, marcos e cronograma) (Priority: P2)

**Goal**: nos detalhes do projeto, criar relatórios, marcos e itens de cronograma imutáveis e
exibi-los na ordem definida.

**Independent Test**: com um projeto semeado, criar relatórios, marcos e itens de cronograma e
verificar a ordem de exibição e a ausência de editar/excluir (cenários 1–6 da US3).

### Testes da US3 (escrever primeiro; devem falhar)

- [ ] T070 [P] [US3] Testes das regras de acompanhamento em `tests/unit/app/domain/regras-acompanhamento.test.ts`: relatório `texto` obrigatório "L5000" ("Informe o texto do relatório."; 5.000 aceito, 5.001 rejeitado com "… no máximo 5000 caracteres."); marco `descricao` obrigatória "L100"; item `atividade` obrigatória "L100" e `dataPrevista` obrigatória "data válida"
- [ ] T071 [P] [US3] Testes de ordenação em `tests/unit/app/domain/consultas-acompanhamento.test.ts` via `detalharProjeto`: relatórios por `criadoEm` decrescente com desempate por `seq` decrescente (05/03, 10/03, 12/03 → 12/03, 10/03, 05/03; mesmo instante → maior `seq` primeiro); marcos por `seq` crescente ("Kickoff", "Protótipo", "Entrega"); itens por `dataPrevista` crescente com desempate por `seq` crescente (20/04, 05/04, 12/04 → 05/04, 12/04, 20/04); só registros do projeto
- [ ] T072 [P] [US3] Testes de repositório em `tests/unit/app/data/repositorio-acompanhamento.test.ts`: `criarRelatorio(projetoId, { texto })` grava `criadoEm = agora().toISOString()` e `seq` novo; `criarMarco` e `criarItemCronograma` idem; projeto inexistente → `nao_encontrado`; texto inválido → `validacao`; falha de gravação → inalterado; o objeto do repositório não expõe nenhuma operação de editar/excluir relatório, marco ou item (FR-030)
- [ ] T073 [P] [US3] Testes de componente em `tests/unit/ui/acompanhamento.test.tsx`: cada seção ("Relatórios", "Marcos", "Cronograma") tem formulário acima da lista com rótulos "Texto do relatório", "Descrição do marco", "Atividade", "Data prevista" e botões "Adicionar relatório", "Adicionar marco", "Adicionar item"; após sucesso o formulário é limpo e é anunciado "Relatório adicionado com sucesso." / "Marco adicionado com sucesso." / "Item de cronograma adicionado com sucesso."; em erro o texto digitado é mantido; relatório mostra só a data `dd/mm/aaaa` e preserva quebras de linha; marcos em `<ol>`; nenhum botão editar/excluir nos itens
- [ ] T074 [P] [US3] Teste E2E em `tests/e2e/us3-acompanhamento.spec.ts` cobrindo os cenários 1–6 da US3 (relatórios com `criadoEm` semeados em 05/03, 10/03 e 12/03 para verificar a ordem; marcos e itens criados pela interface; campos vazios bloqueados; ausência de editar/excluir) e verificação axe nos detalhes do projeto com as três seções preenchidas

### Implementação da US3

- [ ] T075 [P] [US3] Criar `src/domain/regras/acompanhamento.ts`: descritores e validadores — relatório `texto` ("Texto do relatório", obrigatório, max 5000, `textarea`); marco `descricao` ("Descrição do marco", obrigatória, max 100); item `atividade` ("Atividade", obrigatória, max 100) e `dataPrevista` ("Data prevista", obrigatória, `data`) — faz T070 passar
- [ ] T076 [US3] Atualizar `detalharProjeto` em `src/domain/consultas.ts` para ordenar relatórios (`criadoEm` desc, `seq` desc — FR-027), marcos (`seq` asc — FR-028) e itens (`dataPrevista` asc, `seq` asc — FR-029) — faz T071 passar
- [ ] T077 [US3] Adicionar a `src/data/repositorio.ts` `criarRelatorio(projetoId, { texto })` (com `criadoEm` de `agora()`), `criarMarco(projetoId, { descricao })` e `criarItemCronograma(projetoId, { atividade, dataPrevista })`, cada uma verificando que o projeto existe e com uma única gravação; nenhuma operação de edição/exclusão individual (FR-030) (depende de T075) — faz T072 passar
- [ ] T078 [P] [US3] Criar `src/ui/acompanhamento/FormularioSecao.tsx`: formulário curto reutilizado pelas três seções (usa os descritores, limpa após sucesso, mantém texto em erro, publica a mensagem de sucesso ou de falha de gravação, erros de campo acessíveis como em `Formulario`)
- [ ] T079 [P] [US3] Criar `src/ui/acompanhamento/Relatorios.tsx`, `src/ui/acompanhamento/Marcos.tsx` e `src/ui/acompanhamento/Cronograma.tsx`: cada um com `<section aria-labelledby>` e `<h2>` ("Relatórios", "Marcos", "Cronograma"), `FormularioSecao` acima da lista; relatórios com `formatarDataDeMomento(criadoEm)` e texto com `white-space: pre-wrap`; marcos em `<ol>`; cronograma com `formatarData(dataPrevista)` + atividade; mensagem quando a lista está vazia; sem ações de editar/excluir (depende de T078)
- [ ] T080 [US3] Integrar as três seções em `src/app/projetos/detalhes/page.tsx`, na ordem Relatórios, Marcos, Cronograma, abaixo dos dados do projeto (depende de T068, T079) — faz T073 e T074 passarem

**Checkpoint**: US1, US2 e US3 funcionam de forma independente.

---

## Phase 6: User Story 4 - Gerenciar desenvolvedores (Priority: P2)

**Goal**: cadastrar, buscar e filtrar (time, nível), ver detalhes, editar (inclusive trocando o
time) e excluir desenvolvedores.

**Independent Test**: com um time semeado, cadastrar, consultar com busca e filtros, editar
trocando o time e excluir um desenvolvedor (cenários 1–7 da US4).

### Testes da US4 (escrever primeiro; devem falhar)

- [ ] T081 [P] [US4] Testes das regras de desenvolvedor em `tests/unit/app/domain/regras-desenvolvedor.test.ts`: `nome` obrigatório "L100"; `email` obrigatório "L254, formato" ("ana@empresa" → "Informe um e-mail válido, como nome@empresa.com."); `telefone` opcional "L30"; `cargo` opcional "L100"; `nivel` obrigatório entre `'junior' | 'pleno' | 'senior'` ("Selecione o nível."); `tecnologia` opcional "L100 (rótulo "Principal tecnologia")"; `timeId` obrigatório; todos os obrigatórios vazios indicados juntos
- [ ] T082 [P] [US4] Testes das consultas em `tests/unit/app/domain/consultas-desenvolvedores.test.ts`: `listarDesenvolvedores(doc, { busca, timeId, nivel })` combina os três critérios, busca só em nome, ordem alfabética; `detalharDesenvolvedor(doc, id)` devolve `{ desenvolvedor, time }` ou `null`
- [ ] T083 [P] [US4] Testes de repositório em `tests/unit/app/data/repositorio-desenvolvedores.test.ts`: e-mail "Ana@Empresa.com" com "ana@empresa.com" já cadastrado → `validacao.email` "Este e-mail já está em uso por outro desenvolvedor." (no cadastro e na edição de outro registro); manter o próprio e-mail na edição é aceito; o mesmo e-mail em um administrador não conflita; `timeId` inexistente → "Selecione um time cadastrado."; troca de time; exclusão nunca bloqueada; inexistente → `nao_encontrado`; falha de gravação → inalterado
- [ ] T084 [P] [US4] Testes de componente em `tests/unit/ui/desenvolvedores.test.tsx`: sem times mostra `SemTimes('desenvolvedores')`; selects Nível ("Júnior", "Pleno", "Sênior") e Time começam em "Selecione…"; detalhes exibem o nome do time como link e opcionais vazios como "Não informado"
- [ ] T085 [P] [US4] Teste E2E em `tests/e2e/us4-desenvolvedores.spec.ts` cobrindo os cenários 1–7 da US4 (incluindo o desenvolvedor aparecendo nos detalhes do time, a troca de "Plataforma" para "Mobile" refletida nos dois times e a remoção dos detalhes do time após excluir) e verificação axe nas quatro telas

### Implementação da US4

- [ ] T086 [P] [US4] Criar `src/domain/regras/desenvolvedor.ts`: descritores — `nome` ("Nome", obrigatório, max 100), `email` ("E-mail", obrigatório, max 254, `email`), `telefone` ("Telefone", opcional, max 30, controle `tel`), `cargo` ("Cargo", opcional, max 100), `nivel` ("Nível", obrigatório, `enum` com rótulos "Júnior", "Pleno", "Sênior"), `tecnologia` ("Principal tecnologia", opcional, max 100), `timeId` ("Time", obrigatório, `referencia`); `validarDesenvolvedor` — faz T081 passar
- [ ] T087 [US4] Adicionar a `src/domain/consultas.ts` `listarDesenvolvedores` e `detalharDesenvolvedor` (FR-016) — faz T082 passar
- [ ] T088 [US4] Adicionar a `src/data/repositorio.ts` `criarDesenvolvedor`, `atualizarDesenvolvedor` (unicidade de e-mail entre desenvolvedores via `verificarUnicidade`, time existente) e `excluirDesenvolvedor` (depende de T086) — faz T083 passar
- [ ] T089 [P] [US4] Criar `src/app/desenvolvedores/page.tsx`: `Pagina` "Desenvolvedores" + `Lista` com "Novo desenvolvedor", busca "Buscar por nome", filtros Time e Nível, colunas Nome, E-mail, Nível (rótulo), Time
- [ ] T090 [P] [US4] Criar `src/app/desenvolvedores/novo/page.tsx` ("Novo desenvolvedor"; `SemTimes('desenvolvedores')` sem times; sucesso → detalhes com "Desenvolvedor cadastrado com sucesso.")
- [ ] T091 [P] [US4] Criar `src/app/desenvolvedores/detalhes/page.tsx` ("Desenvolvedor: {nome}"; campos Nome, E-mail, Telefone, Cargo, Nível, Principal tecnologia, Time com link; exclusão com `DialogoConfirmacao` padrão; após excluir → `/desenvolvedores` com "Desenvolvedor excluído com sucesso."; inexistente → `NaoEncontrado`)
- [ ] T092 [P] [US4] Criar `src/app/desenvolvedores/editar/page.tsx` ("Editar desenvolvedor"; permite trocar o time — FR-017; sucesso → detalhes com "Desenvolvedor atualizado com sucesso.") (faz T084 e T085 passarem)

**Checkpoint**: US1–US4 funcionam de forma independente.

---

## Phase 7: User Story 5 - Gerenciar administradores (Priority: P3)

**Goal**: cadastrar, buscar por nome ou e-mail, ver detalhes, editar e excluir administradores.

**Independent Test**: cadastrar, buscar por nome e por e-mail, editar e excluir um administrador
(cenários 1–5 da US5).

### Testes da US5 (escrever primeiro; devem falhar)

- [ ] T093 [P] [US5] Testes das regras de administrador em `tests/unit/app/domain/regras-administrador.test.ts`: os cinco campos obrigatórios — `nome` "L100", `email` "L254, formato, único entre administradores", `telefone` "L30, texto livre", `cargo` "L100", `setor` "L100" — e todos os vazios indicados juntos
- [ ] T094 [P] [US5] Testes das consultas em `tests/unit/app/domain/consultas-administradores.test.ts`: `listarAdministradores(doc, { busca })` busca em nome **ou** e-mail (FR-011), ordem alfabética; `detalharAdministrador`
- [ ] T095 [P] [US5] Testes de repositório em `tests/unit/app/data/repositorio-administradores.test.ts`: e-mail "joao@empresa.com" repetido (sem diferenciar caixa) → "Este e-mail já está em uso por outro administrador."; próprio e-mail na edição aceito; exclusão nunca bloqueada; inexistente → `nao_encontrado`; falha de gravação → inalterado
- [ ] T096 [P] [US5] Teste E2E em `tests/e2e/us5-administradores.spec.ts` cobrindo os cenários 1–5 da US5 (incluindo exclusão cancelada e confirmada) e verificação axe nas quatro telas

### Implementação da US5

- [ ] T097 [P] [US5] Criar `src/domain/regras/administrador.ts`: descritores — `nome` ("Nome", obrigatório, max 100), `email` ("E-mail", obrigatório, max 254, `email`), `telefone` ("Telefone", obrigatório, max 30, `tel`), `cargo` ("Cargo", obrigatório, max 100), `setor` ("Setor", obrigatório, max 100); `validarAdministrador` — faz T093 passar
- [ ] T098 [US5] Adicionar a `src/domain/consultas.ts` `listarAdministradores` e `detalharAdministrador` — faz T094 passar
- [ ] T099 [US5] Adicionar a `src/data/repositorio.ts` `criarAdministrador`, `atualizarAdministrador` (unicidade de e-mail entre administradores) e `excluirAdministrador` (depende de T097) — faz T095 passar
- [ ] T100 [P] [US5] Criar `src/app/administradores/page.tsx` ("Administradores"; "Novo administrador"; busca "Buscar por nome ou e-mail"; colunas Nome, E-mail, Cargo, Setor)
- [ ] T101 [P] [US5] Criar `src/app/administradores/novo/page.tsx` ("Novo administrador"; sucesso → detalhes com "Administrador cadastrado com sucesso.")
- [ ] T102 [P] [US5] Criar `src/app/administradores/detalhes/page.tsx` ("Administrador: {nome}"; os cinco campos; exclusão com diálogo padrão; após excluir → lista com "Administrador excluído com sucesso."; inexistente → `NaoEncontrado`)
- [ ] T103 [P] [US5] Criar `src/app/administradores/editar/page.tsx` ("Editar administrador"; sucesso → detalhes com "Administrador atualizado com sucesso.") (faz T096 passar)

**Checkpoint**: US1–US5 funcionam de forma independente.

---

## Phase 8: User Story 6 - Gerenciar usuários (Priority: P3)

**Goal**: cadastrar, buscar por nome ou organização, ver detalhes, editar e excluir usuários.

**Independent Test**: cadastrar, buscar por nome e por organização, editar e excluir um usuário
(cenários 1–5 da US6).

### Testes da US6 (escrever primeiro; devem falhar)

- [ ] T104 [P] [US6] Testes das regras de usuário em `tests/unit/app/domain/regras-usuario.test.ts`: `nome` obrigatório "L100"; `email` obrigatório "L254, formato, único entre usuários"; `telefone` opcional "L30"; `organizacao` opcional "L100"; nome + e-mail válido com opcionais vazios é aceito
- [ ] T105 [P] [US6] Testes das consultas em `tests/unit/app/domain/consultas-usuarios.test.ts`: `listarUsuarios(doc, { busca })` busca em nome **ou** organização (FR-013), ordem alfabética; `detalharUsuario`
- [ ] T106 [P] [US6] Testes de repositório em `tests/unit/app/data/repositorio-usuarios.test.ts`: "maria@cliente.com" repetido → "Este e-mail já está em uso por outro usuário."; próprio e-mail na edição aceito; mesmo e-mail de um administrador não conflita; exclusão; inexistente → `nao_encontrado`; falha de gravação → inalterado
- [ ] T107 [P] [US6] Teste E2E em `tests/e2e/us6-usuarios.spec.ts` cobrindo os cenários 1–5 da US6 e verificação axe nas quatro telas

### Implementação da US6

- [ ] T108 [P] [US6] Criar `src/domain/regras/usuario.ts`: descritores — `nome` ("Nome", obrigatório, max 100), `email` ("E-mail", obrigatório, max 254, `email`), `telefone` ("Telefone", opcional, max 30, `tel`), `organizacao` ("Organização", opcional, max 100); `validarUsuario` — faz T104 passar
- [ ] T109 [US6] Adicionar a `src/domain/consultas.ts` `listarUsuarios` e `detalharUsuario` — faz T105 passar
- [ ] T110 [US6] Adicionar a `src/data/repositorio.ts` `criarUsuario`, `atualizarUsuario` (unicidade de e-mail entre usuários) e `excluirUsuario` (depende de T108) — faz T106 passar
- [ ] T111 [P] [US6] Criar `src/app/usuarios/page.tsx` ("Usuários"; "Novo usuário"; busca "Buscar por nome ou organização"; colunas Nome, E-mail, Organização)
- [ ] T112 [P] [US6] Criar `src/app/usuarios/novo/page.tsx` ("Novo usuário"; sucesso → detalhes com "Usuário cadastrado com sucesso.")
- [ ] T113 [P] [US6] Criar `src/app/usuarios/detalhes/page.tsx` ("Usuário: {nome}"; Nome, E-mail, Telefone, Organização; exclusão com diálogo padrão; após excluir → lista com "Usuário excluído com sucesso."; inexistente → `NaoEncontrado`)
- [ ] T114 [P] [US6] Criar `src/app/usuarios/editar/page.tsx` ("Editar usuário"; sucesso → detalhes com "Usuário atualizado com sucesso.") (faz T107 passar)

**Checkpoint**: as seis histórias funcionam de forma independente; 21 rotas estáticas geradas.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: critérios transversais (SC-002…SC-007, FR-034/035/037/039), portão de qualidade e
métricas.

- [ ] T115 [P] Teste E2E `tests/e2e/persistencia.spec.ts` (SC-003, FR-038): criar um registro de cada cadastro e um relatório, marco e item pela interface, fechar a página, abrir nova página no mesmo contexto e conferir que todos os dados estão iguais
- [ ] T116 [P] Teste E2E `tests/e2e/privacidade.spec.ts` (SC-004, FR-037): registrar todas as requisições (`page.on('request')`) durante um fluxo completo de cadastro, edição, acompanhamento e exclusão e falhar se alguma tiver origem diferente de `http://localhost:4173` ou método diferente de GET
- [ ] T117 [P] Teste E2E `tests/e2e/teclado.spec.ts` (SC-007, FR-035): cadastrar time, cadastrar projeto, adicionar relatório/marco/item, cadastrar desenvolvedor escolhendo Nível e Time nos `<select>` pelo teclado, cadastrar administrador e usuário, e excluir com o diálogo usando só `Tab`, `Shift+Tab`, `Enter`, `Espaço` e `Esc`; verificar foco visível (estilo de contorno calculado) e que o foco volta ao botão "Excluir" ao cancelar
- [ ] T118 [P] Teste E2E `tests/e2e/responsivo.spec.ts` (SC-007, FR-034): viewport 360×740, visitar as 21 rotas com dados semeados e verificar `document.documentElement.scrollWidth <= clientWidth`, listas exibidas como cartões abaixo de 640 px e menu no topo abaixo de 768 px
- [ ] T119 [P] Teste E2E `tests/e2e/falha-gravacao.spec.ts` (FR-039): `page.addInitScript` faz `Storage.prototype.setItem` lançar `QuotaExceededError`; ao salvar um formulário aparece a mensagem de falha de gravação, o formulário permanece preenchido e os dados semeados continuam intactos; na exclusão aparece "Não foi possível excluir: o armazenamento do navegador está cheio ou indisponível. Nada foi alterado."; com `sgp:dados` ilegível aparece a mensagem de dados ilegíveis e o valor não é sobrescrito
- [ ] T120 [P] Teste E2E `tests/e2e/acessibilidade.spec.ts` (WCAG 2.1 AA): com dados semeados, rodar `verificarAcessibilidade` em todas as 21 rotas, nos estados vazios, num formulário com erros exibidos e com o diálogo de exclusão aberto
- [ ] T121 [P] Teste E2E `tests/e2e/desempenho.spec.ts` (SC-006): semear 500 projetos e 500 desenvolvedores, digitar na busca e trocar filtros, medindo do evento até a contagem atualizada em `role="status"`; falhar acima de 1.000 ms
- [ ] T122 [P] Teste E2E `tests/e2e/navegacao.spec.ts` (SC-002): a partir do menu, chegar à lista e ao "Novo" de cada cadastro em ≤ 2 interações e aos detalhes de um projeto em ≤ 3; registro inexistente em `/projetos/detalhes/?id=inexistente` mostra "Registro não encontrado." e "Voltar para Projetos"
- [ ] T123 Revisar complexidade e duplicação: `npm run lint` sem avisos e, se algum componente ou função ultrapassar complexidade ciclomática 10 ou cognitiva 15, extrair funções; eliminar trechos repetidos entre as páginas dos cinco cadastros (ex.: extrair fábrica de páginas comum em `src/ui/`) mantendo duplicação ≤ 3%
- [ ] T124 Conferir cobertura ≥ 80% de linhas em `src/**` em `coverage/` após `npm run test`; acrescentar testes de componente em `tests/unit/ui/` para os trechos sem cobertura
- [ ] T125 Executar `npm run verify` e confirmar `VERIFY OK: 5/5 etapas` (tipos, padroes, testes, build, e2e); corrigir o que falhar
- [ ] T126 Executar o roteiro manual de [quickstart.md](quickstart.md) (cenários 1–15) e registrar divergências como novas tarefas
- [ ] T127 Com o SonarQube no ar (`npm run sonar:up`), executar `npm run sonar -- --etapa implement`, confirmar o Quality Gate `TCC` aprovado no escopo `app` e as linhas gravadas em `specs/001-sgp-gestao-projetos/metricas-ia.md`; o registro da etapa de IA (`npm run metrics:ia`) é feito em sessão de registro separada (Princípio VI)
- [ ] T128 Verificar que `specs/001-sgp-gestao-projetos/metricas-ia.md` tem uma linha por etapa do Spec Kit (constitution, specify, clarify, plan, tasks, analyze, implement e cada `correcao-N`, ou linhas agregadas que identificam explicitamente as etapas incluídas) com o snapshot SonarQube de `implement`, rodando `npm run metrics:check`; em seguida executar `npm run metrics:consolidar` e confirmar que `docs/metricas/consolidado.md` foi gerado/atualizado (Princípio VI; depende de T127 e da sessão de registro)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup — **bloqueia todas as histórias**.
- **US1 (Phase 3)** e **US2 (Phase 4)**: dependem só da Fundação. Os testes de US2 semeiam o
  time diretamente no documento; as páginas de projeto não dependem das páginas de time (o link
  "Cadastrar time" só aponta para a rota).
- **US3 (Phase 5)**: depende de US2 (estende `detalharProjeto` e a página
  `src/app/projetos/detalhes/page.tsx`).
- **US4, US5, US6 (Phases 6–8)**: dependem só da Fundação; os testes de US4 semeiam os times.
- **Polish (Phase 9)**: depende de todas as histórias desejadas.

### Arquivos compartilhados entre histórias (serializar as tarefas)

- `src/domain/consultas.ts`: T052 → T064 → T076 → T087 → T098 → T109
- `src/data/repositorio.ts`: T030 → T053 → T065 → T077 → T088 → T099 → T110
- `src/app/projetos/detalhes/page.tsx`: T068 → T080

Se duas histórias forem feitas em paralelo, essas tarefas são as únicas que exigem coordenação
(merge na mesma função/arquivo).

### User Story Dependencies

```text
Setup ─► Fundação ─┬─► US1 (P1) ─┐
                   ├─► US2 (P1) ─┼─► US3 (P2)
                   ├─► US4 (P2)  │
                   ├─► US5 (P3)  │
                   └─► US6 (P3) ─┴─► Polish
```

### Within Each User Story

- Testes escritos primeiro e falhando.
- Regras (`src/domain/regras/*`) → consultas (`src/domain/consultas.ts`) → repositório
  (`src/data/repositorio.ts`) → páginas (`src/app/**`).
- Fechar a história com `npx vitest run` e `npx playwright test us<N>` verdes antes da próxima.

### Parallel Opportunities

- Setup: T003, T004, T005, T007, T008, T009, T010 em paralelo após T001.
- Fundação: todos os testes T012–T021 em paralelo; T022–T026 em paralelo; T028–T029 em paralelo;
  T032–T040 em paralelo após T031; T043–T044 em paralelo.
- Em cada história: todos os testes [P] juntos; regras [P] junto com os testes; as quatro
  páginas [P] juntas depois do repositório.
- Entre histórias: US1, US2, US4, US5 e US6 podem ser feitas por pessoas diferentes após a
  Fundação (coordenando `consultas.ts` e `repositorio.ts`).
- Polish: T115–T122 em paralelo.

---

## Parallel Example: User Story 1

```bash
# Testes da US1 juntos (devem falhar):
Task: "Testes das regras de time em tests/unit/app/domain/regras-time.test.ts"
Task: "Testes das consultas de time em tests/unit/app/domain/consultas-times.test.ts"
Task: "Testes de repositório em tests/unit/app/data/repositorio-times.test.ts"
Task: "Testes de componente em tests/unit/ui/times.test.tsx"
Task: "Teste E2E em tests/e2e/us1-times.spec.ts"

# Depois de T051–T053, as quatro páginas juntas:
Task: "Criar src/app/times/page.tsx"
Task: "Criar src/app/times/novo/page.tsx"
Task: "Criar src/app/times/detalhes/page.tsx"
Task: "Criar src/app/times/editar/page.tsx"
```

## Parallel Example: User Story 4

```bash
Task: "Testes em tests/unit/app/domain/regras-desenvolvedor.test.ts"
Task: "Testes em tests/unit/app/domain/consultas-desenvolvedores.test.ts"
Task: "Testes em tests/unit/app/data/repositorio-desenvolvedores.test.ts"
Task: "Criar src/domain/regras/desenvolvedor.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

As duas histórias P1 formam o menor produto útil (a spec diz que projeto + time é o MVP).

1. Phase 1: Setup.
2. Phase 2: Fundação (bloqueia tudo).
3. Phase 3: US1 — **validar**: cadastro/busca/edição/exclusão de times e persistência.
4. Phase 4: US2 — **validar**: projetos com busca, filtros e exclusão em cascata.
5. `npm run verify` verde → demonstrar o MVP.

### Incremental Delivery

1. Setup + Fundação → base pronta (`verify` verde com a tela inicial).
2. + US1 → times (demo).
3. + US2 → MVP (demo).
4. + US3 → acompanhamento de projetos (principal valor de acompanhamento).
5. + US4 → desenvolvedores nos times.
6. + US5, US6 → cadastros de apoio.
7. Polish → critérios transversais, cobertura, Sonar e métricas.

Cada incremento termina com `npm run verify` verde, sem quebrar as histórias anteriores.

---

## Notes

- [P] = arquivos diferentes, sem dependência de tarefa incompleta.
- O rótulo [USn] liga a tarefa à história da spec para rastreabilidade.
- Verificar que os testes falham antes de implementar.
- Fazer commit após cada tarefa ou grupo lógico.
- Não há operações de editar/excluir relatório, marco ou item de cronograma (FR-030): nenhuma
  tarefa deve criá-las.
- Teste desativado ou ignorado exige justificativa registrada (Princípio III).
