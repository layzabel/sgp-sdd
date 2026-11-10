# Feature Specification: SGP — Sistema Web de Gerenciamento de Projetos de Software

**Feature Branch**: `001-sgp-gestao-projetos`

**Created**: 2026-11-10

**Status**: Draft

**Input**: User description: "Aplicação web de gerenciamento de projetos de software (SGP), usada no computador por uma equipe de administração para organizar as pessoas envolvidas nos projetos, os times de desenvolvimento e os projetos em andamento, com o registro de relatórios, marcos e cronograma de cada projeto. Todas as funções são operadas pelo administrador do sistema." (a descrição completa fornecida inclui: cadastros de Administradores, Usuários, Desenvolvedores, Times e Projetos; acompanhamento do projeto com relatórios, marcos e cronograma; navegação e interface; dados somente no navegador; itens fora do escopo).

## User Scenarios & Testing *(mandatory)*

O único ator é o **administrador do sistema**, que opera todas as funções sem login. As histórias estão em ordem de prioridade; cada uma pode ser testada e demonstrada de forma independente (quando uma história depende de um time já cadastrado, o teste parte de um time existente).

### User Story 1 - Gerenciar times (Priority: P1)

O administrador cadastra os times de desenvolvimento (nome, descrição e área de atuação), consulta a lista com busca por nome, vê os detalhes de um time — incluindo os desenvolvedores do time e os projetos sob responsabilidade dele —, atualiza os dados e exclui times que não têm vínculos.

**Why this priority**: os times são pré-requisito de desenvolvedores e projetos; sem eles nenhum outro cadastro principal pode ser concluído.

**Independent Test**: com a aplicação vazia, cadastrar, buscar, editar e excluir um time; fechar e reabrir a aplicação e confirmar que os dados persistiram.

**Acceptance Scenarios**:

1. **Given** não existe time com o nome "Plataforma", **When** o administrador cadastra o time "Plataforma" com descrição e área de atuação, **Then** o sistema exibe mensagem de sucesso e o time aparece na lista.
2. **Given** existe o time "Plataforma", **When** o administrador tenta cadastrar outro time com o nome "plataforma", **Then** o sistema não salva e exibe mensagem de erro no campo nome informando que já existe um time com esse nome.
3. **Given** o administrador está no formulário de cadastro, **When** tenta salvar com o nome vazio ou contendo apenas espaços, **Then** o sistema não salva e indica que o nome é obrigatório.
4. **Given** existem os times "Plataforma" e "Mobile", **When** o administrador busca por "plat", **Then** a lista mostra apenas "Plataforma".
5. **Given** o time "Plataforma" tem 2 desenvolvedores e 1 projeto, **When** o administrador abre os detalhes do time, **Then** vê os dados do time, a lista dos 2 desenvolvedores e a lista do projeto.
6. **Given** o time "Plataforma" tem desenvolvedores ou projetos vinculados, **When** o administrador tenta excluí-lo, **Then** o sistema não exclui e exibe mensagem explicando que o time possui desenvolvedores e/ou projetos vinculados, informando quantos.
7. **Given** o time "Mobile" não tem vínculos, **When** o administrador solicita a exclusão e confirma, **Then** o time é removido e uma mensagem de sucesso é exibida; **When** o administrador cancela a confirmação, **Then** o time permanece inalterado.
8. **Given** um time foi cadastrado, **When** o administrador fecha e reabre a aplicação no mesmo navegador, **Then** o time continua cadastrado com os mesmos dados.

---

### User Story 2 - Gerenciar projetos (Priority: P1)

O administrador cadastra projetos (nome, descrição, data de início, data de término prevista, situação e time responsável), consulta a lista com busca por nome e filtros por situação e por time, vê os detalhes, atualiza e exclui projetos.

**Why this priority**: o projeto é o objeto central do sistema; junto com os times, forma o menor produto útil (MVP).

**Independent Test**: com um time cadastrado, cadastrar, consultar (busca e filtros), editar e excluir um projeto.

**Acceptance Scenarios**:

