# Research — SGP (Fase 0)

**Feature**: [spec.md](spec.md) · **Plano**: [plan.md](plan.md) · **Data**: 2026-11-10

Cada item registra a decisão, a justificativa e as alternativas avaliadas. Não restam itens
"NEEDS CLARIFICATION" no Technical Context.

Versões consultadas no registro npm em 2026-11-10: `next` 16.4.6, `react`/`react-dom` 19.3.1,
`eslint-config-next` 16.4.6, `@playwright/test` 1.65.0, `@axe-core/playwright` 4.14.0,
`@testing-library/react` 16.3.3, `jsdom` 31.0.0. Node local: v24.19.0.

---

## R1. Modo de entrega do Next.js sem backend

- **Decisão**: Next.js 16 (App Router) com **exportação estática** (`output: 'export'` no
  `next.config.ts`). O build gera HTML/JS/CSS em `out/`, servidos por qualquer servidor de
  arquivos estáticos; todas as telas são Client Components que leem o armazenamento do navegador.
- **Justificativa**: atende "sem backend" de forma verificável (não existe processo Node em
  execução, nem Route Handlers, Server Actions ou middleware); simplifica o SC-004 (0 envios de
  dados) porque não há endpoint para onde enviar.
- **Alternativas**: `next start` (servidor Node) — rejeitado: introduz um servidor que a
  constituição não prevê; Vite + React Router — rejeitado: a constituição fixa Next.js.

## R2. Rotas de detalhe/edição com exportação estática

- **Decisão**: rotas estáticas com o identificador no parâmetro de consulta
  (`/projetos/detalhes?id=<uuid>`, `/projetos/editar?id=<uuid>`), lido com `useSearchParams`
  dentro de `<Suspense>`.
- **Justificativa**: rotas dinâmicas (`/projetos/[id]`) na exportação estática exigem
  `generateStaticParams` com os IDs conhecidos no build, impossível com dados que só existem no
  navegador. O parâmetro de consulta mantém endereços salváveis, o que permite cobrir o caso
  "registro inexistente" da spec.
- **Alternativas**: rota `[id]` com fallback 404 customizado — rejeitado (frágil, depende do
  servidor estático); estado em memória sem URL — rejeitado (quebra o voltar do navegador e o
  endereço salvo).

## R3. Mecanismo de armazenamento no navegador

- **Decisão**: `localStorage`, com **uma única chave** (`sgp:dados`) que guarda o documento JSON
  completo e versionado (`{ versao: 1, seq, administradores, usuarios, desenvolvedores, times,
  projetos, relatorios, marcos, itensCronograma }`). Cada gravação serializa o documento inteiro
  e faz um único `setItem`.
- **Justificativa**:
  - **Atomicidade**: a exclusão em cascata do projeto (FR-025) e qualquer outra gravação viram
    um único `setItem`; se falhar (cota cheia, armazenamento bloqueado), nada muda — o que
    cumpre FR-039 sem lógica de compensação.
  - **Simplicidade**: API síncrona, sem dependência, fácil de substituir por um dublê em teste.
  - **Volume**: a meta da spec é ~500 registros por cadastro. 500 registros de pessoa/time/projeto
    ocupam dezenas de KB; o maior consumidor são relatórios (até 5.000 caracteres). Com ~5 MB
    de cota típica, cabem centenas de relatórios longos; o estouro é tratado como erro de
    gravação (FR-039), não como perda de dados.
  - **Desempenho**: `JSON.stringify`/`parse` de alguns MB leva poucos ms; a leitura acontece uma
    vez ao carregar e o documento fica em memória.
- **Alternativas**: IndexedDB (direto ou via `idb`) — rejeitado: API assíncrona e transações
  aumentam a complexidade e a quantidade de código sem necessidade para o volume previsto;
  uma chave por coleção no `localStorage` — rejeitado: cascata exigiria várias gravações
  não atômicas.
- **Risco aceito**: limite de cota do `localStorage`. Mitigação: mensagem de erro clara e
  formulário preservado (FR-039). A troca para IndexedDB fica restrita à camada de repositório
  (Princípio IV), sem afetar domínio ou interface.

## R4. Camadas e fluxo de dados

