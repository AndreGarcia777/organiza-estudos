# Roteiro de deploy

## Demonstração publicada

A demonstração está disponível em https://organiza-estudos.vercel.app, na Vercel, com `APP_MODE=demo` e `AUTH_EMAIL_FLOWS_ENABLED=false` nos ambientes Production e Preview. Não utiliza Supabase, contas ou envio de e-mails. O deploy foi realizado pela CLI; a integração automática com o repositório GitHub não foi concluída.

Para publicar novamente pelo diretório do projeto vinculado:

```powershell
npx.cmd vercel deploy --prod
```

O `.vercelignore` exclui arquivos de ambiente, caches e a pasta `/supabase/` da raiz, preservando `src/lib/supabase`, necessário à compilação.

## Publicação opcional da versão completa

O roteiro abaixo descreve a opção com Supabase. A configuração do banco remoto, das contas e dos fluxos autenticados permanece pendente; não faz parte da demonstração publicada.

## Pré-requisitos

- Repositório revisado e hospedagem com suporte a servidor Node.js para Next.js.
- Projeto Supabase exclusivo para o produto, criado na organização correta.
- Domínio HTTPS definitivo ou URL estável fornecida pela hospedagem.
- Node.js 22 ou superior no build.
- Responsável com MFA nas contas da hospedagem, do Supabase e do repositório.

O aplicativo não é uma exportação estática: usa Server Actions, cookies, autenticação e renderização por requisição.

## 1. Verificar a versão candidata

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:db
npm.cmd run build
npm.cmd run test:e2e
npm.cmd run test:email-disabled
```

Com o Docker e o Supabase local ativos, execute também:

```powershell
npm.cmd run test:auth
npx.cmd supabase db advisors --local --type security --level warn --fail-on error
npx.cmd supabase db lint --local --level warning
npx.cmd supabase migration list --local
```

Não prossiga se build, autorização ou migrações falharem.

## 2. Preparar o Supabase remoto

Depois de autorizado, autentique a CLI e vincule o projeto correto:

```powershell
npx.cmd supabase login
npx.cmd supabase link --project-ref ID_DO_PROJETO
npx.cmd supabase migration list
npx.cmd supabase db push --dry-run
```

Revise a lista do `--dry-run`. Aplique somente depois dessa conferência:

```powershell
npx.cmd supabase db push
npx.cmd supabase migration list
npx.cmd supabase db advisors --linked --type security --level warn --fail-on error
```

Nunca use `supabase db reset --linked` em produção. As migrações não criam catálogo, usuários ou administrador. O conjunto opcional de avaliação é aplicado separadamente e nunca faz parte de `db push`.

No painel do Supabase:

1. Confirme RLS e políticas no Security Advisor.
2. Desative **Allow new users to sign up**. A publicação acadêmica usa contas previamente preparadas, sem cadastro público.
3. Defina **Site URL** como a origem HTTPS definitiva.
4. Mantenha os fluxos por e-mail desativados na aplicação com `AUTH_EMAIL_FLOWS_ENABLED=false`. Não são necessários links de confirmação ou recuperação para as contas de avaliação.
5. Não configure SMTP nem envie convites. Crie as contas por uma ação administrativa e marque o e-mail como confirmado nesse processo. Não desative confirmação para abrir cadastro público.
6. Revise limites de autenticação, proteção contra abuso/CAPTCHA, duração de OTP, SSL, backups e restrições de rede conforme o plano contratado.

Referências oficiais: [fluxo local e db push](https://supabase.com/docs/guides/local-development/cli-workflows), [checklist de produção](https://supabase.com/docs/guides/deployment/going-into-prod) e [configuração do Auth](https://supabase.com/docs/guides/auth/general-configuration).

## 3. Configurar a hospedagem

Defina estas variáveis no ambiente de build e produção:

```dotenv
APP_MODE=supabase
AUTH_EMAIL_FLOWS_ENABLED=false
APP_URL=https://DOMINIO_DEFINITIVO
NEXT_PUBLIC_SUPABASE_URL=https://ID_DO_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=CHAVE_PUBLICAVEL
```

Use somente a chave publicável. Não configure `service_role`, `sb_secret_*`, senha do banco ou token da CLI na aplicação.

As variáveis `NEXT_PUBLIC_*` são incorporadas ao JavaScript durante o build. Gere outro build sempre que trocar projeto ou URL do Supabase.

Comandos de uma hospedagem Node.js:

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run start
```

Na Vercel, vincule o projeto com `npx.cmd vercel link`, cadastre as cinco variáveis acima em **Production** e faça uma nova implantação depois de qualquer alteração. Não grave os valores em comandos que fiquem no histórico do terminal. O provedor detecta Next.js e usa o `package-lock.json`; mantenha Node.js 22 ou superior.

O arquivo `.vercelignore` exclui documentação, testes, scripts, Supabase e arquivos de ambiente do pacote enviado pela CLI. Esses arquivos continuam no GitHub para avaliação do código, mas não são necessários em tempo de execução.

## 4. Inicializar a operação

1. Aplique os três materiais fictícios identificados para avaliação:

   ```powershell
   npx.cmd supabase db query --linked --file supabase/evaluation-data.sql
   ```

2. Crie as contas administrativa e de estudante com e-mail confirmado e senha definida, sem convite, seguindo [dados-avaliacao.md](dados-avaliacao.md).
3. Atribua o primeiro administrador pelo SQL documentado em [Dados e contas para avaliação](dados-avaliacao.md#primeiro-administrador).
4. Entre com as duas contas e defina nomes de exibição que identifiquem o contexto de avaliação.
5. Verifique a oferta acadêmica em `/admin/oferta`. Não registre pagamento nem dados de estudantes reais.
6. Mantenha as credenciais administrativas privadas e forneça ao professor somente a conta de estudante.

Não publique os oito objetos do modo demonstração como se fossem materiais reais. O arquivo de avaliação usa três registros próprios, com títulos e textos explicitamente fictícios, e não insere avaliações ou depoimentos.

## 5. Verificação pós-publicação

- Acesse landing page, catálogo, detalhe e login pelo domínio HTTPS. Cadastro, recuperação e redefinição devem redirecionar ao login; links de confirmação não devem criar sessões.
- Confirme que a conta de estudante preparada entra por senha e que a aplicação não oferece nem aciona envio de e-mail.
- Confirme que um visitante vê somente materiais publicados e avaliações aprovadas.
- Use contas temporárias para validar pedido, isolamento entre estudantes, curadoria, publicação, feedback e moderação.
- Verifique 404 de pedido alheio por URL e bloqueios equivalentes pela API.
- Confirme os cabeçalhos `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options` e `Permissions-Policy`.
- Execute o Security Advisor remoto e registre data e resultado.
- Remova contas e dados temporários sem apagar dados reais.
- Só então abra o recebimento de pedidos e inclua a URL verificada no README.

Para recuar a aplicação, restaure o build anterior. Alterações de banco devem usar uma nova migração de correção; não reverta produção com reset.
