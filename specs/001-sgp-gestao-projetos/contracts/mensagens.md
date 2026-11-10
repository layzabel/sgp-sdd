# Contrato — Mensagens da interface (pt-BR)

Textos fixos que os testes E2E e de componente verificam. `{x}` são substituições. Mensagens de
validação de campo estão em [../data-model.md](../data-model.md#validação-mensagens-por-regra).

## Sucesso

| Operação | Mensagem |
| -------- | -------- |
| Cadastro | "{Entidade} cadastrado com sucesso." ({Entidade} ∈ Administrador, Usuário, Desenvolvedor, Time, Projeto — todos masculinos) |
| Atualização | "{Entidade} atualizado com sucesso." |
| Exclusão | "{Entidade} excluído com sucesso." |
| Projeto excluído | "Projeto excluído com sucesso, junto com seus relatórios, marcos e cronograma." |
| Relatório criado | "Relatório adicionado com sucesso." |
| Marco criado | "Marco adicionado com sucesso." |
| Item de cronograma criado | "Item de cronograma adicionado com sucesso." |

## Erro

| Situação | Mensagem |
| -------- | -------- |
| Validação (resumo) | "Não foi possível salvar. Corrija os campos destacados." |
| Falha de gravação | "Não foi possível salvar os dados no navegador (armazenamento cheio ou indisponível). Nada foi alterado. Libere espaço ou verifique as permissões do navegador e tente novamente." |
| Falha de gravação na exclusão | "Não foi possível excluir: o armazenamento do navegador está cheio ou indisponível. Nada foi alterado." |
| Time com vínculos | "Não é possível excluir o time \"{nome}\": ele possui {d} desenvolvedor(es) e {p} projeto(s) vinculados. Transfira ou exclua esses registros antes." |
| Registro não encontrado | "Registro não encontrado. Ele pode ter sido excluído." |
| Sem times (desenvolvedor) | "É preciso cadastrar um time antes de cadastrar desenvolvedores." |
| Sem times (projeto) | "É preciso cadastrar um time antes de cadastrar projetos." |
| Dados ilegíveis | "Os dados salvos neste navegador não puderam ser lidos. Nenhuma alteração será gravada para não perder informações." |
| Armazenamento indisponível | "O armazenamento do navegador está indisponível. Verifique se o navegador permite salvar dados deste site." |

## Rótulos de enumeração

| Valor | Rótulo |
| ----- | ------ |
| `junior` / `pleno` / `senior` | Júnior / Pleno / Sênior |
| `planejado` / `em_andamento` / `concluido` / `cancelado` | Planejado / Em andamento / Concluído / Cancelado |

## Formatos

- Datas: `dd/mm/aaaa` em todas as telas (FR-036).
- Campo opcional vazio nos detalhes: "Não informado".
