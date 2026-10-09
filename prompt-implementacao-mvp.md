# Prompt de implementação do MVP

Use este documento como instrução para implementar a aplicação no repositório aberto no VSCode. Ele traduz o planejamento em uma primeira versão testável; não comprova demanda nem define o modelo comercial definitivo.

## Papel e forma de trabalhar

Você é meu parceiro de desenvolvimento. Estou aprendendo programação com IA e preciso entender as decisões essenciais. Implemente o produto em etapas pequenas e verificáveis.

Antes de editar, leia as instruções do repositório, examine os arquivos e identifique código existente. Preserve alterações do usuário. Se houver uma aplicação iniciada, adapte-se à arquitetura dela. Se o repositório estiver vazio, use a base sugerida abaixo.

Apresente um plano curto e prossiga com a implementação autorizada. Pergunte apenas quando faltar uma decisão indispensável. Não publique, contrate serviços, envie mensagens a pessoas ou crie recursos externos sem autorização. Prepare a aplicação e as instruções de configuração; solicite credenciais ou configurações apenas quando forem necessárias. Nunca peça segredos no chat nem os versione.

Verifique a documentação oficial das dependências usadas e escolha versões estáveis e compatíveis. Registre as versões no arquivo de lock. Ao terminar cada etapa, informe o que funciona, o que foi verificado e o que falta.

## Contexto e dor

Projeto final do curso Programação com IA Santander: construir um MVP pequeno, publicar a aplicação posteriormente e entregar um repositório público com documentação e evidências de funcionamento.

Estudantes universitários de tecnologia têm dificuldade para escolher materiais complementares alinhados aos tópicos da disciplina, ao conhecimento prévio e ao tempo disponível. Encontram opções superficiais, extensas demais ou inadequadas à necessidade acadêmica e perdem tempo e dinheiro avaliando alternativas.

O público inclui estudantes de cursos presenciais, semipresenciais e EAD. Começaremos com conteúdos de IA para limitar a curadoria, sem definir a modalidade de ensino como requisito de acesso.

## Tese do MVP

Recomendações contextualizadas, com justificativas e experiências reais de estudantes, ajudam a escolher materiais adequados com menos esforço. Uma parcela dos usuários pode pagar pela seleção personalizada.

O valor está em escolher materiais existentes. Não construir geração de cursos, um tutor de IA ou um organizador completo de estudos nesta versão.

## Modelo comercial em teste

- Consulta básica e contribuição de avaliações gratuitas.
- Seleção personalizada por demanda como hipótese principal.
- R$ 19,90 é um preço experimental por seleção, configurável, não uma assinatura.
- No piloto, alguns pedidos podem receber acesso gratuito, identificado como benefício experimental.
- Não adicionar assinatura, checkout, cobrança automática ou integração com pagamentos neste MVP.
- O responsável atende e combina eventual pagamento manualmente, fora da aplicação. A aplicação registra o resultado informado pelo administrador; não verifica a transação financeira.
- Materiais recomendados podem ser gratuitos ou pagos por seus próprios fornecedores. Pagar pela nossa seleção não compra acesso a esses materiais.

## Escopo funcional

### 1. Landing page

Explicar em português brasileiro a dor, a proposta e o funcionamento em três passos: informar a necessidade, receber opções contextualizadas, estudar e avaliar.

Chamadas principais: "Explorar materiais" e "Solicitar seleção personalizada".

Explicar a diferença entre consulta gratuita e serviço personalizado. Exibir o preço experimental e informar que a solicitação não efetua cobrança. Permitir que o administrador configure a oferta e o acesso de piloto.

Não inventar depoimentos, número de usuários, economia de tempo, parcerias, avaliações ou resultados de validação.

### 2. Catálogo gratuito

Acesso público sem login. Permitir busca e filtros simples por tópico de IA, nível, formato e gratuito/pago. Não adicionar filtros cujos dados não existam.

Cada material deve apresentar:

- Título, autor ou instituição e endereço original.
- Tópicos cobertos e limites do conteúdo.
- Nível e conhecimentos prévios necessários.
- Formato: artigo, vídeo, curso, livro ou outro formato cadastrado.
- Idioma.
- Duração do conteúdo, quando conhecida, e estimativa de estudo, quando disponível, com a distinção explícita.
- Gratuito, pago ou parcialmente gratuito; preço externo é opcional, acompanhado de data de consulta.
- Data da última revisão do cadastro.
- Comentário da curadoria, identificado separadamente das avaliações dos estudantes.

Não estimar duração, custo ou cobertura como se fossem dados verificados. Exibir "Não informado" quando necessário. Abrir links externos com segurança e deixar claro quando o estudante sairá da aplicação.

### 3. Avaliações dos estudantes

Leitura pública das avaliações aprovadas. Para contribuir, exigir conta autenticada.

