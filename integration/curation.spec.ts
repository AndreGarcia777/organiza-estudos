import {test,expect,type Page} from "@playwright/test";
import {createClient} from "@supabase/supabase-js";
import {Client} from "pg";
import {randomUUID} from "node:crypto";
import {expectAccessible} from "./accessibility";
async function login(page:Page,email:string,password:string){await page.goto("/entrar");await page.getByLabel("E-mail",{exact:true}).fill(email);await page.getByLabel("Senha",{exact:true}).fill(password);await page.getByRole("button",{name:"Entrar",exact:true}).click();await expect(page).toHaveURL("/conta");}
test("curadoria completa, versões, informações complementares e isolamento",async({browser,page})=>{
 test.setTimeout(120000);
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL!,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
 const admin=createClient(url,process.env.TEST_LOCAL_SERVICE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
 const sql=new Client({connectionString:process.env.TEST_LOCAL_DATABASE_URL});await sql.connect();
 const users:{id:string;email:string;password:string}[]=[];const suffix=randomUUID();let materialId:string|undefined;
 const original=(await sql.query("select * from public.offer_settings where id")).rows[0];
 const context=await browser.newContext();const curatorPage=await context.newPage();
 try{
  for(let i=0;i<3;i++){const email=`curation-${randomUUID()}@example.invalid`,password=randomUUID()+"Aa1!";const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true});expect(error?.message).toBeUndefined();users.push({id:data.user!.id,email,password});}
  const [a,b,curator]=users;
  await sql.query("insert into private.admin_members(user_id) values($1)",[curator.id]);
  await login(curatorPage,curator.email,curator.password);
  await curatorPage.goto("/admin/oferta");await curatorPage.getByLabel("Abrir recebimento de pedidos").check();await curatorPage.getByRole("button",{name:"Salvar oferta"}).click();await expect(curatorPage.getByRole("status")).toContainText("salvos");
  await curatorPage.goto("/admin/materiais/novo");
  for(const [name,value] of Object.entries({title:"Material de teste "+suffix,slug:"teste-"+suffix,author:"Fixture local",original_url:"https://example.com/material",topic_names:"Teste local "+suffix,summary:"Resumo para teste",coverage:"Redes neurais",limitations:"Sem aprofundamento",prerequisites:"Álgebra básica",curation:"Adequado para este teste"}))await curatorPage.locator('[name="'+name+'"]').fill(value);
  await curatorPage.getByLabel("Publicação",{exact:true}).selectOption("published");
  await curatorPage.getByRole("button",{name:"Salvar material"}).click();await expect(curatorPage).toHaveURL(/\/admin\/materiais\/[0-9a-f-]{36}$/);
  materialId=curatorPage.url().split("/").pop()!;
  const publicClient=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  expect((await publicClient.from("materials").select("id").eq("id",materialId)).data).toHaveLength(1);
  await login(page,a.email,a.password);await page.goto("/solicitar");
  for(const [name,value] of Object.entries({subject:"Pedido de teste "+suffix,topics:"Redes neurais",prerequisites:"Álgebra",hours:"4"}))await page.locator('[name="'+name+'"]').fill(value);
  await page.getByLabel("Li a oferta acima.",{exact:false}).check();await page.getByRole("button",{name:"Enviar pedido",exact:true}).click();await expect(page).toHaveURL(/\/conta\/pedidos\/[0-9a-f-]{36}$/);
  const requestId=page.url().split("/").pop()!;
  await page.reload();await expect(page.getByRole("heading",{name:"Pedido de teste "+suffix})).toBeVisible();
  const aClient=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}),bClient=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  expect((await aClient.auth.signInWithPassword(a)).error).toBeNull();expect((await bClient.auth.signInWithPassword(b)).error).toBeNull();
  const row=(await aClient.from("study_requests").select("*").eq("id",requestId).single()).data!;
  expect((await aClient.rpc("submit_request",{submission:row.submission_key,payload:{},accepted_offer:{}})).data).toBe(requestId);
  expect((await aClient.rpc("submit_request",{submission:randomUUID(),payload:{},accepted_offer:{}})).error).not.toBeNull();
  expect((await aClient.from("study_requests").select("id").eq("student_id",a.id)).data).toHaveLength(1);

  expect((await aClient.from("study_requests").update({commercial_status:"payment_reported",agreed_price_cents:1}).eq("id",requestId)).error).not.toBeNull();
  expect((await bClient.from("study_requests").select("id").eq("id",requestId)).data).toHaveLength(0);
  expect((await bClient.rpc("publish_selection",{selection:randomUUID()})).error).not.toBeNull();
  const otherContext=await browser.newContext();const otherPage=await otherContext.newPage();await login(otherPage,b.email,b.password);const response=await otherPage.goto("/conta/pedidos/"+requestId);expect(response?.status()).toBe(404);await otherContext.close();
  await curatorPage.goto("/admin/pedidos/"+requestId);
  await curatorPage.getByLabel("Estado do atendimento").selectOption("in_review");await curatorPage.getByRole("button",{name:"Atualizar atendimento"}).click();await expect(curatorPage.getByRole("heading",{name:"Rascunho da seleção"})).toBeVisible();
  await expectAccessible(curatorPage,"atendimento administrativo");
  await curatorPage.getByLabel("Estado do atendimento").selectOption("awaiting_information");await curatorPage.getByLabel("Informações necessárias do estudante").fill("Qual conteúdo da prova precisa revisar?");await curatorPage.getByRole("button",{name:"Atualizar atendimento"}).click();await expect(curatorPage.getByRole("heading",{name:"Informações solicitadas"})).toBeVisible();
  await page.reload();await page.getByLabel("Sua resposta").fill("Preciso revisar backpropagation.");await page.getByRole("button",{name:"Enviar informações"}).click();await expect(page.getByText("Preciso revisar backpropagation.",{exact:true})).toBeVisible();
  await curatorPage.reload();await expect(curatorPage.getByText("Preciso revisar backpropagation.",{exact:true})).toBeVisible();await curatorPage.getByLabel("Estado do atendimento").selectOption("in_review");await curatorPage.getByRole("button",{name:"Atualizar atendimento"}).click();await expect(curatorPage.getByRole("status")).toContainText("salvos");
  await curatorPage.getByLabel("Material 1",{exact:true}).selectOption(materialId);
  for(const name of ["rationale","covered_topics","limitations","prerequisites","prioritize"])await curatorPage.locator('[name="'+name+'_1"]').fill("Contexto específico para redes neurais.");
  await curatorPage.getByRole("button",{name:"Salvar rascunho"}).click();await expect(curatorPage.getByRole("button",{name:"Publicar seleção salva"})).toBeVisible();
  expect((await aClient.from("recommendation_sets").select("id").eq("request_id",requestId)).data).toHaveLength(0);
  await curatorPage.getByRole("button",{name:"Publicar seleção salva"}).click();await expect(curatorPage.locator(".form-error")).toContainText("apenas uma");
  await curatorPage.getByLabel("Justificativa para uma única opção").fill("Esta é a única opção pertinente ao recorte.");await curatorPage.getByRole("button",{name:"Salvar rascunho"}).click();await expect(curatorPage.getByRole("status").first()).toContainText("salvos");
  await curatorPage.getByRole("button",{name:"Publicar seleção salva"}).click();await expect(curatorPage.getByRole("heading",{name:"Rascunho da seleção"})).toHaveCount(0);
  await page.reload();await expect(page.getByRole("heading",{name:"Seleção 1 · Mais recente"})).toBeVisible();
  await expectAccessible(page,"pedido e seleção do estudante");
  const selection=(await aClient.from("recommendation_sets").select("id").eq("request_id",requestId).single()).data!;
  const rec=(await aClient.from("recommendations").select("id").eq("selection_id",selection.id).single()).data!;
  expect((await bClient.from("recommendations").select("id").eq("selection_id",selection.id)).data).toHaveLength(0);
  await page.getByLabel("Material utilizado").selectOption(rec.id);await page.getByLabel("Você utilizou o material?").selectOption("yes");await page.getByLabel("Como foi o esforço de busca?").fill("Encontrei o trecho mais rápido.");await page.getByLabel("Sua experiência",{exact:true}).fill("Ajudou a revisar o conteúdo.");await page.getByRole("button",{name:"Registrar uso e feedback"}).click();await expect(page.getByText("Ajudou a revisar o conteúdo.",{exact:true})).toBeVisible();
  await page.getByLabel("O que precisa mudar na seleção?").fill("Preciso de exemplos resolvidos.");await page.getByRole("button",{name:"Solicitar ajuste",exact:true}).click();await expect(page.getByRole("button",{name:"Solicitar ajuste",exact:true})).toHaveCount(0);
  await curatorPage.reload();await expect(curatorPage.getByText("Preciso de exemplos resolvidos.",{exact:true})).toBeVisible();
  await curatorPage.getByLabel("Estado do atendimento").selectOption("in_review");await curatorPage.getByRole("button",{name:"Atualizar atendimento"}).click();await expect(curatorPage.getByRole("status").first()).toContainText("salvos");
  await curatorPage.getByLabel("Motivo de não haver materiais adequados").fill("Não encontrei exemplos pertinentes ao recorte informado.");await curatorPage.getByRole("button",{name:"Salvar rascunho"}).click();await expect(curatorPage.getByRole("button",{name:"Publicar seleção salva"})).toBeVisible();
  await page.reload();await expect(page.getByRole("heading",{name:"Seleção 1 · Mais recente"})).toBeVisible();await expect(page.getByText("Não encontrei exemplos pertinentes ao recorte informado.",{exact:true})).toHaveCount(0);
  await curatorPage.getByRole("button",{name:"Publicar seleção salva"}).click();await expect(curatorPage.getByRole("heading",{name:"Rascunho da seleção"})).toHaveCount(0);
  await page.reload();await expect(page.getByRole("heading",{name:"Seleção 2 · Mais recente"})).toBeVisible();await expect(page.getByText("Não encontrei exemplos pertinentes ao recorte informado.",{exact:true})).toBeVisible();
  await curatorPage.getByLabel("Estado do atendimento").selectOption("completed");await curatorPage.getByLabel("Tempo total de atendimento em minutos").fill("25");await curatorPage.getByRole("button",{name:"Atualizar atendimento"}).click();await expect(curatorPage.getByRole("status")).toContainText("salvos");
  const final=(await aClient.from("study_requests").select("state,commercial_status,curator_minutes").eq("id",requestId).single()).data;
  expect(final).toEqual({state:"completed",commercial_status:"to_agree",curator_minutes:25});
  await curatorPage.goto("/admin/materiais/"+materialId);await curatorPage.getByLabel("Publicação",{exact:true}).selectOption("archived");await curatorPage.getByRole("button",{name:"Salvar material"}).click();await expect(curatorPage.getByRole("status")).toContainText("salvos");
  expect((await publicClient.from("materials").select("id").eq("id",materialId)).data).toHaveLength(0);
  await page.reload();await expect(page.getByRole("heading",{name:"1. Material de teste "+suffix})).toBeVisible();
  await curatorPage.goto("/admin/pedidos/"+requestId);
  await page.setViewportSize({width:390,height:844});await page.reload();await expect(page.getByRole("heading",{name:"Pedido de teste "+suffix})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await aClient.auth.signOut();await bClient.auth.signOut();
 } finally {
  await context.close();
  for(const u of users){const {error}=await admin.auth.admin.deleteUser(u.id);if(error)throw new Error("Falha ao remover fixture de curadoria.");}
  if(materialId)await sql.query("delete from public.materials where id=$1",[materialId]);
  await sql.query("delete from public.topics where name=$1",["Teste local "+suffix]);
  await sql.query("update public.offer_settings set price_cents=$1,offer_text=$2,delivery_text=$3,public_whatsapp=$4,pilot_enabled=$5,requests_enabled=$6 where id",[original.price_cents,original.offer_text,original.delivery_text,original.public_whatsapp,original.pilot_enabled,original.requests_enabled]);
  await sql.end();
 }
});