- **Decisão**: três camadas em `src/`:
  1. `domain/` — tipos, normalização, validação, ordenação, busca/filtro e regras de vínculo.
     Funções puras, sem React nem acesso a armazenamento.
  2. `data/` — repositório: lê/grava o documento via uma interface `Armazenamento`
     (`getItem`/`setItem`), aplica as regras do domínio e devolve `Resultado` (sucesso ou erros
     por campo / erro de gravação). Implementações: `localStorage` (produção) e memória (testes).
  3. `app/` + `ui/` — páginas e componentes React; leem o estado por um hook baseado em
     `useSyncExternalStore` (o repositório expõe `subscribe`/`getSnapshot`).
- **Justificativa**: cumpre o Princípio IV (domínio testável sem navegador; acesso a dados
  encapsulado); `useSyncExternalStore` é API nativa do React e evita biblioteca de estado.
- **Alternativas**: Redux/Zustand — rejeitados (dependência sem ganho); Context com `useState`
  duplicando o estado — rejeitado (duas fontes de verdade).

## R5. Hidratação e renderização inicial

- **Decisão**: no build estático as páginas são pré-renderizadas sem dados
  (`getServerSnapshot` devolve `null`); no navegador o hook carrega o documento e a tela mostra
  "Carregando…" apenas no primeiro quadro.
- **Justificativa**: evita divergência de hidratação; o `localStorage` não existe no build.
- **Alternativas**: `dynamic(..., { ssr: false })` em todas as páginas — rejeitado (mais código
  repetido, mesmo efeito).

## R6. Validação de entrada

- **Decisão**: validadores próprios em `domain/validacao.ts`, dirigidos por uma tabela de regras
  por cadastro (obrigatório, tamanho máximo do FR-040, e-mail, enumeração, data ISO,
  término ≥ início). Unicidade é verificada no repositório, que conhece os demais registros.
  Saída: `Record<campo, mensagem>` em pt-BR.
- **E-mail (FR-006)**: verificação sem expressão regular com retrocesso: exatamente um `@`, parte
  local não vazia, domínio sem espaços, com ao menos um `.` que não seja o primeiro nem o último
  caractere, e nenhum espaço em todo o valor. Evita o alerta de ReDoS do Sonar (S5852).
- **Justificativa**: as regras são poucas e específicas; uma tabela evita duplicação entre os
  cinco cadastros (meta de duplicação ≤ 3%).
- **Alternativas**: Zod — rejeitado: dependência extra para regras simples, e as mensagens
  personalizadas em pt-BR exigiriam o mesmo volume de código.

## R7. Busca, ordenação e acentos (FR-008)

- **Decisão**:
  - Busca: `normalizar(t) = t.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR')`;
    o registro casa se `normalizar(campo).includes(normalizar(termo))`. Termo vazio (após trim)
    não filtra.
  - Ordenação: `new Intl.Collator('pt-BR', { sensitivity: 'base' }).compare` sobre o nome;
    empate por ordem de criação (`seq`) para ser determinística.
  - Desempenho (SC-006): filtrar e ordenar 500 itens em memória custa < 5 ms; sem debounce nem
    virtualização.
- **Alternativas**: `localeCompare` sem collator reutilizado — rejeitado (mais lento em listas);
  bibliotecas de busca difusa — rejeitadas (fora do requisito).

## R8. Datas, momento de criação e ordem de criação

- **Decisão**:
  - Datas sem hora (início, término prevista, data prevista) armazenadas como texto
    `AAAA-MM-DD` (valor nativo do `<input type="date">`); comparação lexicográfica é correta
    nesse formato. Exibição `dd/mm/aaaa` por função de formatação própria (sem `Date`, evitando
    deslocamento de fuso).
  - Momento de criação de relatórios: `new Date().toISOString()` (relógio do computador,
    conforme Assumptions) e exibição só da data local em `dd/mm/aaaa` (FR-027).
  - Ordem de criação: contador inteiro `seq` no documento, incrementado a cada registro criado
    (qualquer entidade). Desempata relatórios do mesmo instante, marcos e itens de cronograma
    com a mesma data, independentemente da resolução do relógio.
- **Alternativas**: biblioteca de datas (date-fns, dayjs) — rejeitada (só formatação simples);
  ordenar por timestamp — rejeitado (empates no mesmo milissegundo).

