# Data Model — SGP (Fase 1)

**Feature**: [spec.md](spec.md) · **Plano**: [plan.md](plan.md) · **Pesquisa**: [research.md](research.md)

Todos os dados vivem num único documento JSON no `localStorage` (chave `sgp:dados`, ver
[contracts/repositorio.md](contracts/repositorio.md)). Os nomes de campo abaixo são os nomes no
código e no documento armazenado.

## Convenções comuns

| Item | Regra |
| ---- | ----- |
| `id` | `string` UUID v4, gerado na criação, imutável. |
| `seq` | `number` inteiro, gerado na criação a partir do contador global `seq` do documento; define a ordem de criação e desempates. Interno (não exibido, FR-002). |
| Texto | Antes de validar e salvar: `trim()`. Só espaços = vazio (FR-005). Opcional vazio é salvo como `''`. |
| Tamanho | Contado após o `trim()` (FR-040). |
| E-mail | Validado conforme FR-006 (ver research R6). Armazenado como digitado (após `trim`); comparado em minúsculas. |
| Unicidade | Comparação `toLocaleLowerCase('pt-BR')` após `trim`, ignorando o próprio registro em edição (FR-007). |
| Data sem hora | `string` `AAAA-MM-DD`; exibida `dd/mm/aaaa`. |

Limites de tamanho (FR-040): **L100** = 100, **L254** = 254, **L30** = 30, **L1000** = 1.000,
**L5000** = 5.000 caracteres.

## Entidades

### Administrador (`administradores`)

| Campo | Tipo | Obrig. | Regras |
| ----- | ---- | ------ | ------ |
| `nome` | string | sim | L100 |
| `email` | string | sim | L254, formato, único entre administradores |
| `telefone` | string | sim | L30, texto livre |
| `cargo` | string | sim | L100 |
| `setor` | string | sim | L100 |

Busca: `nome` **ou** `email` (FR-011). Sem vínculos; exclusão nunca bloqueada.

### Usuário (`usuarios`)

| Campo | Tipo | Obrig. | Regras |
| ----- | ---- | ------ | ------ |
| `nome` | string | sim | L100 |
| `email` | string | sim | L254, formato, único entre usuários |
| `telefone` | string | não | L30 |
| `organizacao` | string | não | L100 |

Busca: `nome` **ou** `organizacao` (FR-013). Sem vínculos.

### Desenvolvedor (`desenvolvedores`)

| Campo | Tipo | Obrig. | Regras |
| ----- | ---- | ------ | ------ |
| `nome` | string | sim | L100 |
| `email` | string | sim | L254, formato, único entre desenvolvedores |
| `telefone` | string | não | L30 |
| `cargo` | string | não | L100 |
| `nivel` | `'junior' \| 'pleno' \| 'senior'` | sim | rótulos "Júnior", "Pleno", "Sênior" (FR-015) |
| `tecnologia` | string | não | L100 (rótulo "Principal tecnologia") |
| `timeId` | string | sim | deve referenciar um time existente |

Busca: `nome`; filtros: `timeId`, `nivel` (FR-016). Relação: N desenvolvedores → 1 time.

### Time (`times`)

| Campo | Tipo | Obrig. | Regras |
| ----- | ---- | ------ | ------ |
| `nome` | string | sim | L100, único entre times (sem diferenciar maiúsculas/minúsculas) |
| `descricao` | string | não | L1000 |
| `area` | string | não | L100 (rótulo "Área de atuação") |

Busca: `nome` (FR-019). Derivados (não armazenados): desenvolvedores do time e projetos do time,
ambos em ordem alfabética (FR-008).

**Regra de exclusão (FR-020)**: bloqueada se `qtdDesenvolvedores > 0` ou `qtdProjetos > 0`;
retorna `{ tipo: 'vinculos', desenvolvedores: n, projetos: m }`.

### Projeto (`projetos`)

