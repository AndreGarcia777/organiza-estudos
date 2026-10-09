# Dados e contas para avaliação acadêmica

Este procedimento prepara uma avaliação funcional sem apresentar exemplos como dados reais. Ele não cria avaliações, depoimentos, pagamentos ou resultados de validação.

## Materiais fictícios

O arquivo [supabase/evaluation-data.sql](../supabase/evaluation-data.sql) contém três materiais publicados, um de IA, um de matemática e um de programação. Títulos, autoria, resumo e comentários usam explicitamente as expressões **EXEMPLO FICTÍCIO**, **fictícia** ou **dado fictício**. Os endereços externos permanecem vazios.

Depois de vincular e migrar o projeto remoto correto, aplique:

```powershell
npx.cmd supabase db query --linked --file supabase/evaluation-data.sql
```

O comando é idempotente pelos slugs prefixados com `avaliacao-`. Ele também abre pedidos para as contas preparadas e configura a oferta como fluxo acadêmico sem cobrança. Revise o arquivo antes da aplicação e confirme o catálogo público depois.

O arquivo não é uma migração estrutural e não é executado por `supabase db push`. Ele deve ser aplicado conscientemente apenas ao projeto acadêmico.

## Contas preparadas, sem envio de e-mail

No Supabase Dashboard, abra **Authentication > Users > Add user > Create new user**. Não use **Send invitation**.

Crie duas contas dedicadas, com endereços controlados pelo responsável:

1. Uma conta de estudante para o professor avaliar login, pedido e acompanhamento.
2. Uma conta administrativa para o responsável preparar a curadoria.

Para cada conta:

- defina uma senha forte e diferente;
- marque o e-mail como confirmado no ato administrativo;
- não reutilize senha pessoal;
- não grave senha, chave secreta ou e-mail pessoal no repositório;
- entregue somente a credencial de estudante ao avaliador, por canal privado;
- nunca compartilhe a credencial administrativa.

A operação administrativa `auth.admin.createUser` também pode ser usada em um script local: ela não envia confirmação e aceita `email_confirm: true`. A chave secreta necessária deve existir somente no ambiente local do responsável e nunca na Vercel ou no código cliente.

## Primeiro administrador

Depois que a conta administrativa existir, promova-a no SQL Editor com o comando abaixo, substituindo o marcador apenas no editor:

```sql
insert into private.admin_members (user_id)
select id
from auth.users
where lower(email) = lower('EMAIL_ADMINISTRATIVO_CONFIRMADO')
  and email_confirmed_at is not null
on conflict (user_id) do nothing
returning user_id;
```

O e-mail real não deve ser salvo neste arquivo. Entre uma vez com cada conta e defina nomes de exibição que indiquem o contexto, como “Estudante de avaliação” e “Administrador da avaliação”.

## Avaliações e limpeza

O conjunto preparado deixa avaliações e depoimentos vazios. Se o fluxo de moderação for demonstrado, use um texto iniciado por “Avaliação fictícia para teste acadêmico”, aprove e verifique a publicação e remova esse registro ao terminar.

Após a correção do trabalho, remova as contas, pedidos, avaliações e demais registros de avaliação se o projeto não continuar ativo. A remoção deve ocorrer pelo painel ou por SQL direcionado aos identificadores confirmados; nunca use `db reset --linked`.
