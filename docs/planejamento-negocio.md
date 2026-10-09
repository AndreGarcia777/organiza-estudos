# Planejamento do MVP — Guia de Estudos

Planejamento elaborado com apoio de IA para o projeto final do curso **Programação com IA Santander**. Apresenta a dor, as estimativas de mercado, o modelo de negócio e as hipóteses do MVP. As estimativas não representam usuários conquistados, faturamento ou validação comercial.

## 1. Dor escolhida

Estudantes universitários de tecnologia têm dificuldade para escolher materiais complementares alinhados aos tópicos da disciplina, ao conhecimento prévio e ao tempo disponível. Encontram opções superficiais, extensas demais ou inadequadas à necessidade acadêmica e gastam tempo, esforço e, em alguns casos, dinheiro avaliando alternativas.

A ideia nasceu da experiência do responsável ao preparar-se para uma prova de IA. Muitos cursos encontrados ensinavam o uso de ferramentas como ChatGPT, enquanto a necessidade era compreender conteúdos acadêmicos da disciplina. O problema não era apenas encontrar opções, mas avaliar quais tinham a profundidade e a cobertura adequadas.

Organização de tarefas e anotações apareceu como outra dor durante o questionário, mas ficou fora do recorte inicial. O MVP concentra-se na escolha de materiais.

### Público inicial

Estudantes universitários de Computação e Tecnologias da Informação e Comunicação no Brasil, independentemente de estudar presencialmente, de forma semipresencial ou a distância. O catálogo demonstrativo abrange IA, matemática e programação; as estimativas de mercado usam um cenário de atendimento a necessidades de estudo de IA.

Esse recorte inicial não limita permanentemente o produto a IA. Concurseiros, outras áreas universitárias e organização completa de estudos não fazem parte da primeira versão.

### Por que investigar essa dor como oportunidade de negócio

Uma seleção adequada pode reduzir o esforço de comparação e o risco de investir em materiais que não atendem ao objetivo. O responsável já comprou cursos e outros recursos de estudo, mas isso não comprova que compraria um serviço de recomendação. A disposição para pagar pela seleção é uma hipótese separada.

O relato do responsável é evidência de sua experiência individual. Não foram realizadas entrevistas com outros estudantes nem comprovada a frequência da dor no público inteiro.

## 2. Tese do MVP

> Estudantes universitários de tecnologia conseguem escolher materiais complementares com menos esforço e maior adequação quando recebem recomendações alinhadas aos tópicos, ao nível e ao tempo disponível, acompanhadas de justificativas e experiências de outros alunos. Uma parcela pode pagar por essa ajuda personalizada.

As experiências devem ser reais, contextualizadas e identificadas como autodeclaradas quando não houver comprovação. Comentários de curadoria e avaliações dos estudantes são conteúdos diferentes.

## 3. Estimativa de mercado — TAM, SAM e SOM

### Base e limites da estimativa

Geografia: Brasil. Referência estatística: ano de 2024. Horizonte do SOM: primeiros 12 meses de uma eventual operação. Não se trata de uma projeção atualizada da população em 2026.

