# Métricas de IA e Qualidade — 001-sgp-gestao-projetos

Arquivo gerado e mantido pelos scripts `metrics:ia` e `sonar`. Não editar à mão.
Fonte de tokens e custo: ccusage (relatório de sessões, `--offline`). Fonte de qualidade: SonarQube local.

## Medições de IA

<!-- tabela:ia -->
| data_hora | etapa | modelo | tokens_entrada | tokens_saida | tokens_cache_escrita | tokens_cache_leitura | custo_usd | prompts | rodadas_correcao | versao_ccusage | sessoes | tipo | observacao |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
<!-- fim:ia -->

## Medições SonarQube

<!-- tabela:sonar -->
| data_hora | etapa | escopo | analise | linha_base | bugs | vulnerabilidades | code_smells | duplicacao_pct | ciclomatica_total | ciclomatica_max_funcao | cognitiva_total | cognitiva_max_funcao | divida_min | manutenibilidade | cobertura_pct | quality_gate |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-10T18:53:38.000Z | implement | app | 73ab8b34-a9d6-4112-9808-9e6555baab94 | sim | 0 | 0 | 35 | 0.0 | 553 | 9 | 144 | 7 | 195 | A | 97.9 | OK |
| 2026-11-10T18:54:24.000Z | implement | scripts | 840e9a69-7489-44f8-a442-9c0316f51fbb | sim | 0 | 0 | 9 | 0.0 | 461 | 10 | 207 | 12 | 45 | A | 80.3 | OK |
<!-- fim:sonar -->
