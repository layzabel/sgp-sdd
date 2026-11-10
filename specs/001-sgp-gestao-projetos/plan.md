# Implementation Plan: SGP — Sistema Web de Gerenciamento de Projetos de Software

**Branch**: `001-sgp-gestao-projetos` | **Date**: 2026-11-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-sgp-gestao-projetos/spec.md`

## Summary

Aplicação web de página única, operada por um único administrador sem login, com cinco
cadastros (Administradores, Usuários, Desenvolvedores, Times, Projetos) e o acompanhamento de
projetos (relatórios, marcos e cronograma, imutáveis após criados). Abordagem técnica: Next.js 16
(App Router) com TypeScript strict, **exportado como site estático** (sem servidor), todos os
dados num único documento JSON versionado no `localStorage`, gravado atomicamente. Domínio puro
(`src/domain`) separado do repositório (`src/data`) e da interface (`src/app`, `src/ui`).
Qualidade com a infraestrutura existente (tsc, ESLint + sonarjs, Prettier, Vitest + cobertura,
SonarQube, métricas de IA), estendida com `next build` e Playwright + axe no `npm run verify`.
Detalhes e alternativas em [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript 5.9 (`strict`, `noUncheckedIndexedAccess`) sobre Node.js 24 LTS
(`engines` `>=24 <25`, `.nvmrc` = 24)

**Primary Dependencies**: Next.js 16.4 (App Router, `output: 'export'`), React 19.3. Nenhuma
biblioteca de estado, validação, datas, UI ou CSS (research R4–R10)

**Storage**: `localStorage` do navegador, chave única `sgp:dados`, documento JSON versionado
(research R3; [contracts/repositorio.md](contracts/repositorio.md))

**Testing**: Vitest 3.2 — projeto `app` (node: domínio e repositório), novo projeto `ui` (jsdom +
Testing Library: componentes), projeto `scripts` (existente); Playwright 1.65 + axe-core para E2E
e WCAG 2.1 AA (research R13–R14)

**Target Platform**: navegadores de computador — duas últimas versões estáveis de Chrome, Edge e
Firefox; layout funcional a partir de 360 px

**Project Type**: aplicação web front-end estática (sem backend)

**Performance Goals**: busca/filtro em lista de 500 registros atualizada em < 1 s (SC-006; meta
interna < 50 ms, filtragem em memória)

**Constraints**: zero tráfego de dados para fora do navegador (FR-037, SC-004); gravação atômica
e sem perda em falha (FR-039); WCAG 2.1 AA e operação total por teclado (FR-035); interface em
pt-BR com datas `dd/mm/aaaa`; complexidade ciclomática ≤ 10 e cognitiva ≤ 15 por função;
duplicação ≤ 3%

**Scale/Scope**: 1 administrador, 1 navegador; ~500 registros por cadastro; 5 cadastros +
3 tipos de acompanhamento; 21 rotas estáticas ([contracts/rotas-e-telas.md](contracts/rotas-e-telas.md))

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Exigência | Como o plano atende | Situação |
| --------- | --------- | ------------------- | -------- |
| I. Interface web desktop e acessibilidade | Layout desktop funcional em telas menores; 2 últimas versões de Chrome/Edge/Firefox; WCAG 2.1 AA; teclado; confirmação de exclusão; erros em pt-BR | Layout responsivo ≥ 360 px; E2E em Chromium, Firefox e Edge; axe-core em cada tela; `<dialog>` modal nativo para exclusão; mensagens com correção ([contracts/mensagens.md](contracts/mensagens.md)); `eslint-plugin-jsx-a11y` via `eslint-config-next` | ✅ |
| II. Segurança e proteção de dados (INEGOCIÁVEL) | Dados só no navegador; nada enviado a terceiros; validação antes de salvar; sem segredos versionados | Exportação estática sem servidor; `localStorage`; ESLint proíbe `fetch`/XHR/WebSocket/`sendBeacon` em `src/`; sem `next/font/google`, analytics ou recursos externos; E2E `privacidade.spec.ts` falha em qualquer requisição externa ou não-GET; repositório valida e só grava se válido; nenhum segredo novo (`.env*` já no `.gitignore`) | ✅ |
| III. Testes automatizados | Testes unitários do domínio; E2E dos fluxos principais; cobertura ≥ 80% no código novo; build/lint/tipos/testes passando | Vitest em `domain/` e `data/` (todas as regras FR-005…FR-030, FR-040); Testing Library em `ui/`; Playwright por história (US1–US6) + persistência, privacidade, teclado, responsivo, falha de gravação, desempenho; `verify` passa a incluir `build` e `e2e` | ✅ |
| IV. Arquitetura testável e dependências justificadas | Domínio separado de UI e dados; repositório testável; dependências justificadas; solução mais simples | `src/domain` puro (sem React/DOM); `src/data` com `Armazenamento` injetável e implementação em memória; tabela de dependências na seção "Dependências novas" deste plano; sem bibliotecas de estado/validação/UI | ✅ |
| V. Qualidade mensurável (SonarQube) | Quality Gate `TCC`; métricas registradas; `strict`; sem `any`; ESLint/Prettier limpos | Escopo Sonar `app` (`src`) já configurado; regras `complexity: 10` e `sonarjs/cognitive-complexity: 15` já no ESLint (aplicam-se a `.tsx`); validação dirigida por tabela para evitar duplicação entre cadastros; componentes genéricos de lista/formulário/detalhes | ✅ |
| VI. Rastreabilidade de IA | `metricas-ia.md` com linha por etapa; snapshot Sonar ao fim de `implement` e de cada `correcao-N`; consolidado | `specs/001-sgp-gestao-projetos/metricas-ia.md` alimentado por `npm run metrics:ia` (sessão de registro separada) e `npm run sonar -- --etapa …`; consolidado por `npm run metrics:consolidar` | ✅ (registro da etapa `plan` pendente — feito após esta sessão) |
| Restrições técnicas | Next.js App Router, React, TS strict, Node 24 via `engines` e `.nvmrc`; persistência local encapsulada; Vitest; E2E definido no plano; pt-BR | Todas atendidas; E2E = Playwright | ✅ |

**Resultado (pré-pesquisa)**: aprovado, sem violações.

**Re-verificação pós-design (Fase 1)**: aprovado. O design não introduziu servidor, rota dinâmica
de servidor, dependência sem justificativa nem camada além das três previstas. Dois pontos a
observar na implementação: (a) manter cada componente de formulário/lista abaixo dos limites de
complexidade — por isso formulários, listas e detalhes são genéricos e configurados por
descritor de campos; (b) a extensão do `verify` para 5 etapas altera um contrato existente
([docs/infraestrutura/cli.md](../../docs/infraestrutura/cli.md)) e seus testes, que devem ser
atualizados juntos.

## Project Structure

### Documentation (this feature)

```text
specs/001-sgp-gestao-projetos/
├── spec.md
├── plan.md              # este arquivo
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/
│   ├── repositorio.md   # interface do repositório + formato do localStorage
│   ├── rotas-e-telas.md # rotas, telas, comportamento de UI
│   └── mensagens.md     # textos fixos pt-BR
├── checklists/requirements.md
├── metricas-ia.md       # Princípio VI (criado pelo npm run metrics:ia)
└── tasks.md             # Fase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── domain/                      # puro: sem React, sem DOM, sem armazenamento
│   ├── tipos.ts                 # entidades, enums, Documento, Resultado
│   ├── texto.ts                 # trim, normalizar (sem acento/caixa), comparador alfabético
│   ├── datas.ts                 # validar AAAA-MM-DD, formatar dd/mm/aaaa
│   ├── email.ts                 # validação FR-006 sem regex de retrocesso
│   ├── validacao.ts             # motor de regras por tabela (obrigatório, tamanho, e-mail, enum, data)
│   ├── regras/                  # descritores de campos e regras por entidade
│   │   ├── administrador.ts
│   │   ├── usuario.ts
│   │   ├── desenvolvedor.ts
│   │   ├── time.ts
│   │   ├── projeto.ts
│   │   └── acompanhamento.ts    # relatório, marco, item de cronograma
│   ├── consultas.ts             # listar*/detalhar* com busca, filtros e ordenação
│   └── mensagens.ts             # textos de contracts/mensagens.md
├── data/
│   ├── armazenamento.ts         # interface Armazenamento + localStorage + memória
│   ├── documento.ts             # documento vazio, leitura/validação de versão
│   └── repositorio.ts           # operações de escrita, unicidade, vínculos, cascata, atomicidade
├── ui/                          # componentes cliente reutilizáveis
│   ├── RepositorioProvider.tsx  # contexto + useSyncExternalStore
│   ├── MenuPrincipal.tsx
│   ├── Mensagens.tsx            # região role=status/alert
│   ├── DialogoConfirmacao.tsx   # <dialog> modal
│   ├── Formulario.tsx           # formulário genérico dirigido por descritor de campos
│   ├── Lista.tsx                # lista/tabela genérica + busca + filtros + estados vazios
│   ├── Detalhes.tsx             # campos rotulados + ações editar/excluir
│   ├── SemTimes.tsx
│   └── acompanhamento/          # seções Relatórios, Marcos, Cronograma
└── app/                         # App Router (todas as páginas 'use client' exceto layout)
    ├── layout.tsx               # <html lang="pt-BR">, menu, região de mensagens, pular conteúdo
    ├── globals.css
    ├── page.tsx                 # início
    ├── projetos/{page,novo/page,detalhes/page,editar/page}.tsx
    ├── times/{…mesma estrutura…}
    ├── desenvolvedores/{…}
    ├── usuarios/{…}
    └── administradores/{…}

