<!--
Sync Impact Report
- Version change: 1.0.0 → 2.0.0 (MAJOR — redefinição incompatível do Princípio II e remoção de
  regras dos Princípios I e III)
- Contexto: o SGP é operado por um único administrador, sem login, sem perfis de acesso, sem
  servidor e sem banco de dados externo; todos os dados ficam somente no navegador.
- Princípios modificados:
  - I. Interface Web para Desktop e Acessibilidade (título mantido): removidas a largura mínima
    de 1280 px e a frase sobre celular e tablet; o layout é pensado para computador e DEVE
    funcionar em telas menores; exemplo de ação destrutiva passa a ser "excluir registro".
  - II. Segurança e Proteção de Dados (título mantido): removidos autenticação, autorização,
    validação no servidor, hash de senhas e `.env.example`; adicionados dados somente no
    navegador, proibição de envio a servidores ou terceiros e validação de toda entrada antes de
    salvar; mantida a proibição de versionar segredos.
  - III. Testes Automatizados (título mantido): removidos os testes de autorização/negação de
    acesso e "permissões" da lista de regras de domínio.
  - V e VI: inalterados.
- Seções modificadas: Restrições Técnicas — persistência somente no armazenamento local do
  navegador, sem backend, banco externo, autenticação ou perfis de acesso.
- Seções adicionadas: nenhuma. Seções removidas: nenhuma.
- Templates dependentes: não modificados (leem a constituição em tempo de execução).
- TODOs adiados: nenhum.
-->

# Constituição — SGP: Sistema Web de Gerenciamento de Projetos

## Core Principles

### I. Interface Web para Desktop e Acessibilidade

- O sistema DEVE ser uma aplicação web com layout pensado para computador, que DEVE continuar
  funcional em telas menores, sem perda de conteúdo ou de funcionalidade.
- O sistema DEVE funcionar nas duas versões estáveis mais recentes de Chrome, Edge e Firefox.
- A interface DEVE atender WCAG 2.1 nível AA, incluindo contraste mínimo, rótulos em todos os
  campos de formulário e foco visível.
- Toda funcionalidade DEVE ser operável por teclado (sem armadilhas de foco), e ações
  destrutivas (por exemplo, excluir registro) DEVEM exigir confirmação explícita.
- Mensagens de erro DEVEM informar o problema e como corrigi-lo, em português do Brasil.

**Justificativa**: o administrador usa o sistema principalmente em computador; acessibilidade
e operação por teclado são critérios objetivos e verificáveis de qualidade da interface.

### II. Segurança e Proteção de Dados — INEGOCIÁVEL

- Todos os dados DEVEM ser armazenados somente no navegador do administrador.
- É PROIBIDO enviar dados a servidores ou a terceiros, o que inclui analytics, telemetria,
  rastreadores e relatórios de erro remotos.
- Toda entrada DEVE ser validada antes de ser salva; dados inválidos NÃO DEVEM ser persistidos, e
  o administrador DEVE ser informado do erro (Princípio I).
- É PROIBIDO versionar segredos (senhas, tokens, chaves de API); arquivos de configuração local
  com valores reais DEVEM estar no `.gitignore`.

**Justificativa**: o SGP é operado por um único administrador e não tem servidor; mantendo os
dados só no navegador e validando toda entrada, a integridade e a privacidade dos dados podem
ser verificadas por inspeção do código e pelo SonarQube (Princípio V).

### III. Testes Automatizados

- A lógica de domínio (regras de negócio de projetos, tarefas, prazos e status) DEVE ter testes
  unitários.
- Os fluxos principais de cada feature DEVEM ter testes end-to-end executados em navegador.
- Cobertura de linhas no código novo SHOULD ser ≥ 80%.
- Build, lint, verificação de tipos e todos os testes DEVEM passar antes de a feature ser
  considerada concluída; teste desativado ou ignorado DEVE ter justificativa registrada.

**Justificativa**: testes automatizados são a evidência reproduzível de que o código gerado com
IA cumpre a especificação.

### IV. Arquitetura Testável e Dependências Justificadas

- A lógica de domínio DEVE ficar separada da interface e do acesso a dados, de modo que possa ser
  testada sem navegador e sem banco de dados.
- O acesso a dados DEVE ser encapsulado em uma camada de repositório testável.
- Toda dependência nova DEVE ser justificada no `plan.md` (finalidade e alternativa
  considerada).
- A solução DEVE ser a mais simples que atenda à especificação; abstrações, serviços ou camadas
  extras DEVEM ser justificados na tabela "Complexity Tracking" do `plan.md`.

**Justificativa**: separação de responsabilidades reduz complexidade e duplicação, que são
métricas avaliadas pelo Princípio V.

### V. Qualidade de Código Mensurável (SonarQube)

- Todo código DEVE ser analisado pelo SonarQube (Community Edition ou SonarCloud) antes de ser
  considerado concluído. O Quality Gate do projeto DEVE exigir, no mínimo:
  - Bugs: 0 · Vulnerabilidades: 0 · Security Hotspots revisados: 100%;
  - Duplicação de linhas: ≤ 3%;
  - Complexidade cognitiva por função: ≤ 15 (regra padrão Sonar);
  - Complexidade ciclomática por função: ≤ 10;
  - Nota de manutenibilidade (Maintainability Rating): A;
  - Code smells de severidade Blocker/Critical: 0.