Solicitar: se utilizou o material, disciplina e tópicos em que ajudou, contexto ou nível de estudo, pontos positivos, limitações e se recomenda para esse contexto. Instituição pode ser opcional e não deve ser tratada como verificada.

Não afirmar que alguém cursou uma disciplina sem comprovação. Identificar informações autodeclaradas quando pertinente. Permitir nome de exibição e não publicar e-mail.

Novas avaliações entram como pendentes e aparecem publicamente apenas após aprovação. Sem avaliações disponíveis, mostrar um estado vazio honesto; não gerar avaliações com IA. A curadoria inicial não se apresenta como experiência de alunos.

### 4. Solicitação personalizada

Exigir autenticação antes de enviar; preservar os dados já preenchidos durante o fluxo de login.

Formulário:

- Disciplina e tópicos que precisa estudar.
- Objetivo: prova, trabalho, compreensão do assunto ou outro.
- Nível de conhecimento e pré-requisitos que já domina.
- Prazo opcional e horas disponíveis para estudar.
- Preferências de formato e idioma.
- Orçamento para materiais externos, incluindo a opção somente gratuitos.
- Materiais já experimentados e o que não funcionou, opcional.
- Observações opcionais.
- Contato: e-mail da conta e WhatsApp opcional, com escolha do canal preferido.

Pedir apenas os tópicos necessários. Upload de PDFs e armazenamento de material da faculdade ficam fora do MVP.

Validar os campos no cliente e no servidor. Após envio, mostrar confirmação, condições da oferta e acompanhamento. Não prometer entrega instantânea ou prazo que não esteja configurado pelo responsável.

O envio cria uma solicitação, não uma compra. Se o atendimento for manual, informar isso claramente. O link de WhatsApp deve abrir uma conversa para o usuário enviar; nunca enviar mensagens automaticamente. Só exibir esse link se o contato do responsável estiver configurado.

### 5. Área do estudante

Listar somente seus pedidos e seus estados. Permitir abrir uma seleção publicada com duas ou três opções pertinentes, quando disponíveis.

Para cada opção, explicar por que foi escolhida, quais tópicos cobre, limitações, pré-requisitos e quais partes priorizar. Se não houver material adequado, o administrador deve conseguir comunicar isso sem fabricar recomendações.

Permitir registrar se usou o material, qual utilizou, se serviu ao objetivo e como foi o esforço de busca. Disponibilizar pedido de ajuste com feedback textual.

O histórico do pedido mantém um retrato da oferta aceita, mesmo que o preço global seja alterado depois.

### 6. Painel administrativo

Restrito a administradores reais; ocultar links não é controle de acesso.

- Cadastrar, editar, publicar e arquivar materiais.
- Revisar, aprovar ou rejeitar avaliações.
- Listar pedidos e filtrar por estado.
- Consultar a necessidade informada pelo estudante.
- Associar materiais e escrever justificativas específicas.
- Salvar seleção como rascunho e publicar quando estiver pronta.
- Registrar feedback e pedidos de ajuste.
- Registrar tempo gasto na curadoria e atendimento.
- Identificar pedido de piloto gratuito ou oferta paga, valor combinado e situação comercial registrada manualmente.
- Configurar preço experimental, texto de prazo de atendimento e contato do responsável.

Estados operacionais sugeridos: recebido, em análise, aguardando informações, seleção disponível, ajuste solicitado, concluído e cancelado.

Situação comercial é um campo independente: piloto gratuito, a combinar, aguardando pagamento, pagamento informado pelo administrador ou cancelado. Seleção operacionalmente concluída não significa automaticamente pagamento confirmado.

## Dados, autenticação e segurança

Se não existir uma base tecnológica, sugestão: Next.js com TypeScript, Tailwind CSS e Supabase para autenticação e PostgreSQL. Use uma arquitetura simples. Esta escolha é uma proposta técnica para este prompt, não uma condição do negócio.

Entidades mínimas: perfis, materiais, tópicos, avaliações, solicitações, recomendações por solicitação, feedbacks e configurações comerciais públicas. Separe configurações públicas de dados internos e segredos.

Usar migrações versionadas e políticas de acesso no banco:

- Visitantes leem apenas catálogo publicado e avaliações aprovadas, sem dados pessoais.
- Estudantes criam e leem seus pedidos; não podem consultar pedidos de terceiros.
- Estudantes não alteram preço, condição comercial, recomendações administrativas ou estado de pagamento.
- Rascunhos de recomendações são visíveis apenas para administradores.
- Avaliações são criadas pelo autor autenticado e não podem ser autoaprovadas.
- Administração exige papel atribuído de forma segura; usuários não podem se promover.
- Chaves privilegiadas ficam apenas no servidor. Chaves públicas próprias para cliente não substituem políticas de acesso.