| Campo | Tipo | Obrig. | Regras |
| ----- | ---- | ------ | ------ |
| `nome` | string | sim | L100 (não único — spec não exige) |
| `descricao` | string | não | L1000 |
| `inicio` | string `AAAA-MM-DD` | sim | data válida |
| `terminoPrevisto` | string `AAAA-MM-DD` \| `''` | não | data válida; se informada, `>= inicio` (FR-022) |
| `situacao` | `'planejado' \| 'em_andamento' \| 'concluido' \| 'cancelado'` | sim | rótulos "Planejado", "Em andamento", "Concluído", "Cancelado" (FR-023) |
| `timeId` | string | sim | deve referenciar um time existente |

Busca: `nome`; filtros: `situacao`, `timeId` (FR-024). Relação: N projetos → 1 time; 1 projeto →
N relatórios, marcos, itens de cronograma.

**Regra de exclusão (FR-025)**: remove o projeto e todos os `relatorios`, `marcos` e
`itensCronograma` com `projetoId` igual, numa única gravação. A confirmação informa as
quantidades.

Sem regras de transição de `situacao` (Assumptions).

### Relatório (`relatorios`)

| Campo | Tipo | Obrig. | Regras |
| ----- | ---- | ------ | ------ |
| `projetoId` | string | sim | projeto existente |
| `texto` | string | sim | L5000 |
| `criadoEm` | string ISO 8601 (data e hora UTC) | auto | `new Date().toISOString()` (FR-026) |

Ordem (FR-027): `criadoEm` decrescente, desempate `seq` decrescente. Exibição: data local
`dd/mm/aaaa`. Imutável (FR-030).

### Marco (`marcos`)

| Campo | Tipo | Obrig. | Regras |
| ----- | ---- | ------ | ------ |
| `projetoId` | string | sim | projeto existente |
| `descricao` | string | sim | L100 |

Ordem (FR-028): `seq` crescente. Imutável.

### Item de cronograma (`itensCronograma`)

| Campo | Tipo | Obrig. | Regras |
| ----- | ---- | ------ | ------ |
| `projetoId` | string | sim | projeto existente |
| `atividade` | string | sim | L100 |
| `dataPrevista` | string `AAAA-MM-DD` | sim | data válida |

Ordem (FR-029): `dataPrevista` crescente, desempate `seq` crescente. Imutável.

## Diagrama de relações

```text
Time 1 ──── 0..N Desenvolvedor        (exclusão de Time bloqueada se N > 0)
Time 1 ──── 0..N Projeto              (exclusão de Time bloqueada se N > 0)
Projeto 1 ── 0..N Relatório           (excluídos em cascata com o Projeto)
Projeto 1 ── 0..N Marco               (excluídos em cascata com o Projeto)
Projeto 1 ── 0..N ItemCronograma      (excluídos em cascata com o Projeto)
Administrador, Usuário                (sem relações)
```

## Validação: mensagens por regra

Mensagens exibidas junto ao campo (FR-032), em pt-BR, explicando como corrigir:

| Regra | Mensagem |
| ----- | -------- |
| obrigatório | "Informe {rótulo}." (ex.: "Informe o nome.") |
| tamanho | "{Rótulo} deve ter no máximo {N} caracteres." |
| e-mail inválido | "Informe um e-mail válido, como nome@empresa.com." |
| e-mail repetido | "Este e-mail já está em uso por outro {administrador\|usuário\|desenvolvedor}." |
| nome de time repetido | "Já existe um time com esse nome. Escolha outro nome." |
| opção inválida | "Selecione {rótulo}." |
| time inexistente | "Selecione um time cadastrado." |
| data inválida | "Informe uma data válida." |
| término antes do início | "A data de término prevista não pode ser anterior à data de início." |

Catálogo completo (incluindo mensagens de operação) em
[contracts/mensagens.md](contracts/mensagens.md).

## Estados

Nenhuma entidade tem máquina de estados. `situacao` do projeto é um atributo livre. Relatórios,
marcos e itens de cronograma têm apenas o estado "criado" (sem edição ou exclusão individual).
