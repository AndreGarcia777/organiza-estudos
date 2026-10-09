# Guia de Estudos

MVP acadêmico desenvolvido como projeto final do curso **Programação com IA Santander**. A aplicação explora uma forma de ajudar estudantes de tecnologia a escolher materiais complementares mais adequados à disciplina, ao conhecimento prévio, ao objetivo e ao tempo disponível.

O projeto está disponível no [GitHub](https://github.com/AndreGarcia777/organiza-estudos) e em uma [demonstração pública](https://organiza-estudos.vercel.app) para avaliação acadêmica. Não possui operação comercial real; preços e registros comerciais demonstram hipóteses do exercício. A análise local não exige contratação de hospedagem ou serviços pagos.

## Conceito

Estudantes encontram muitos cursos, artigos, livros e vídeos, mas nem sempre conseguem identificar quais opções correspondem ao conteúdo que precisam estudar. O Guia de Estudos propõe dois caminhos:

1. **Catálogo gratuito:** permite pesquisar e comparar materiais por tópico, nível, formato e custo.
2. **Seleção personalizada:** registra a necessidade do estudante para que um curador prepare manualmente uma seleção contextualizada.

A hipótese do MVP é que recomendações com justificativas, limitações e experiências autodeclaradas de outros estudantes podem reduzir o esforço de escolha. O valor experimental de R$ 19,90 presente na interface faz parte da simulação do modelo de negócio. A aplicação não possui checkout, assinatura ou integração financeira.

## Dor, mercado e modelo de negócio

A dor escolhida é a dificuldade de selecionar materiais complementares que cubram os tópicos da disciplina com a profundidade adequada ao conhecimento e ao tempo disponível. Ela surgiu da experiência do responsável ao procurar conteúdos para uma prova de IA e encontrar cursos focados apenas no uso de ferramentas. Esse relato individual não comprova demanda no público inteiro.

O público inicial é formado por universitários brasileiros de Computação e TIC, independentemente da modalidade de ensino. O catálogo demonstrativo inclui IA, matemática e programação. As estimativas abaixo consideram um cenário de atendimento a necessidades de estudo de IA.

| Mercado | Estimativa inicial | Base e suposição |
|---|---:|---|
| TAM | Aproximadamente 800 mil | Referência de 800.222 matrículas em Computação e TIC em 2024, segundo o Semesp com base no Inep. Matrículas são uma aproximação do público potencial. |
| SAM | Aproximadamente 200 mil | Suposição de 25% do TAM com necessidades compatíveis com a cobertura inicial de IA. Percentual não medido. |
| SOM | 200 usuários em 12 meses | Cenário: 2.000 visitantes do público-alvo × 20% solicitando seleção × 50% utilizando um material. Não são usuários conquistados. |

O Business Model Canvas propõe catálogo e avaliações gratuitos, com pagamento por seleção personalizada como hipótese. A proposta de valor é reduzir o esforço de escolha; curadoria, moderação e atendimento permanecem manuais. O preço de R$ 19,90 não é uma assinatura e não representa cobrança ativa.

As hipóteses investigam existência da dor, clareza do formulário, adequação das recomendações, uso efetivo, confiança nas avaliações, contribuição de estudantes, disposição para pagar e viabilidade da curadoria. Seus experimentos são propostas futuras, não resultados obtidos ou condições de operação comercial para a entrega.

Consulte [o planejamento completo](docs/planejamento-negocio.md) para as fontes, fórmulas, cenários, os nove blocos do Canvas e os critérios de cada hipótese.

## Tese e decisões do MVP

O produto explora se recomendações alinhadas a tópicos, nível e tempo disponível ajudam o aluno a escolher melhor, e se experiências contextualizadas de outros estudantes acrescentam confiança. A possível monetização é uma hipótese adicional.

Permanecem manuais de propósito: cadastro e revisão de materiais, seleção, moderação, esclarecimentos e registro comercial. A aplicação não depende de uma API de IA para fazer a curadoria e não inclui pagamento integrado, assinatura, chatbot ou roadmap interativo.

## Aplicação publicada e entrega

**URL pública: https://organiza-estudos.vercel.app** — publicada na Vercel em modo demonstração, sem banco, contas ou envio de e-mails. Permite navegar pelo catálogo fictício e simular o preenchimento da solicitação; não grava pedidos ou avaliações. A aplicação completa pode ser executada localmente com Supabase.

O [roteiro de deploy](docs/deploy.md) documenta a configuração da demonstração e a opção de publicar a versão completa.

A entrega do curso será o link do repositório público na conta do responsável, com código, documentação, prompt e correções, além da URL da aplicação no README. Capturas das telas e do painel podem complementar as evidências. Nenhum resultado comercial é alegado.

## Autenticação da versão completa, sem envio de e-mails

A demonstração publicada não possui contas. Se a versão completa for publicada futuramente, usará somente contas de avaliação previamente criadas e confirmadas no Supabase. Login por e-mail e senha identifica a conta, mas não envia uma mensagem. Pedidos, curadoria, avaliações e administração ficam disponíveis conforme o papel da conta.

Configure `AUTH_EMAIL_FLOWS_ENABLED=false` na Vercel. Esse também é o padrão quando a variável não existe. A aplicação oculta cadastro e recuperação, redireciona suas páginas para o login, recusa as operações correspondentes no servidor e não processa links de confirmação ou recuperação. O e-mail permanece como identificador da conta e campo de contato, sem envio automático.

No Supabase remoto, desative **Allow new users to sign up** e prepare as contas por uma ação administrativa, com confirmação explícita e sem convite por e-mail. Não publique credenciais de administrador; forneça ao avaliador somente uma conta de estudante com dados de exemplo. Recuperação de acesso fica sob responsabilidade manual do proprietário do projeto.

Esse bloqueio na aplicação não modifica sozinho as configurações ou os endpoints do Supabase remoto. O roteiro de deploy documenta a configuração complementar. Não há SMTP configurado pela aplicação.

O ambiente local pode continuar testando cadastro e recuperação com Mailpit: `db:configure` e `test:auth` habilitam explicitamente `AUTH_EMAIL_FLOWS_ENABLED=true` para esse fim. Não copie essa opção para a publicação acadêmica.

Após `npm.cmd run build`, execute `npm.cmd run test:email-disabled` para verificar páginas, links e tentativas de envio adulterado com esses fluxos desativados. O teste não usa um Supabase real nem envia mensagens.

## Como funciona

### Visitante

- Consulta o catálogo sem login.
- Pesquisa por título, autoria ou tópico.
- Combina filtros de tópico, nível, formato e tipo de acesso.
- Consulta cobertura, limitações, pré-requisitos, idioma, duração, estimativa de estudo e custo externo.
- Lê somente avaliações aprovadas, sem e-mail ou identificador interno do autor.

### Estudante autenticado

- Mantém um perfil com nome de exibição.
- Preenche uma solicitação de seleção personalizada.
- Guarda o rascunho na aba durante o fluxo de login.
- Acompanha somente seus próprios pedidos.
- Consulta seleções publicadas e o histórico de versões.
- Registra uso, resultado percebido, feedback e pedido de ajuste.
- Envia uma avaliação de material para moderação.

### Administrador

- Cadastra, edita, publica e arquiva materiais.
- Configura a oferta acadêmica apresentada no formulário.
- Analisa pedidos e solicita informações complementares.
- Prepara recomendações em rascunho e publica versões.
- Modera avaliações.
- Registra tempo de curadoria e situação comercial manual.
- Consulta indicadores básicos do piloto com contagens e denominadores.

## Modos de execução

### Demonstração

É o modo mais simples para avaliação visual e não exige Docker, Supabase ou contas.

- Usa oito materiais explicitamente fictícios, incluindo exemplos de IA, matemática e programação.
- Não coleta e-mail, senha ou contato.
- Não grava pedidos ou avaliações.
- Simula o preenchimento da solicitação somente na página atual.

Rotas principais:

- `/` — apresentação do projeto.
- `/catalogo` — busca e filtros.
- `/catalogo/[slug]` — detalhes do material.
- `/solicitar` — simulação da solicitação.

### Supabase local

Habilita a implementação completa: autenticação, PostgreSQL, políticas de acesso, pedidos, curadoria, avaliações e indicadores. Todo o ambiente funciona localmente com Docker; não é necessário criar um projeto remoto.

## Tecnologias

- Next.js 16 com App Router e Server Actions.
- React 19 e TypeScript.
- Tailwind CSS via PostCSS.
- Supabase Auth e PostgreSQL.
- Row Level Security (RLS) e migrações SQL versionadas.
- Playwright para testes de navegador.
- axe-core para auditoria automática WCAG A/AA.
- PGlite para testes isolados das regras do banco.

## Requisitos

- Node.js 22 ou superior. O projeto foi validado com Node.js 24.
- npm.
- Microsoft Edge para os testes Playwright configurados.
- Docker Desktop somente para executar o modo Supabase local.

No PowerShell, os exemplos usam `npm.cmd` e `npx.cmd` para evitar a política de execução de arquivos `.ps1`. Em outros terminais, use `npm` e `npx`.

## Executar a demonstração

Depois de clonar o repositório:

```powershell
npm.cmd ci
npm.cmd run dev
```

Abra http://127.0.0.1:3000.

Sem um arquivo `.env.local`, a aplicação usa o modo demonstração. Também é possível criar o arquivo a partir de `.env.example` e manter:

```dotenv
APP_MODE=demo
APP_URL=http://127.0.0.1:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Executar a aplicação completa localmente

Abra o Docker Desktop e execute:

```powershell
npm.cmd ci
npm.cmd run db:start
npx.cmd supabase migration up --local
npm.cmd run db:configure
npm.cmd run dev
```

`db:configure` obtém a URL e a chave publicável do Supabase local e cria o `.env.local` sem imprimir credenciais. Também define `AUTH_EMAIL_FLOWS_ENABLED=true` para os testes locais com Mailpit. Se o arquivo já existir, ele é preservado; ajuste essa variável manualmente caso queira testar cadastro e recuperação. O arquivo é ignorado pelo Git.

Endereços locais:

- Aplicação: http://127.0.0.1:3000
- Supabase Studio: http://127.0.0.1:54323
- Caixa de e-mails de teste: http://127.0.0.1:54324

Os e-mails ficam no Mailpit local e não são enviados para pessoas. Para encerrar os serviços:

```powershell
npm.cmd run db:stop
```

O banco começa sem administrador e sem materiais reais. A criação segura do primeiro administrador está documentada em [Dados e contas para avaliação](docs/dados-avaliacao.md#primeiro-administrador).

## Dados para avaliação acadêmica

O arquivo [supabase/evaluation-data.sql](supabase/evaluation-data.sql) prepara três materiais remotos claramente marcados como fictícios, um de cada área demonstrada. Ele não cria avaliações, depoimentos, pagamentos ou usuários e só deve ser aplicado conscientemente ao projeto acadêmico depois das migrações.

A criação das contas de estudante e administrador, a promoção segura do primeiro administrador e a entrega privada da credencial de estudante estão documentadas em [docs/dados-avaliacao.md](docs/dados-avaliacao.md). Nenhuma senha, e-mail pessoal ou chave administrativa deve entrar no Git ou nas variáveis da aplicação.

## Como testar

### Verificações sem Docker

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:db
npm.cmd run build
npm.cmd run test:e2e
npm.cmd run test:email-disabled
```

- `lint`: verifica qualidade e regras do Next.js.
- `typecheck`: gera os tipos de rotas e valida TypeScript.
- `test:db`: executa 30 verificações de constraints, permissões, RLS e transições em PostgreSQL isolado.
- `build`: gera a compilação de produção.
- `test:e2e`: executa 20 testes em desktop e viewport de celular, incluindo navegação, responsividade, teclado, formulários, 404, WCAG A/AA e cabeçalhos HTTP.
- `test:email-disabled`: executa dois testes da versão de avaliação, cobrindo páginas e tentativas adulteradas de cadastro, recuperação e redefinição; não usa banco real nem envia e-mails. Usa a porta 3101 e exige build prévio.

O `test:e2e` usa a porta 3100 e espera que o build já tenha sido gerado. Para instalar o navegador configurado:

```powershell
npx.cmd playwright install msedge
```

### Integração com Supabase local

Com Docker e Supabase local em execução:

```powershell
npx.cmd supabase migration up --local
npm.cmd run test:auth
npx.cmd supabase db advisors --local --type security --level warn --fail-on error
```

`test:auth` compila a aplicação e executa quatro fluxos integrados:

- cadastro, confirmação, recuperação e renovação de sessão;
- perfil, rascunho, isolamento entre contas e papel administrativo;
- pedido, curadoria, publicação, feedback, ajuste e versionamento;
- avaliações moderadas, eventos anônimos e indicadores.

As contas e fixtures temporárias são removidas ao final.

## Segurança e privacidade

- Visitantes acessam somente catálogo publicado e avaliações aprovadas.
- Estudantes não consultam pedidos de outras contas ou rascunhos administrativos.
- Usuários comuns não alteram preços, pagamentos ou privilégios.
- Avaliações não podem ser autoaprovadas.
- A aplicação usa apenas a chave publicável do Supabase; chaves privilegiadas não são configuradas no cliente ou no servidor web.
- `.env.local`, resultados de testes e arquivos temporários do Supabase estão ignorados.
- Eventos do catálogo não armazenam e-mail, contato, busca, filtros ou conteúdo dos formulários.
- Links de materiais aceitam somente HTTP e HTTPS.

## Estrutura do repositório

```text
src/app/                 Rotas, páginas, Server Actions e estilos
src/components/          Formulários e componentes compartilhados
src/lib/                 Autenticação, catálogo, Supabase e regras de fluxo
src/data/                Materiais fictícios do modo demonstração
supabase/migrations/     Esquema, constraints, funções, grants e RLS
tests/                   Testes públicos e de acessibilidade
integration/             Fluxos completos com Supabase local
scripts/                 Configuração, tipos e testes do banco
docs/                    Planejamento, publicação e contas de avaliação
```

## Estado das verificações

A versão local foi validada com:

- build, TypeScript e ESLint aprovados;
- 30 verificações SQL aprovadas;
- 20 testes públicos aprovados em desktop e celular;
- dois testes de bloqueio dos fluxos de e-mail aprovados;
- quatro fluxos integrados aprovados com Supabase local;
- auditoria axe-core sem violações automáticas nas telas verificadas;
- Supabase Security Advisor local sem apontamentos;
- zero vulnerabilidades nas dependências de produção.

A auditoria completa do npm ainda aponta cinco alertas na cadeia de desenvolvimento do ESLint. A correção automática sugerida faria downgrade incompatível do `eslint-config-next`, por isso não foi aplicada.

Esses resultados correspondem às verificações locais de 09/10/2026. A demonstração foi publicada na Vercel e seu endereço respondeu com HTTP 200 sem exigir login da Vercel. Os 20 testes públicos também passaram na URL publicada, incluindo desktop, celular, simulação, cabeçalhos HTTP e acessibilidade automática. Testes técnicos não comprovam as hipóteses de negócio.

## Prompt e correções

O [mega prompt](prompt-implementacao-mvp.md) registra o escopo solicitado à IA. Principais ajustes para a entrega:

- Bloqueio de cadastro, confirmação e recuperação por e-mail na versão publicada, com proteção no servidor e testes específicos; os fluxos locais continuam disponíveis com Mailpit.
- Catálogo demonstrativo com oito materiais fictícios de IA, matemática e programação.
- Identificação explícita dos dados fictícios e procedimento de criação das contas de avaliação, sem publicar credenciais administrativas.

## Limitações

- O projeto é acadêmico; a URL pública oferece somente o modo demonstração.
- Não há usuários, vendas, entrevistas ou métricas reais de mercado.
- Os materiais da demonstração e seus endereços são fictícios.
- A seleção, moderação e situação comercial são processos manuais.
- Pagamento é apenas um registro administrativo; nenhuma transação é processada.
- Auditoria automática não substitui leitor de tela ou teste em celular físico.
- As estimativas de mercado, o Canvas e as hipóteses estão documentados, mas não representam validação comercial.
- Na demonstração publicada, login, pedidos persistentes e administração não estão disponíveis. Esses fluxos exigem o modo Supabase, disponível para execução local.

## Documentação complementar

- [Dor, TAM/SAM/SOM, Business Model Canvas e hipóteses](docs/planejamento-negocio.md)
- [Prompt original do MVP](prompt-implementacao-mvp.md)
- [Roteiro de publicação da versão acadêmica](docs/deploy.md)
- [Dados e contas para avaliação acadêmica](docs/dados-avaliacao.md)

Este repositório documenta uma implementação funcional e testável da hipótese. Ele não afirma validação comercial nem lançamento em produção.