1. **Given** existe o time "Plataforma", **When** o administrador cadastra o projeto "Portal do Cliente" com data de início 01/03/2026, situação "planejado" e time "Plataforma", **Then** o sistema exibe mensagem de sucesso e o projeto aparece na lista.
2. **Given** o administrador está no formulário de projeto, **When** tenta salvar sem nome, sem data de início, sem situação ou sem time responsável, **Then** o sistema não salva e indica cada campo obrigatório não preenchido.
3. **Given** a data de início é 10/03/2026, **When** o administrador informa data de término prevista 09/03/2026 e salva, **Then** o sistema não salva e indica no campo de data de término prevista que ela não pode ser anterior à data de início.
4. **Given** a data de início é 10/03/2026, **When** o administrador informa data de término prevista 10/03/2026 ou deixa a data de término vazia, **Then** o projeto é salvo.
5. **Given** não há times cadastrados, **When** o administrador abre o formulário de projeto, **Then** o sistema informa que é preciso cadastrar um time antes e oferece acesso ao cadastro de times.
6. **Given** existem projetos de times e situações diferentes, **When** o administrador combina busca por nome, filtro de situação e filtro de time, **Then** a lista mostra apenas os projetos que atendem a todos os critérios ao mesmo tempo.
7. **Given** um projeto existe, **When** o administrador o edita trocando a situação para "em andamento" e o time responsável para outro time cadastrado, **Then** as alterações são salvas e refletidas na lista, nos detalhes do projeto e nos detalhes dos dois times.
8. **Given** um projeto tem relatórios, marcos e itens de cronograma, **When** o administrador solicita a exclusão, **Then** o sistema pede confirmação avisando que os relatórios, marcos e cronograma também serão excluídos; ao confirmar, o projeto e todo o seu acompanhamento são removidos.

---

### User Story 3 - Acompanhar o projeto (relatórios, marcos e cronograma) (Priority: P2)

Nos detalhes de um projeto, o administrador registra relatórios de acompanhamento (texto livre), marcos (descrição) e itens de cronograma (atividade e data prevista), e visualiza cada um desses registros na ordem definida.

**Why this priority**: é o principal valor de acompanhamento do SGP, mas depende de projetos já existirem.

**Independent Test**: com um projeto cadastrado, criar relatórios, marcos e itens de cronograma e verificar a ordem de exibição nos detalhes do projeto.

**Acceptance Scenarios**:

1. **Given** um projeto sem relatórios, **When** o administrador cria um relatório com texto, **Then** o relatório aparece nos detalhes do projeto com a data de criação.
2. **Given** um projeto com relatórios criados em 05/03, 10/03 e 12/03, **When** o administrador abre os detalhes, **Then** os relatórios aparecem na ordem 12/03, 10/03, 05/03 (mais recente primeiro).
3. **Given** o administrador está criando um relatório, um marco ou um item de cronograma, **When** tenta salvar com o texto, a descrição, a atividade ou a data prevista vazios, **Then** o sistema não salva e indica o campo obrigatório.
4. **Given** o administrador cria os marcos "Kickoff", "Protótipo" e "Entrega" nessa ordem, **When** abre os detalhes, **Then** os marcos aparecem na ordem "Kickoff", "Protótipo", "Entrega".
5. **Given** o administrador cria itens de cronograma com datas previstas 20/04, 05/04 e 12/04, **When** abre os detalhes, **Then** os itens aparecem na ordem 05/04, 12/04, 20/04.
6. **Given** um relatório, marco ou item de cronograma já foi criado, **When** o administrador o visualiza, **Then** não há opção para editá-lo ou excluí-lo.

---

### User Story 4 - Gerenciar desenvolvedores (Priority: P2)

O administrador cadastra desenvolvedores (nome, e-mail, telefone, cargo, nível, principal tecnologia e time), consulta a lista com busca por nome e filtros por time e por nível, vê os detalhes, atualiza (inclusive trocando o time) e exclui desenvolvedores.

**Why this priority**: compõe os times, mas o acompanhamento de projetos funciona sem ele.

**Independent Test**: com um time cadastrado, cadastrar, consultar (busca e filtros), editar (trocando o time) e excluir um desenvolvedor.

**Acceptance Scenarios**:

