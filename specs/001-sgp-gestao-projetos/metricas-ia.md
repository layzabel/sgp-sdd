# Métricas de IA e Qualidade — 001-sgp-gestao-projetos

Arquivo gerado e mantido pelos scripts `metrics:ia` e `sonar`. Não editar à mão.
Fonte de tokens e custo: ccusage (relatório de sessões, `--offline`). Fonte de qualidade: SonarQube local.

## Medições de IA

<!-- tabela:ia -->
| data_hora | etapa | modelo | tokens_entrada | tokens_saida | tokens_cache_escrita | tokens_cache_leitura | custo_usd | prompts | rodadas_correcao | versao_ccusage | sessoes | tipo | observacao |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-10T14:34:06.095Z | constitution | claude-opus-5-5 | 22 | 13313 | 40598 | 488176 | 0.6887672000000001 | 2 | 1 | 20.0.46 | cfe35480-646f-428e-a1bf-c2c5f4482547 | no momento | |
| 2026-11-10T14:43:36.295Z | specify | claude-opus-5-5 | 16 | 15101 | 47391 | 434340 | 0.7680800000000001 | 1 | 0 | 20.0.46 | 582302c2-3a4f-4c4b-8a56-4f6d65e95aaf | no momento | |
| 2026-11-10T14:58:53.308Z | clarify | claude-opus-5-5 | 42 | 9010 | 46029 | 956811 | 0.7399621999999999 | 6 | 0 | 20.0.46 | 03c648aa-4560-4c84-9eab-b2d5a0cf2f88 | no momento | |
| 2026-11-10T15:07:36.414Z | plan | claude-opus-5-5 | 24 | 30684 | 74410 | 759600 | 1.3609759999999997 | 1 | 0 | 20.0.46 | c489a8c4-0645-4c5f-b9f6-b8965d764cfe | no momento | |
| 2026-11-10T15:14:00.280Z | tasks | claude-opus-5-5 | 18 | 36234 | 95568 | 587669 | 1.6068298 | 1 | 0 | 20.0.46 | c0be6ffa-bb94-467b-ba66-c18cf87d1d6b | no momento | |
| 2026-11-10T15:21:12.661Z | analyze | claude-opus-5-5 | 28 | 16036 | 86174 | 1046655 | 1.2195550000000002 | 2 | 1 | 20.0.46 | 095c28fc-3dd0-4221-bec4-60be6d4a912c | no momento | |
| 2026-11-10T18:37:07.985Z | implement | claude-opus-5-5 | 322 | 247670 | 442233 | 47777897 | 18.048131399999995 | 1 | 0 | 20.0.46 | 26afae8d-47e6-4e4b-8cb2-ee029d84cc81 | no momento | |
<!-- fim:ia -->

## Medições SonarQube

<!-- tabela:sonar -->
| data_hora | etapa | escopo | analise | linha_base | bugs | vulnerabilidades | code_smells | duplicacao_pct | ciclomatica_total | ciclomatica_max_funcao | cognitiva_total | cognitiva_max_funcao | divida_min | manutenibilidade | cobertura_pct | quality_gate |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-10T18:53:38.000Z | implement | app | 73ab8b34-a9d6-4112-9808-9e6555baab94 | sim | 0 | 0 | 35 | 0.0 | 553 | 9 | 144 | 7 | 195 | A | 97.9 | OK |
| 2026-11-10T18:54:24.000Z | implement | scripts | 840e9a69-7489-44f8-a442-9c0316f51fbb | sim | 0 | 0 | 9 | 0.0 | 461 | 10 | 207 | 12 | 45 | A | 80.3 | OK |
<!-- fim:sonar -->
