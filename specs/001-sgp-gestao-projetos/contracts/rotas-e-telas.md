# Contrato — Rotas e telas

Aplicação exportada estaticamente (research R1/R2). Todas as rotas são estáticas; o registro é
identificado por `?id=<uuid>`. Todas as telas exibem o **menu principal** (FR-031) com os links,
nesta ordem: Projetos, Times, Desenvolvedores, Usuários, Administradores. O link da seção atual
tem `aria-current="page"`.

## Rotas

| Rota | Tela | Título (`<h1>` / `document.title`) |
| ---- | ---- | ---------------------------------- |
| `/` | Início: atalhos para os cinco cadastros | "SGP — Início" |
| `/projetos` | Lista de projetos | "Projetos" |
| `/projetos/novo` | Formulário de cadastro | "Novo projeto" |
| `/projetos/detalhes?id=` | Detalhes + acompanhamento | "Projeto: {nome}" |
| `/projetos/editar?id=` | Formulário de edição | "Editar projeto" |
| `/times`, `/times/novo`, `/times/detalhes?id=`, `/times/editar?id=` | idem para times | "Times", "Novo time", "Time: {nome}", "Editar time" |
| `/desenvolvedores`, `/desenvolvedores/novo`, `…/detalhes?id=`, `…/editar?id=` | idem | "Desenvolvedores", … |
| `/usuarios`, `/usuarios/novo`, `…/detalhes?id=`, `…/editar?id=` | idem | "Usuários", … |
| `/administradores`, `/administradores/novo`, `…/detalhes?id=`, `…/editar?id=` | idem | "Administradores", … |

SC-002: menu → lista → detalhes do projeto = 2 interações; menu → lista → "Novo" = 2.

## Tela de lista (padrão para os cinco cadastros)

- Botão/link "Novo {entidade}" no topo.
- Campo de busca com rótulo explícito (ex.: "Buscar por nome ou e-mail"); atualiza a lista a
  cada digitação.
- Filtros (`<select>` com opção "Todos"): Desenvolvedores → Time, Nível; Projetos → Situação,
  Time.
- Contagem anunciada: "{n} registro(s) encontrado(s)" em `role="status"`.
- Lista completa, sem paginação, alfabética (FR-008).
- Colunas exibidas:
  - Administradores: Nome, E-mail, Cargo, Setor.
  - Usuários: Nome, E-mail, Organização.
  - Desenvolvedores: Nome, E-mail, Nível, Time.
  - Times: Nome, Área de atuação.
  - Projetos: Nome, Situação, Time, Início, Término previsto.
- O nome é um link para os detalhes.
- Estados vazios: "Nenhum {entidade} cadastrado." (+ link "Novo …") ou "Nenhum registro atende
  à busca e aos filtros." + botão "Limpar busca e filtros".

## Tela de detalhes

- Todos os campos com rótulo; opcionais vazios exibidos como "Não informado".
- Ações: "Editar" (link) e "Excluir" (botão → diálogo de confirmação).
- Registro inexistente: "Registro não encontrado." + link "Voltar para {lista}".
- **Time**: seções "Desenvolvedores do time" e "Projetos do time" (alfabéticas, com links).
- **Projeto**: dados + nome do time (link), e três seções, cada uma com formulário de criação
  logo acima da lista:
  - "Relatórios" — `<textarea>` "Texto do relatório" + "Adicionar relatório"; lista: data
    `dd/mm/aaaa` + texto (quebras de linha preservadas), mais recente primeiro.
  - "Marcos" — "Descrição do marco" + "Adicionar marco"; lista ordenada (`<ol>`) na ordem de
    criação.
  - "Cronograma" — "Atividade" + "Data prevista" + "Adicionar item"; lista com data
    `dd/mm/aaaa` + atividade, data crescente.
  - Nenhum botão de editar/excluir nesses itens (FR-030).
  - Após criar, o formulário da seção é limpo e a mensagem de sucesso é anunciada; em erro, o
    texto digitado é mantido.

## Formulário (cadastro e edição)

- `<form noValidate>`; cada campo com `<label>`; obrigatórios com " *" e legenda
  "* campo obrigatório" no topo (FR-033).
- `maxLength` não é usado para cortar o texto: o limite é validado e explicado (FR-040).
- Selects de enumeração e de time começam em "Selecione…" (sem valor).
- Datas: `<input type="date">`.
- Botões: "Salvar" (submit) e "Cancelar" (volta sem confirmação, FR-004).
- Ao salvar com erro de validação: mensagens sob os campos, `aria-invalid="true"`, foco no
  primeiro campo inválido, resumo em `role="alert"` ("Corrija os campos destacados.").
- Ao salvar com sucesso: navega para os detalhes do registro e mostra a mensagem de sucesso.
- Erro de gravação: mensagem em `role="alert"`, formulário permanece preenchido (FR-039).
- Desenvolvedor/Projeto sem times cadastrados: em vez do formulário, "É preciso cadastrar um
  time antes de cadastrar {desenvolvedores|projetos}." + link "Cadastrar time".

## Diálogo de confirmação de exclusão

- `<dialog>` modal com título, texto, botões "Excluir" e "Cancelar"; foco inicial em
  "Cancelar"; `Esc` = cancelar; ao fechar, foco volta ao botão "Excluir" da tela.
- Texto padrão: "Excluir {entidade} \"{nome}\"? Esta ação não pode ser desfeita."
- Projeto: acrescenta "Também serão excluídos {r} relatório(s), {m} marco(s) e {c} item(ns) de
  cronograma."
- Time com vínculos: o diálogo não é aberto; mostra a mensagem de bloqueio
  ([mensagens.md](mensagens.md)).
- Após excluir: navega para a lista com mensagem de sucesso.

## Mensagens de operação

Região de mensagens no layout, abaixo do `<h1>`: sucesso em `role="status"`, erro em
`role="alert"`, com botão "Fechar mensagem". A mensagem persiste até a próxima ação ou
navegação seguinte. Textos em [mensagens.md](mensagens.md).

## Responsividade e teclado

- ≥ 768 px: menu lateral; < 768 px: menu no topo, links quebram linha.
- < 640 px: tabelas viram listas de cartões (mesmos dados, mesma ordem).
- Sem rolagem horizontal a partir de 360 px.
- Link "Pular para o conteúdo" como primeiro elemento focável.
- Ordem de tabulação segue a ordem visual; foco visível em todos os elementos interativos.