## R9. Identificadores

- **Decisão**: `crypto.randomUUID()`, encapsulado em `data/` (injetável nos testes).
- **Justificativa**: nativo nos navegadores-alvo em contexto seguro (`https` ou `localhost`).
- **Alternativas**: pacote `uuid` — rejeitado (desnecessário); IDs incrementais — rejeitados
  (endereços previsíveis e reaproveitáveis após exclusão).

## R10. Interface, acessibilidade e mensagens

- **Decisão**:
  - CSS Modules + um `globals.css` com variáveis de cor de contraste AA, foco visível
    (`:focus-visible` com contorno de 3 px), fonte do sistema (sem `next/font/google`, que baixa
    fontes de servidores externos no build).
  - Layout: menu principal fixo em telas largas; abaixo de 768 px vira barra no topo com os
    links em linha quebrável; tabelas viram listas de cartões abaixo de 640 px. Testado a partir
    de 360 px (SC-007).
  - Confirmação de exclusão: elemento nativo `<dialog>` aberto com `showModal()` (foco preso no
    diálogo, `Esc` cancela, foco volta ao botão de origem).
  - Mensagens de sucesso/erro de operação: região `role="status"` (sucesso) e `role="alert"`
    (erro) persistente no layout; erros de campo com `aria-invalid` e `aria-describedby`; foco
    vai para o primeiro campo inválido ao salvar.
  - Campo obrigatório: asterisco visível com legenda "* campo obrigatório" e atributo `required`
    desativado da validação nativa (`noValidate` no formulário) para que as mensagens sejam as
    do sistema, em pt-BR.
  - `<html lang="pt-BR">`; títulos de página (`<h1>` e `document.title`) por tela.
- **Alternativas**: biblioteca de componentes (MUI, Radix, shadcn) — rejeitada: dependências
  pesadas para formulários, listas e um diálogo; Tailwind — rejeitado (dependência e
  configuração extra sem requisito).

## R11. Privacidade: nenhum envio de dados (FR-037, SC-004)

- **Decisão**:
  - Sem analytics, sem `next/font/google`, sem imagens/scripts de terceiros, sem `fetch`.
  - Telemetria de build do Next.js desativada (`NEXT_TELEMETRY_DISABLED=1` nos scripts npm) —
    não é dado do SGP, mas segue o espírito do Princípio II.
  - Regra ESLint `no-restricted-globals`/`no-restricted-syntax` proibindo `fetch`,
    `XMLHttpRequest`, `WebSocket`, `EventSource` e `navigator.sendBeacon` em `src/`.
  - Teste E2E que registra toda requisição de rede durante os fluxos e falha se houver qualquer
    requisição para origem diferente da aplicação ou qualquer requisição não-GET.
- **Alternativas**: apenas revisão manual — rejeitada (não reproduzível).

## R12. Ferramentas de qualidade existentes e como se integram

- **Decisão**: reaproveitar a infraestrutura do repositório e estendê-la ao código da aplicação:
  - **TypeScript**: `tsconfig.json` passa a incluir `src/**/*.tsx`, `jsx: "preserve"`,
    `lib: ["dom", "dom.iterable", "esnext"]` e o plugin `next`; mantém `strict` e
    `noUncheckedIndexedAccess`. `scripts/tsconfig.json` inalterado.
  - **ESLint**: o `eslint.config.mjs` atual (typescript-eslint, sonarjs com complexidade
    ciclomática 10 e cognitiva 15, `no-explicit-any`, prettier) recebe `eslint-config-next`
    (`core-web-vitals` + `typescript`, que inclui `jsx-a11y`) e as restrições de rede de R11.
  - **Prettier**: mesma configuração; `.prettierignore` e `.gitignore` recebem `.next/`, `out/`,
    `next-env.d.ts`, `playwright-report/`, `test-results/`.
  - **Vitest**: o projeto `app` (ambiente `node`) cobre `tests/unit/app/**` (domínio e
    repositório); novo projeto `ui` (ambiente `jsdom`) cobre `tests/unit/ui/**/*.test.tsx`
    (componentes e páginas com Testing Library). A cobertura continua em `src/**` e `scripts/**`
    e alimenta `coverage/lcov.info` para o Sonar.
  - **Sonar**: escopo `app` (`sonar.sources=src`) já existe e já exclui `.next/` e `out/`; nada
    muda nos arquivos de propriedades.
  - **`npm run verify`**: passa de 3 para 5 etapas — `tipos` (1), `padroes` (2), `testes` (3),
    `build` (4: `next build`) e `e2e` (5: `playwright test`). Exigido pelo item 3 do Fluxo de
    Desenvolvimento (build e todos os testes passam). Atualizar `scripts/verify/stages.ts`,
    `tests/unit/scripts/verify.test.ts` (espera hoje 3 etapas) e
    `docs/infraestrutura/cli.md`.
  - **Métricas de IA**: `npm run metrics:ia` e `npm run sonar -- --etapa <etapa>` gravam em
    `specs/001-sgp-gestao-projetos/metricas-ia.md`, em sessão de registro separada.