1. **Given** existe o time "Plataforma", **When** o administrador cadastra um desenvolvedor com nome, e-mail válido, nível "pleno" e time "Plataforma", **Then** o sistema exibe mensagem de sucesso e o desenvolvedor aparece na lista e nos detalhes do time.
2. **Given** o administrador está no formulário, **When** tenta salvar sem nome, e-mail, nível ou time, **Then** o sistema não salva e indica cada campo obrigatório não preenchido.
3. **Given** o administrador informa o e-mail "ana@empresa", **When** tenta salvar, **Then** o sistema não salva e indica que o e-mail é inválido.
4. **Given** já existe um desenvolvedor com o e-mail "ana@empresa.com", **When** o administrador cadastra ou edita outro desenvolvedor com o e-mail "Ana@Empresa.com", **Then** o sistema não salva e indica que o e-mail já está em uso por outro desenvolvedor.
5. **Given** existem desenvolvedores de níveis e times diferentes, **When** o administrador combina busca por nome, filtro de time e filtro de nível, **Then** a lista mostra apenas os que atendem a todos os critérios.
6. **Given** um desenvolvedor pertence ao time "Plataforma", **When** o administrador troca o time para "Mobile" e salva, **Then** o desenvolvedor passa a aparecer nos detalhes de "Mobile" e deixa de aparecer nos detalhes de "Plataforma".
7. **Given** um desenvolvedor existe, **When** o administrador solicita a exclusão e confirma, **Then** ele é removido da lista e dos detalhes do time.

---

### User Story 5 - Gerenciar administradores (Priority: P3)

O administrador cadastra as pessoas que administram os projetos (nome, e-mail, telefone, cargo e setor), consulta a lista com busca por nome ou e-mail, vê os detalhes, atualiza e exclui registros.

**Why this priority**: cadastro de apoio; não é usado por outras funções (não há login nem vínculo com projetos).

**Independent Test**: cadastrar, buscar por nome e por e-mail, editar e excluir um administrador.

**Acceptance Scenarios**:

1. **Given** o formulário de administrador, **When** o administrador preenche todos os campos com e-mail válido e salva, **Then** o registro aparece na lista com mensagem de sucesso.
2. **Given** o formulário de administrador, **When** qualquer um dos cinco campos fica vazio, **Then** o sistema não salva e indica cada campo obrigatório não preenchido.
3. **Given** já existe um administrador com o e-mail "joao@empresa.com", **When** outro administrador é cadastrado ou editado com o mesmo e-mail, **Then** o sistema não salva e indica que o e-mail já está em uso.
4. **Given** existem administradores, **When** o administrador busca por parte do nome ou do e-mail, **Then** a lista mostra apenas os registros correspondentes.
5. **Given** um administrador existe, **When** a exclusão é solicitada e cancelada, **Then** o registro permanece; **When** é confirmada, **Then** o registro é removido.

---

### User Story 6 - Gerenciar usuários (Priority: P3)

O administrador cadastra as pessoas que acompanham os projetos, como clientes e solicitantes (nome, e-mail, telefone e organização), consulta a lista com busca por nome ou organização, vê os detalhes, atualiza e exclui registros.

**Why this priority**: cadastro de apoio, sem vínculo com as demais funções.

**Independent Test**: cadastrar, buscar por nome e por organização, editar e excluir um usuário.

**Acceptance Scenarios**:

1. **Given** o formulário de usuário, **When** o administrador informa nome e e-mail válido (telefone e organização vazios) e salva, **Then** o usuário é cadastrado com mensagem de sucesso.
2. **Given** o formulário de usuário, **When** nome ou e-mail ficam vazios, ou o e-mail é inválido, **Then** o sistema não salva e indica o campo com problema.
3. **Given** já existe um usuário com o e-mail "maria@cliente.com", **When** outro usuário é cadastrado ou editado com o mesmo e-mail, **Then** o sistema não salva e indica que o e-mail já está em uso.
4. **Given** existem usuários de organizações diferentes, **When** o administrador busca por parte do nome ou da organização, **Then** a lista mostra apenas os registros correspondentes.
5. **Given** um usuário existe, **When** a exclusão é confirmada, **Then** o registro é removido.

---

### Edge Cases