Evitar exposição de contatos e respostas em logs e eventos de análise. Não inserir HTML arbitrário fornecido por usuários. Validar URLs de materiais, aceitando protocolos HTTP/HTTPS. Implementar mecanismos compatíveis com a hospedagem para limitar abuso de formulários.

Criar .env.example sem valores reais e documentar a criação do primeiro administrador. Não incluir credenciais padrão nem endpoint público que promova administradores.

Sem serviço externo configurado, a aplicação pode oferecer um modo demonstrativo explicitamente identificado, com dados fictícios. Ele não deve aceitar contatos reais fingindo salvar, nem servir como demonstração de persistência real. Separar dados demonstrativos dos dados do piloto.

## Aparência e experiência

Interface responsiva, clara e acessível, em português brasileiro. Nome provisório: "Guia de Estudos"; concentrar nome e cores em configuração fácil de alterar.

Direção visual sugerida: fundo #F8FAFC, texto #0F172A, cor principal #4338CA e destaque #0F766E. Validar contraste nas combinações efetivamente utilizadas.

Priorizar legibilidade, comparação dos materiais e clareza dos formulários. Usar rótulos visíveis, navegação por teclado, foco perceptível, estados de carregamento e mensagens de erro úteis. Não depender apenas de cor para comunicar estados.

Não adicionar chatbot, gráficos decorativos, gamificação, marketplace, roadmap interativo, aplicativo móvel ou integrações com e-mail no primeiro MVP.

## Instrumentação para validar a tese

Registrar apenas eventos e campos necessários: visita ao catálogo, filtro aplicado, abertura de material, pedido enviado, seleção publicada, uso declarado de material, feedback e compra registrada manualmente.

Distinguir clique de uso real e interesse de compra concluída. Se não houver mecanismo confiável de visitantes únicos, reportar visitas; não chamá-las de pessoas distintas. Não enviar contatos ou conteúdo do formulário para serviços de análise.

O painel deve permitir observar pedidos, seleções publicadas, uso declarado, feedback, clientes pagantes e tempo de atendimento. Com amostra pequena, apresentar contagens e denominadores junto das taxas.

## Sequência de execução

1. Inspecionar o projeto e definir estrutura, dependências e configuração.
2. Implementar landing page, catálogo e detalhes com estados vazios e dados de demonstração identificados.
3. Implementar persistência, migrações, autenticação e autorização.
4. Implementar pedidos, acompanhamento e painel de curadoria.
5. Implementar avaliações moderadas, publicação de seleções e feedback.
6. Verificar os fluxos completos, corrigir falhas e preparar documentação e publicação.

Construir telas e persistência em conjunto quando isso simplificar a arquitetura. Não considerar a etapa concluída apenas porque as telas existem.

## Critérios de aceite e verificações

- Visitante consulta materiais publicados e avaliações aprovadas em desktop e celular.
- Estudante envia um pedido real, recebe confirmação e o encontra após recarregar.
- Administrador vê o pedido, prepara a seleção e publica para o estudante correto.
- O estudante não vê rascunhos nem pedidos de outra conta, inclusive tentando acessar por URL ou API.
- Uma avaliação pendente não aparece publicamente; após aprovação, aparece sem dados privados.
- Campos comerciais e privilégios resistem a tentativas de alteração por usuário comum.
- O estudante registra uso e feedback; o administrador consulta esses dados.
- Links funcionam; dados ausentes e catálogo sem resultados têm apresentação adequada.
- Compilação, checagem de tipos e lint passam conforme a configuração escolhida.
- Testes relevantes cobrem autorização, validação e transições críticas. Registrar qualquer verificação que não puder executar.
- Nenhuma chave, senha ou token real aparece no código versionado ou nas capturas.

## Documentação da entrega

Escrever README com: problema, público, tese, recursos gratuitos e oferta paga experimental, instruções locais, variáveis de ambiente, configuração do banco, criação de administrador, verificações realizadas, o que ficou manual e limitações.

Preservar este prompt e registrar as correções solicitadas posteriormente. Não inventar entrevistas, métricas, vendas ou estimativas de mercado. Referenciar o Canvas e o estudo de mercado quando estiverem registrados no repositório; se não estiverem, apontar a pendência.

Preparar instruções de deploy. Depois que eu autorizar e fornecer a configuração necessária, publicar e verificar a URL. Não afirmar que a aplicação foi publicada apenas porque o build passou.

As capturas de tela devem vir da aplicação funcionando. O README deve incluir o endereço publicado somente depois que ele existir e for verificado. A entrega do curso será o link do repositório público na minha conta, com o código e a documentação.

Comece pela inspeção do repositório e pela primeira etapa. Explique brevemente as escolhas e prossiga.
