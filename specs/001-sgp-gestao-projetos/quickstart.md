# Quickstart — validação do SGP

Guia para executar e validar a feature de ponta a ponta. Detalhes de dados e telas em
[data-model.md](data-model.md) e [contracts/](contracts/).

## Pré-requisitos

- Node.js 24 LTS (`.nvmrc`), npm.
- Navegadores do Playwright: `npx playwright install chromium firefox` (Edge é usado se estiver
  instalado no sistema — canal `msedge`).
- Para as métricas do Princípio V: Docker e `SONAR_TOKEN` (ver
  [docs/infraestrutura/cli.md](../../docs/infraestrutura/cli.md)).

## Instalação e execução

```powershell
npm ci
npm run dev            # desenvolvimento em http://localhost:3000
npm run build          # exportação estática em out/
npm run start:estatico # serve out/ em http://localhost:4173 (mesmo servidor usado pelo E2E)
```

## Portão de qualidade (obrigatório antes de concluir)

```powershell
npm run verify
```

Esperado: `VERIFY OK: 5/5 etapas` (tipos, padroes, testes, build, e2e). Cobertura em
`coverage/`; relatório E2E em `playwright-report/`.

Depois, com o SonarQube no ar:

```powershell
npm run sonar:up
npm run sonar -- --etapa implement
```

Esperado: Quality Gate `TCC` aprovado no escopo `app` e linhas gravadas em
`specs/001-sgp-gestao-projetos/metricas-ia.md`.

## Cenários de validação manual (roteiro de demonstração)

Partir de um navegador sem dados do SGP (DevTools → Application → Local Storage → apagar
`sgp:dados`).

| # | Passos | Resultado esperado | Ref. |
| - | ------ | ------------------ | ---- |
| 1 | Projetos → "Novo projeto" | Aviso "É preciso cadastrar um time antes…" com link para cadastrar time | US2-5 |
| 2 | Times → Novo → nome "Plataforma", área "Web" → Salvar | Detalhes do time + "Time cadastrado com sucesso." | US1-1 |
| 3 | Times → Novo → nome "  plataforma " → Salvar | Erro no nome: já existe um time com esse nome | US1-2 |
| 4 | Projetos → Novo → "Portal do Cliente", início 10/03/2026, término 09/03/2026, Planejado, Plataforma → Salvar | Erro no término prevista; nada salvo | US2-3 |
| 5 | Corrigir término para 10/03/2026 → Salvar | Projeto salvo, detalhes exibidos | US2-4 |
| 6 | Nos detalhes: adicionar 3 relatórios, marcos "Kickoff", "Protótipo", "Entrega" e itens 20/04, 05/04, 12/04 | Relatórios mais recentes primeiro (data dd/mm/aaaa, sem hora); marcos na ordem de criação; cronograma 05/04, 12/04, 20/04; sem botões de editar/excluir | US3 |
| 7 | Desenvolvedores → Novo → e-mail "ana@empresa" | Erro de e-mail inválido | US4-3 |
| 8 | Cadastrar desenvolvedor válido no time Plataforma; abrir o time | Desenvolvedor e projeto listados nos detalhes do time | US1-5 |
| 9 | Excluir o time Plataforma | Bloqueado: "possui 1 desenvolvedor(es) e 1 projeto(s)…" | US1-6 |
| 10 | Excluir o projeto | Confirmação cita 3 relatórios, 3 marcos, 3 itens; ao confirmar, removido | US2-8 |
| 11 | Fechar a aba e reabrir | Todos os dados restantes presentes | SC-003 |
| 12 | Repetir 2–10 só com teclado (Tab, Shift+Tab, Enter, Espaço, Esc) | Tudo operável, foco sempre visível | SC-007 |
| 13 | Janela com 360 px de largura (DevTools) | Sem rolagem horizontal, nenhum conteúdo cortado | SC-007 |
| 14 | DevTools → Network durante 2–10 | Só requisições GET a `localhost` (arquivos da aplicação) | SC-004 |
| 15 | `npx playwright test desempenho` (semeia 500 projetos em `sgp:dados` e mede busca/filtro) | Lista atualizada em < 1 s | SC-006 |

## Suítes automatizadas e o que cada uma prova

| Comando | Conteúdo | Prova |
| ------- | -------- | ----- |
| `npx vitest run --project app` | `tests/unit/app/domain/**`, `tests/unit/app/data/**` | Regras de domínio, validação, unicidade, ordenação, busca sem acento, cascata, atomicidade em falha de gravação |
| `npx vitest run --project ui` | `tests/unit/ui/**` | Formulários, mensagens, diálogo de confirmação, estados vazios |
| `npx playwright test` | `tests/e2e/us1-times.spec.ts` … `us6-usuarios.spec.ts`, `persistencia`, `privacidade`, `teclado`, `responsivo`, `falha-gravacao`, `acessibilidade` (axe WCAG 2.1 AA), `desempenho` (500 registros) | Cenários de aceitação e critérios SC-002…SC-007 em Chromium, Firefox e Edge |

SC-001 e SC-008 (tempo e taxa de sucesso com pessoas) são verificados por teste com usuários,
fora das suítes automatizadas.