- **Campos só com espaços**: valores formados apenas por espaços são tratados como vazios; espaços no início e no fim são removidos antes de salvar e de comparar unicidade.
- **Unicidade sem diferenciar maiúsculas/minúsculas**: "Plataforma" e "plataforma" são o mesmo nome de time; "Ana@Empresa.com" e "ana@empresa.com" são o mesmo e-mail.
- **Unicidade por cadastro**: o mesmo e-mail pode existir em cadastros diferentes (por exemplo, um administrador e um usuário com o mesmo e-mail); a regra de não repetição vale dentro de cada cadastro.
- **Editar sem alterar o e-mail ou o nome**: salvar um registro mantendo o próprio e-mail (ou o próprio nome de time) não é tratado como duplicidade.
- **Nenhum time cadastrado**: os formulários de desenvolvedor e de projeto informam que é preciso cadastrar um time antes e oferecem acesso ao cadastro de times.
- **Listas vazias e buscas sem resultado**: o sistema mostra uma mensagem indicando que não há registros cadastrados ou que nenhum registro atende aos critérios, com opção de limpar a busca e os filtros.
- **Datas iguais**: data de término prevista igual à data de início é aceita; itens de cronograma com a mesma data prevista aparecem na ordem em que foram criados.
- **Relatórios no mesmo dia**: relatórios criados na mesma data aparecem do mais recente para o mais antigo de acordo com o momento de criação.
- **Registro inexistente**: ao acessar os detalhes de um registro que não existe mais (por exemplo, por um endereço salvo), o sistema informa que o registro não foi encontrado e oferece retorno à lista.
- **Falha ao salvar no navegador**: se o armazenamento do navegador estiver indisponível ou cheio, o sistema exibe mensagem de erro, não perde os dados já salvos e mantém o formulário preenchido para nova tentativa.
- **Abandonar o formulário**: cancelar um cadastro ou edição não altera nenhum dado salvo.

## Requirements *(mandatory)*

### Functional Requirements

**Regras gerais**

- **FR-001**: O sistema DEVE permitir cadastrar, consultar (lista e detalhes), atualizar e excluir registros em cada um dos cinco cadastros: Administradores, Usuários, Desenvolvedores, Times e Projetos.
- **FR-002**: Cada cadastro DEVE conter exatamente os campos definidos na seção Key Entities, sem campos adicionais visíveis ao administrador.
- **FR-003**: A atualização de qualquer registro DEVE aplicar as mesmas validações do cadastro.
- **FR-004**: Toda exclusão DEVE exigir confirmação explícita do administrador; cancelar a confirmação NÃO DEVE alterar dados.
- **FR-005**: O sistema DEVE remover espaços no início e no fim dos campos de texto antes de validar e salvar, e DEVE tratar como vazio um campo formado só por espaços.
- **FR-006**: O sistema DEVE validar o formato do e-mail (parte local, "@" e domínio com ao menos um ponto, sem espaços) em todos os cadastros que têm e-mail.
- **FR-007**: As verificações de unicidade (e-mail dentro de cada cadastro de pessoas e nome de time) NÃO DEVEM diferenciar maiúsculas de minúsculas e DEVEM desconsiderar o próprio registro em edição.
- **FR-008**: As buscas por texto DEVEM localizar registros pelo trecho digitado em qualquer posição do campo, sem diferenciar maiúsculas/minúsculas nem acentos; buscas e filtros de uma mesma lista DEVEM ser combinados (todos os critérios ao mesmo tempo).
- **FR-009**: Dados inválidos NÃO DEVEM ser salvos.

**Administradores**

- **FR-010**: O cadastro de administrador DEVE exigir nome, e-mail, telefone, cargo e setor, com e-mail válido e não repetido entre administradores.
- **FR-011**: A consulta de administradores DEVE oferecer busca por nome ou por e-mail e visualização dos detalhes.

**Usuários**

- **FR-012**: O cadastro de usuário DEVE exigir nome e e-mail, com e-mail válido e não repetido entre usuários; telefone e organização são opcionais.
- **FR-013**: A consulta de usuários DEVE oferecer busca por nome ou por organização e visualização dos detalhes.

**Desenvolvedores**

- **FR-014**: O cadastro de desenvolvedor DEVE exigir nome, e-mail, nível e time, com e-mail válido e não repetido entre desenvolvedores; telefone, cargo e principal tecnologia são opcionais.
- **FR-015**: O nível DEVE ser escolhido entre "Júnior", "Pleno" e "Sênior", e o time DEVE ser escolhido entre os times cadastrados.
- **FR-016**: A consulta de desenvolvedores DEVE oferecer busca por nome, filtro por time, filtro por nível e visualização dos detalhes, incluindo o nome do time.
- **FR-017**: A atualização de desenvolvedor DEVE permitir trocar o time por outro time cadastrado.