## R13. Testes end-to-end

- **Decisão**: Playwright (`@playwright/test`) com `@axe-core/playwright` (verificação
  automática WCAG 2.1 A/AA em cada tela). O `webServer` do Playwright serve `out/` com um
  servidor estático mínimo próprio em `tests/e2e/servidor-estatico.ts` (Node `http` + `fs`, só
  GET, só arquivos de `out/`, porta fixa em `localhost`), para não adicionar dependência. Projetos: `chromium`,
  `firefox` e `msedge` (canal `msedge` executado quando o Edge estiver instalado). Viewports:
  1280×800 e 360×740.
- **Cobertura dos fluxos**: um arquivo por história (US1–US6) com os cenários de aceitação
  principais; mais `persistencia.spec.ts` (fechar/reabrir, SC-003), `privacidade.spec.ts`
  (SC-004), `teclado.spec.ts` (fluxo completo só com teclado, SC-007),
  `falha-gravacao.spec.ts` (cota cheia simulada por `page.addInitScript` que faz `setItem`
  lançar `QuotaExceededError`, FR-039).
- **Alternativas**: Cypress — rejeitado (sem Firefox/Edge equivalentes no mesmo runner e
  mais pesado); `serve`/`http-server` — rejeitados (dependência para 30 linhas de código).

## R14. Testes de componentes

- **Decisão**: Vitest + `jsdom` + `@testing-library/react` + `@testing-library/user-event` para
  formulários, listas, diálogo de confirmação e mensagens (renderizados com repositório em
  memória). `next/navigation` é substituído por um dublê simples nos testes.
- **Justificativa**: a cobertura ≥ 80% (Princípio III) é medida em `src/**`; sem testes de
  componente, a maior parte do código da interface ficaria fora da medição (o E2E não gera
  lcov).
- **Alternativas**: `happy-dom` — viável, mas `jsdom` tem suporte mais completo a `<dialog>` e
  formulários; `@testing-library/jest-dom` — dispensado (asserções nativas bastam).

## Dependências novas (justificativa exigida pelo Princípio IV)

| Pacote | Tipo | Finalidade | Alternativa considerada |
| ------ | ---- | ---------- | ----------------------- |
| `next` 16.4.6 | prod | Framework exigido pela constituição (App Router, export estático) | — (fixado pela constituição) |
| `react`, `react-dom` 19.3.1 | prod | Base do Next.js | — |
| `@types/react`, `@types/react-dom` 19.3.0 | dev | Tipos para `strict` | — |
| `eslint-config-next` 16.4.6 | dev | Regras Next/React/hooks/`jsx-a11y` | Configurar `eslint-plugin-react-hooks` e `jsx-a11y` à mão (mais configuração) |
| `@playwright/test` 1.65.0 | dev | E2E em Chrome, Firefox e Edge | Cypress (sem Firefox/Edge no mesmo runner) |
| `@axe-core/playwright` 4.14.0 | dev | Verificação automática WCAG 2.1 AA | Só verificação manual (não reproduzível) |
| `@testing-library/react` 16.3.3, `@testing-library/user-event` 14.6.9 | dev | Testes de componente medidos na cobertura | Só E2E (sem lcov de `src/`) |
| `jsdom` 31.0.0 | dev | DOM para Vitest | `happy-dom` (suporte menor a `<dialog>`) |

Sem dependências de estado, validação, datas, UI, CSS ou IDs (ver R4, R6, R8, R9, R10).