tests/
├── unit/
│   ├── app/                     # Vitest project "app" (node)
│   │   ├── domain/*.test.ts
│   │   └── data/*.test.ts
│   ├── ui/                      # Vitest project "ui" (jsdom) — *.test.tsx
│   └── scripts/                 # existente
├── e2e/                         # Playwright
│   ├── servidor-estatico.ts     # serve out/ em localhost:4173
│   ├── apoio/                   # helpers: limpar dados, semear, axe
│   └── *.spec.ts
├── fixtures/ helpers/           # existentes

Arquivos de configuração alterados/criados na raiz:
next.config.ts (novo: output 'export', trailingSlash, images.unoptimized)
playwright.config.ts (novo)
tsconfig.json (jsx, lib dom, plugin next, include .tsx, exclude out/.next)
eslint.config.mjs (+ eslint-config-next, + restrições de rede em src/, ignora .next/out)
vitest.config.mts (+ projeto ui/jsdom; esbuild jsx automatic)
package.json (scripts dev/build/start:estatico/test:e2e com NEXT_TELEMETRY_DISABLED=1; deps)
.gitignore, .prettierignore (+ .next/, out/, next-env.d.ts, playwright-report/, test-results/)
scripts/verify/stages.ts + tests/unit/scripts/verify.test.ts + docs/infraestrutura/cli.md
  (verify com 5 etapas: tipos, padroes, testes, build, e2e)
```

**Structure Decision**: projeto único na raiz (já é onde estão `scripts/`, `tests/` e os
arquivos de qualidade), com o código da aplicação em `src/` — que é exatamente o
`sonar.sources` do escopo `app` e o `coverage.include` do Vitest. Sem pastas `frontend/` e
`backend/`, pois não há backend.

## Fluxo de dados (resumo)

```text
Página (app/) ──usa──► hook useDocumento() ──useSyncExternalStore──► repositorio.getSnapshot()
     │                                                                     ▲
     │ chama consultas puras (domain/consultas.ts) sobre o Documento       │ notifica ouvintes
     ▼                                                                     │
ação do usuário ──► repositorio.criar*/atualizar*/excluir*  ──► domain/validacao + regras
                                   │ válido: novo Documento ──► JSON ──► armazenamento.setItem (1×)
                                   │   ok → troca snapshot + notifica   │ erro → mantém snapshot
                                   ▼                                    ▼
                         Resultado { ok: true }            Resultado { ok: false, erro }
```

## Dependências novas (justificativa exigida pelo Princípio IV)

Todas com versão exata no `package.json`. Detalhes das decisões em [research.md](research.md).

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

Sem dependências de estado, validação, datas, UI, CSS ou IDs (research R4, R6, R8, R9, R10).

## Riscos e mitigação

| Risco | Mitigação |
| ----- | --------- |
| Cota do `localStorage` (~5 MB) com muitos relatórios longos | Erro tratado (FR-039) com mensagem clara; troca para IndexedDB isolada em `src/data` |
| Complexidade/duplicação nos 5 cadastros quase iguais | Componentes genéricos dirigidos por descritores; métricas conferidas por ESLint em cada `verify` |
| `crypto.randomUUID` exige contexto seguro | Uso previsto em `localhost`/`https`; documentado no quickstart |
| Edge não instalado no ambiente de teste | Projeto Playwright `msedge` executado quando disponível; Chromium cobre o mesmo motor |
| Diferenças de fuso na data do relatório | `criadoEm` em ISO UTC; exibição convertida para data local; datas sem hora nunca passam por `Date` |

## Complexity Tracking

Sem violações da constituição a justificar. A camada de repositório e a separação domínio/dados/
interface são exigidas pelo Princípio IV, não acréscimos.