- As seguintes métricas DEVEM ser registradas a cada análise: bugs, vulnerabilidades, code
  smells, duplicação (%), complexidade ciclomática (total e máxima por função), complexidade
  cognitiva (total e máxima por função), dívida técnica em minutos (`sqale_index`) e nota de
  manutenibilidade.
- TypeScript DEVE usar `strict: true`; `any` explícito é PROIBIDO sem justificativa registrada.
  ESLint e Prettier DEVEM passar sem erros.
- Exceções a um limite DEVEM ser justificadas por escrito na tabela "Complexity Tracking" do
  `plan.md` da feature.

**Justificativa**: o trabalho avalia a qualidade do código produzido com IA; sem métricas
objetivas e reproduzíveis não há base de comparação.

### VI. Rastreabilidade do Desenvolvimento com IA

- Cada feature DEVE manter o arquivo `specs/<feature>/metricas-ia.md` com uma linha por etapa do
  Spec Kit (constitution, specify, clarify, plan, tasks, analyze, implement, correções),
  contendo: data, modelo (ID exato), tokens de entrada, tokens de saída, tokens de cache
  (leitura/escrita), custo em USD, número de prompts do usuário e número de rodadas de correção.
- **Prompt** é cada mensagem enviada pelo usuário ao agente. **Rodada de correção** é cada
  prompt que pede ao agente para corrigir defeito, erro de build/teste, violação desta
  constituição ou apontamento do SonarQube em artefato já gerado. **Etapa de correção**
  (`correcao-N`) é a etapa do Spec Kit, registrada como uma linha própria, que agrupa uma ou mais
  rodadas de correção.
- Tokens e custo DEVEM vir de fonte verificável (saída de `/cost` do Claude Code, painel de uso
  do provedor ou transcrições da sessão). Valores estimados DEVEM ser marcados como "estimado",
  com o método de estimativa indicado. É PROIBIDO inventar ou arredondar sem indicação.
- Quando a fonte de dados não separar etapas que ocorreram na mesma sessão, é admitida uma única
  linha agregada, que DEVE identificar explicitamente as etapas incluídas (por exemplo,
  "plan + tasks"). É PROIBIDO ratear ou estimar os valores entre as etapas agregadas.
- Ao final de `implement` e ao final de cada etapa de correção (`correcao-N`), o agente DEVE
  anexar ao mesmo arquivo um snapshot das métricas SonarQube do Princípio V, permitindo
  correlacionar esforço de IA e qualidade. O snapshot NÃO é exigido a cada rodada de correção
  (prompt) dentro de uma etapa.
- Um consolidado do projeto DEVE ser mantido em `docs/metricas/consolidado.md` somando as
  métricas de todas as features.

**Justificativa**: a rastreabilidade do custo e do esforço de desenvolvimento assistido por IA
é objeto de estudo do projeto e precisa ser auditável.

## Restrições Técnicas e de Conformidade

- **Stack**: Next.js (App Router), React, TypeScript (strict) e Node.js 24 LTS, fixado via campo
  `engines` do `package.json` e arquivo `.nvmrc`.
- **Persistência**: somente no armazenamento local do navegador (IndexedDB ou `localStorage`),
  encapsulada na camada de repositório do Princípio IV. Não há backend, banco de dados externo,
  autenticação nem perfis de acesso; o sistema é operado por um único administrador.
- **Testes**: Vitest para testes unitários e de integração; ferramenta de E2E em navegador
  definida no `plan.md`.
- **Infraestrutura de qualidade**: os scripts de `scripts/` (SonarQube, métricas de IA e
  verificação) são a forma oficial de produzir as métricas dos Princípios V e VI.
- **Idioma**: interface e documentação em português do Brasil.

## Fluxo de Desenvolvimento e Portões de Qualidade

1. Toda feature segue o fluxo Spec Kit: `specify` → `clarify` (quando houver ambiguidade) →
   `plan` → `tasks` → `analyze` → `implement`.
2. O "Constitution Check" do `plan.md` DEVE verificar explicitamente os Princípios I a VI; uma
   violação não justificada bloqueia a passagem para `tasks`.
3. Uma feature só é considerada concluída quando: build, lint, verificação de tipos e testes
   passam; o Quality Gate do SonarQube está aprovado; os critérios de acessibilidade do
   Princípio I foram verificados; e `metricas-ia.md` está atualizado com métricas de IA e
   snapshot SonarQube.
4. Cada falha em um desses portões que exija nova interação com o agente DEVE ser contabilizada
   como rodada de correção (Princípio VI).

## Governance

- Esta constituição prevalece sobre quaisquer outras práticas, templates ou instruções do
  projeto. Em caso de conflito, aplica-se a constituição.
- Emendas DEVEM ser feitas via `/speckit-constitution`, com Sync Impact Report, justificativa e
  avaliação de impacto nas features em andamento.
- Versionamento semântico: MAJOR para remoção ou redefinição incompatível de princípios; MINOR
  para novo princípio/seção ou ampliação material; PATCH para esclarecimentos e redação.
- Toda revisão de plano, tarefa ou código DEVE verificar conformidade com os princípios; os
  princípios II e VI não admitem exceção. Exceções aos limites numéricos do Princípio V exigem
  justificativa registrada.
- A conformidade DEVE ser revisada ao fim de cada feature, junto com a consolidação das métricas.

**Version**: 2.0.0 | **Ratified**: 2026-11-10 | **Last Amended**: 2026-11-10