O Inep registrou **10.226.873 matrículas na graduação em 2024**. Esse total dá contexto, mas não é nosso TAM: incluir todos os cursos ampliaria o mercado além do público definido. Fonte: [relatório de atividades do Inep, Censo da Educação Superior](https://www.gov.br/inep/pt-br/relatorio-anual-de-atividades-e-gestao-do-inep-2025/pesquisas-estatisticas-e-indicadores-educacionais/censo-da-educaca-superior).

O **Mapa do Ensino Superior 2026**, do Semesp, apresenta **800.222 matrículas em Computação e Tecnologias da Informação e Comunicação**, com base nos dados do Inep de 2024. Adotamos aproximadamente **800 mil** como base de cálculo. Fonte: [Mapa do Ensino Superior 2026, página 17](https://www.semesp.org.br/wp-content/uploads/2026/03/mapa-do-ensino-superior-no-brasil-2026.pdf).

Matrículas são uma aproximação do público: não garantem pessoas distintas, ocorrência da dor, interesse no produto ou disposição para pagar.

| Mercado | Definição aplicada ao projeto | Estimativa | Natureza do número |
|---|---|---:|---|
| TAM — mercado total potencial | Universitários brasileiros de Computação e TIC que poderiam ser atendidos por uma solução com cobertura ampla de disciplinas. | Aproximadamente 800 mil | Referência de matrículas arredondada; teto de público, não demanda comprovada. |
| SAM — mercado atendível | Parcela do TAM com necessidade de estudo de IA compatível com os tópicos e materiais da primeira versão. | Aproximadamente 200 mil | Suposição de 25% do TAM, ainda sem medição. |
| SOM — mercado conquistável | Estudantes que efetivamente utilizariam ao menos um material recomendado, conforme capacidade de divulgação e atendimento. | 200 usuários em 12 meses | Cenário operacional hipotético, não resultado observado. |

### Sensibilidade do SAM

Não há dado confirmado sobre quantos alunos estudam IA, procuram complementação e seriam atendidos pelo catálogo. Por isso, o percentual de 25% foi usado apenas para planejamento:

| Parcela atendível suposta | Cálculo sobre a base arredondada | SAM |
|---|---|---:|
| 10% | 800.000 × 10% | 80 mil |
| 25% — cenário central | 800.000 × 25% | 200 mil |
| 40% | 800.000 × 40% | 320 mil |

Esses cenários não são intervalos estatísticos de confiança. A cobertura do catálogo e uma pesquisa com estudantes seriam necessárias para refinar o SAM.

### Cálculo do SOM pela operação

| Etapa em 12 meses | Premissa | Resultado hipotético |
|---|---|---:|
| Aquisição | 2.000 visitantes do público-alvo obtidos em comunidades e por indicações. | 2.000 visitantes |
| Solicitação | 20% dos visitantes solicitam uma seleção. | 400 pedidos |
| Uso | 50% dos solicitantes utilizam pelo menos um material. | 200 usuários |

Fórmula: **2.000 × 0,20 × 0,50 = 200 usuários**. Para esse cenário simplificado, assume-se uma solicitação por pessoa. Os 400 pedidos representam cerca de 33 atendimentos por mês e exigiriam capacidade de curadoria correspondente.

Nenhuma dessas taxas foi medida. Os eventos de visita por aba implementados na aplicação não equivalem a visitantes únicos, portanto não confirmam diretamente a primeira premissa do funil.

### Simulação de monetização

Preço experimental: **R$ 19,90 por seleção personalizada**, sem assinatura. Se 10% dos 200 usuários comprassem uma seleção posterior, seriam **20 compradores × R$ 19,90 = R$ 398 em vendas** nesse conjunto de compras, antes de custos. Não é receita mensal, faturamento realizado ou previsão garantida.

A aplicação acadêmica não cobra nem processa transações. Registros comerciais no painel servem para demonstrar o modelo; não comprovam pagamento.

## 4. Business Model Canvas

Proposta de valor resumida:

> Encontre materiais que complementam sua disciplina, com explicações sobre conteúdo, profundidade, pré-requisitos e tempo de estudo, apoiadas por experiências de outros estudantes.

| Bloco | Planejamento inicial |
|---|---|
| Segmentos de clientes | Universitários de tecnologia com uma necessidade acadêmica específica e pouco tempo para comparar materiais. Cenário das estimativas: conteúdos de IA; a demonstração também inclui matemática e programação. |
| Proposta de valor | Reduzir o esforço de escolha e o risco de investir em conteúdo inadequado. Apresentar poucas opções contextualizadas, suas justificativas e limitações. |
| Canais | Comunidades estudantis, fóruns de tecnologia, grupos de disciplinas, indicação entre alunos e landing page. São canais a testar, não uma audiência existente. |
| Relacionamento com clientes | Solicitação estruturada, atendimento manual, acompanhamento pela conta, feedback após o estudo e avaliações contextualizadas. Contato externo pode ser combinado; o deploy acadêmico não envia e-mails. |
| Fontes de receita | Hipótese de pagamento por seleção personalizada. Consulta básica e contribuição de avaliações gratuitas. R$ 19,90 é experimental; assinatura só seria reconsiderada com evidência de recorrência. |
| Recursos principais | Catálogo organizado, critérios de recomendação, avaliações reais, aplicação, banco de dados e tempo do responsável pela curadoria. |
| Atividades principais | Classificar e revisar materiais, relacioná-los aos tópicos solicitados, preparar seleções, moderar avaliações e acompanhar feedback. |
| Parcerias principais | Possíveis colaboradores: alunos que cursaram as disciplinas, monitores, professores e comunidades acadêmicas. Não existem parcerias confirmadas. |
| Estrutura de custos | Tempo de curadoria, atendimento e moderação; hospedagem e banco conforme utilização; eventual processamento de pagamentos e uso de IA em uma evolução. A versão atual não integra pagamentos nem depende de uma API de IA. |

O Canvas é um modelo proposto para o exercício. Não representa empresa em operação ou compromisso de comercialização.

### Gratuito e personalizado

| Consulta gratuita | Seleção personalizada — hipótese paga |
|---|---|
| Explorar catálogo e filtrar materiais. | Informar disciplina, tópicos, objetivo, nível, prazo e horas disponíveis. |
| Consultar cobertura, pré-requisitos, formato, duração e custo externo. | Receber duas ou três opções pertinentes com justificativas e partes a priorizar. |
| Ler avaliações aprovadas de estudantes. | Solicitar ajuste e informar o resultado do estudo. |
| Abrir os links dos materiais. | Receber curadoria manual orientada à necessidade informada. |
| Contribuir com avaliações, mediante conta autenticada. | No exercício acadêmico, usar esses fluxos sem compra ou cobrança real. |

Materiais externos podem cobrar pelo próprio acesso. A oferta de seleção não inclui a compra desses conteúdos. O modelo não foi convertido em assinatura semelhante à do roadmap.sh.

## 5. Hipóteses e experimentos propostos

Os critérios abaixo propõem sinais exploratórios em amostras pequenas, não comprovação estatística do mercado. **Não foram executados como validação comercial e não são exigências para operar um negócio nesta entrega acadêmica.**

| Hipótese | Experimento proposto | Sinal inicial de sucesso |
|---|---|---|
| A dor existe além da experiência do responsável. | Entrevistar 10 estudantes sobre a última busca, antes de apresentar a solução. | Pelo menos 6 relatam dificuldade recente com cobertura, profundidade ou duração. |
| O aluno consegue informar sua necessidade. | Testar o formulário com 10 participantes. | Pelo menos 8 fornecem informações suficientes para recomendar materiais. |
| A seleção é mais adequada que a busca habitual. | Comparar escolhas e tempo de busca para necessidades semelhantes, com e sem ajuda do produto. | Pelo menos 7 de 10 encontram uma opção adequada com menos tempo de busca. |
| A recomendação leva ao uso. | Acompanhar os primeiros 20 atendimentos. | Pelo menos 10 utilizam uma opção em até sete dias. Clique sozinho não conta. |
| Opiniões contextualizadas aumentam a confiança. | Comparar recomendações com e sem avaliações reais, alternando a ordem de apresentação. | A maioria prefere a versão com avaliações e explica como elas ajudaram. |
| Conseguimos obter contribuições úteis. | Convidar 10 estudantes que usaram materiais a avaliar contexto, cobertura, prós e contras. | Pelo menos 3 enviam avaliações suficientemente detalhadas. |
| Existe disposição para pagar. | Em uma eventual pesquisa futura, oferecer uma nova seleção por R$ 19,90 a 20 usuários que receberam valor. | Pelo menos 3 compram; interesse declarado e registro simulado não contam como compra. |
| A curadoria é operacionalmente viável. | Registrar duração e custos de 20 atendimentos após montar o catálogo inicial. | Mediana de até 20 minutos por pedido e perspectiva de cobrir custos com o preço testado. |

A recorrência poderia ser explorada pelo retorno com outra necessidade em até 60 dias. Ela ajudaria a avaliar assinatura no futuro, sem alterar o modelo inicial por demanda.

### O que a implementação permite observar

- Pedidos, seleções publicadas, uso autodeclarado, feedback e ajustes.
- Avaliações enviadas e decisões de moderação.
- Tempo de curadoria registrado e situação comercial informada manualmente.
- Eventos do catálogo, apresentados como visitas por aba e aberturas, sem alegação de pessoas distintas.

O painel calcula tempo médio; a hipótese de viabilidade propõe mediana. Esses indicadores são diferentes. O experimento futuro precisaria calcular a mediana a partir dos registros de tempo.

Entrevistas, comparação com a busca habitual e pesquisa de confiança exigem procedimento separado. Build e testes automatizados não demonstram satisfação, demanda ou disposição para pagar.

## 6. Escopo acadêmico e trabalho manual

Implementação: landing page, catálogo, autenticação, solicitação contextualizada, acompanhamento, curadoria administrativa, avaliações moderadas e indicadores.

Permanecem manuais de propósito: cadastro e revisão dos materiais, preparo das recomendações, moderação, atendimento de esclarecimentos e registros comerciais. Automatizar a seleção antes de testar sua utilidade não é necessário para a tese inicial.

Na publicação acadêmica, as contas são previamente preparadas. Cadastro, confirmação e recuperação por e-mail ficam desativados. O ambiente local mantém os fluxos com Mailpit quando habilitados explicitamente. O responsável pretende pausar o projeto após a entrega; não há compromisso de operação comercial contínua.

Não fazem parte do MVP: checkout, assinatura, marketplace, geração de cursos, chatbot, roadmap interativo, aplicativo móvel e organizador completo de estudos.

## 7. Estado das evidências e entrega

- Dor: relato individual registrado no planejamento.
- Mercado: dados de matrículas e cenários com suposições explícitas.
- Canvas e hipóteses: propostas de investigação, sem validação comercial.
- Código: implementação acadêmica com verificações técnicas documentadas no README.
- Publicação: demonstração sem banco ou contas em https://organiza-estudos.vercel.app; versão completa disponível para execução local.
- Usuários, vendas e resultados comerciais reais: não demonstrados nem necessários para caracterizar esta entrega como exercício acadêmico.

O escopo solicitado à IA está no [mega prompt](../prompt-implementacao-mvp.md). O [README](../README.md) reúne a URL pública, instruções de execução, principais ajustes e verificações técnicas.