**Times**

- **FR-018**: O cadastro de time DEVE exigir nome único; descrição e área de atuação são opcionais.
- **FR-019**: A consulta de times DEVE oferecer busca por nome; os detalhes DEVEM mostrar os dados do time, os desenvolvedores do time e os projetos sob responsabilidade dele.
- **FR-020**: A exclusão de um time DEVE ser bloqueada enquanto houver desenvolvedores ou projetos vinculados a ele, com mensagem que explica o motivo e informa a quantidade de desenvolvedores e de projetos vinculados; sem vínculos, a exclusão segue a confirmação de FR-004.

**Projetos**

- **FR-021**: O cadastro de projeto DEVE exigir nome, data de início, situação e time responsável; descrição e data de término prevista são opcionais.
- **FR-022**: A data de término prevista, quando informada, NÃO DEVE ser anterior à data de início.
- **FR-023**: A situação DEVE ser escolhida entre "Planejado", "Em andamento", "Concluído" e "Cancelado", e o time responsável DEVE ser escolhido entre os times cadastrados.
- **FR-024**: A consulta de projetos DEVE oferecer busca por nome, filtro por situação, filtro por time e visualização dos detalhes, que DEVEM mostrar os dados do projeto, o nome do time responsável, os relatórios, os marcos e o cronograma.
- **FR-025**: A exclusão de projeto DEVE informar na confirmação que os relatórios, marcos e itens de cronograma do projeto também serão excluídos e, ao ser confirmada, DEVE excluí-los junto com o projeto.

**Acompanhamento do projeto**

- **FR-026**: Nos detalhes de um projeto, o administrador DEVE poder criar relatórios com texto livre obrigatório; o sistema DEVE registrar automaticamente a data e o momento de criação.
- **FR-027**: Os relatórios DEVEM ser exibidos do mais recente para o mais antigo, cada um com a data de criação.
- **FR-028**: Nos detalhes de um projeto, o administrador DEVE poder criar marcos com descrição obrigatória; os marcos DEVEM ser exibidos na ordem de criação.
- **FR-029**: Nos detalhes de um projeto, o administrador DEVE poder adicionar itens de cronograma, cada um com atividade e data prevista obrigatórias; os itens DEVEM ser exibidos em ordem crescente de data prevista e, em caso de empate, na ordem de criação.
- **FR-030**: Relatórios, marcos e itens de cronograma NÃO DEVEM poder ser editados nem excluídos individualmente depois de criados.

**Navegação e interface**

- **FR-031**: O sistema DEVE ter um menu principal, acessível em todas as telas, com acesso a Administradores, Usuários, Desenvolvedores, Times e Projetos.
- **FR-032**: Toda operação de cadastro, atualização, exclusão e criação DEVE exibir mensagem clara de sucesso ou de erro; mensagens de erro de validação DEVEM aparecer junto ao campo com problema e explicar como corrigi-lo.
- **FR-033**: Os formulários DEVEM indicar visualmente quais campos são obrigatórios.
- **FR-034**: O layout DEVE ser pensado para computador e continuar funcional em telas menores, sem perda de conteúdo ou de funcionalidade.
- **FR-035**: Toda funcionalidade DEVE ser operável por teclado, com foco visível e rótulos em todos os campos, atendendo WCAG 2.1 nível AA.
- **FR-036**: Toda a interface, incluindo mensagens, DEVE estar em português do Brasil, com datas no formato dd/mm/aaaa.

**Dados**

- **FR-037**: Todos os dados DEVEM ser armazenados somente no navegador do administrador; o sistema NÃO DEVE enviar dados a servidores ou a terceiros (incluindo analytics, telemetria e relatórios de erro remotos).
- **FR-038**: Os dados DEVEM permanecer salvos ao fechar e reabrir a aplicação no mesmo navegador.
- **FR-039**: Se não for possível salvar no armazenamento do navegador, o sistema DEVE informar o erro, preservar os dados já salvos e manter o formulário preenchido.

### Key Entities *(include if feature involves data)*

- **Administrador**: pessoa que administra os projetos. Campos: nome, e-mail, telefone, cargo, setor (todos obrigatórios). E-mail único entre administradores. Sem vínculo com outros cadastros.
- **Usuário**: pessoa que acompanha os projetos (cliente, solicitante). Campos: nome e e-mail (obrigatórios), telefone e organização (opcionais). E-mail único entre usuários. Sem vínculo com outros cadastros.
- **Desenvolvedor**: membro de um time. Campos: nome, e-mail, nível (Júnior, Pleno ou Sênior) e time (obrigatórios); telefone, cargo e principal tecnologia (opcionais). E-mail único entre desenvolvedores. Pertence a exatamente um time.
- **Time**: time de desenvolvimento. Campos: nome (obrigatório e único), descrição e área de atuação (opcionais). Tem zero ou mais desenvolvedores e é responsável por zero ou mais projetos.
- **Projeto**: projeto de software. Campos: nome, data de início, situação (Planejado, Em andamento, Concluído ou Cancelado) e time responsável (obrigatórios); descrição e data de término prevista (opcionais, término ≥ início). Pertence a exatamente um time; possui relatórios, marcos e itens de cronograma, que são excluídos junto com ele.
- **Relatório**: registro de acompanhamento de um projeto. Campos: texto (obrigatório) e data de criação (registrada automaticamente). Imutável após criado.
- **Marco**: marco de um projeto. Campo: descrição (obrigatória); mantém a ordem de criação. Imutável após criado.
- **Item de cronograma**: atividade planejada de um projeto. Campos: atividade e data prevista (obrigatórios); mantém a ordem de criação para desempate. Imutável após criado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O administrador consegue cadastrar um time e, em seguida, um projeto vinculado a ele em menos de 2 minutos, sem ajuda.
- **SC-002**: Qualquer cadastro ou a tela de detalhes de qualquer projeto pode ser alcançado a partir do menu principal com no máximo 3 interações.
- **SC-003**: 100% dos registros salvos continuam disponíveis e inalterados após fechar e reabrir a aplicação no mesmo navegador.
- **SC-004**: Nenhum dado do sistema é transmitido para fora do navegador durante o uso (0 envios observados ao inspecionar o tráfego de rede em todos os fluxos).
- **SC-005**: 100% das tentativas de salvar dados inválidos (campo obrigatório vazio, e-mail inválido, e-mail ou nome de time repetido, término antes do início) são bloqueadas e exibem mensagem que identifica o campo com problema.
- **SC-006**: Com até 500 registros em um cadastro, a lista é atualizada após busca ou filtro em até 1 segundo, percebida como imediata pelo administrador.
- **SC-007**: Todos os fluxos das histórias de usuário podem ser concluídos somente com o teclado e sem perda de conteúdo em telas a partir de 360 px de largura, e a interface atende WCAG 2.1 nível AA.
- **SC-008**: Em teste com administradores, pelo menos 90% conseguem concluir na primeira tentativa as tarefas de cadastrar um projeto e registrar um relatório, um marco e um item de cronograma nele.

## Assumptions

- Há um único administrador operando o sistema em um navegador de computador por vez; uso simultâneo em várias abas ou computadores não é tratado.
- Os dados ficam vinculados ao navegador e ao computador em que foram criados; limpar os dados do navegador apaga os dados do SGP, e não há backup, exportação ou importação (fora do escopo).
- Telefone é um texto livre, sem validação de formato, por não haver exigência na descrição.
- Usuários e administradores são cadastros independentes, sem vínculo com projetos, times ou desenvolvedores, pois a descrição não define relação entre eles.
- Não há regras de transição de situação do projeto: qualquer situação pode ser escolhida a qualquer momento, e as datas de início e de término prevista podem estar no passado ou no futuro.
- A exclusão de administradores, usuários e desenvolvedores não é bloqueada por vínculos, pois nenhum outro registro depende deles.
- "Criar cronograma do projeto" significa adicionar itens de cronograma um a um nos detalhes do projeto.
- A data de criação dos relatórios é registrada pelo relógio do computador do administrador.
- "Telas menores" significa larguras a partir de 360 px.
- O sistema deve funcionar nas duas versões estáveis mais recentes de Chrome, Edge e Firefox, conforme a constituição do projeto.
- Os limites de tamanho dos campos de texto seguem valores usuais (por exemplo, nomes até 100 caracteres e textos longos até alguns milhares de caracteres) e serão fixados no planejamento.
