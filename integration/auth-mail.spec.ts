import {test,expect} from "@playwright/test";
import {createClient} from "@supabase/supabase-js";
import {Client} from "pg";
import {randomUUID} from "node:crypto";
import {spawn,type ChildProcess} from "node:child_process";
test("cadastro e recuperação PKCE por e-mail local, renovação e persistência após reinício",async({page})=>{
 test.setTimeout(120000);
 const email="mail-"+randomUUID()+"@example.invalid",password=randomUUID()+"Aa1!";
 const sql=new Client({connectionString:process.env.TEST_LOCAL_DATABASE_URL});await sql.connect();
 const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.TEST_LOCAL_SERVICE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
 const mailIds=new Set<string>();let server:ChildProcess|undefined;
 async function emailLink(type:string){
  let link="";
  await expect.poll(async()=>{
   const list=await (await fetch("http://127.0.0.1:54324/api/v1/search?query="+encodeURIComponent("to:"+email))).json();
   for(const m of list.messages??[]){
    mailIds.add(m.ID);
    const message=await (await fetch("http://127.0.0.1:54324/api/v1/message/"+m.ID)).json();
    const links=String(message.HTML).match(/href="([^"]+)"/g)??[];
    for(const raw of links){const value=raw.slice(6,-1).replaceAll("&amp;","&");const u=new URL(value);if(u.hostname==="127.0.0.1"&&u.pathname==="/auth/v1/verify"&&u.searchParams.get("type")===type){link=value;return true;}}
   }
   return false;
  },{timeout:20000,message:"E-mail de teste com link local recebido"}).toBe(true);
  try{await page.goto(link);}catch{throw new Error("Não foi possível abrir a confirmação local.");}
 }
 async function stop(){if(server&&!server.killed){const child=server;await new Promise<void>(resolve=>{child.once("exit",()=>resolve());child.kill();});}server=undefined;}
 async function start(){server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","--hostname","127.0.0.1","--port","3102"],{env:{...process.env,APP_URL:"http://127.0.0.1:3102"},stdio:"ignore",windowsHide:true});await expect.poll(async()=>{try{return (await fetch("http://127.0.0.1:3102/entrar")).status;}catch{return 0;}},{timeout:20000}).toBe(200);}
 try{
  await page.goto("/cadastrar");await page.getByLabel("E-mail",{exact:true}).fill(email);await page.getByLabel("Nova senha",{exact:true}).fill(password);await page.getByLabel("Confirme a senha").fill(password);await page.getByRole("button",{name:"Criar conta",exact:true}).click();await expect(page.getByRole("status")).toContainText("instruções");
  await emailLink("signup");await expect.poll(()=>new URL(page.url()).pathname).toBe("/conta");
  await page.getByLabel("Nome de exibição").fill("Perfil persistente");await page.getByRole("button",{name:"Salvar nome"}).click();await expect(page.getByRole("status")).toContainText("salvo");
  const cookies=await page.context().cookies();const chunks=cookies.filter(c=>/^sb-.*-auth-token(?:\.\d+)?$/.test(c.name)).sort((a,b)=>a.name.localeCompare(b.name));
  const encoded=chunks.map(c=>c.value).join("");const session=JSON.parse(Buffer.from(encoded.replace(/^base64-/,""),"base64url").toString());const oldRefresh=session.refresh_token;
  session.expires_at=Math.floor(Date.now()/1000)-1;
  const updated="base64-"+Buffer.from(JSON.stringify(session)).toString("base64url");
  const base=chunks[0].name.replace(/\.\d+$/,"");await page.context().clearCookies({name:new RegExp("^"+base+"(?:\\.\\d+)?$")});
  const values=updated.match(/.{1,3180}/g)!;
  await page.context().addCookies(values.map((value,i)=>({...chunks[0],name:values.length===1?base:base+"."+i,value})));
  await page.goto("/conta");await expect(page.getByLabel("Nome de exibição")).toHaveValue("Perfil persistente");
  const renewed=(await page.context().cookies()).filter(c=>c.name===base||c.name.startsWith(base+".")).sort((a,b)=>a.name.localeCompare(b.name)).map(c=>c.value).join("");
  const newSession=JSON.parse(Buffer.from(renewed.replace(/^base64-/,""),"base64url").toString());
  expect(newSession.refresh_token!==oldRefresh).toBe(true);
  await start();await page.goto("http://127.0.0.1:3102/conta");await expect(page.getByLabel("Nome de exibição")).toHaveValue("Perfil persistente");await stop();
  await start();await page.reload();await expect(page.getByLabel("Nome de exibição")).toHaveValue("Perfil persistente");await stop();
  await page.goto("/conta");await page.getByRole("button",{name:"Sair",exact:true}).click();await expect(page).toHaveURL("/entrar");
  await page.goto("/recuperar-senha");await page.getByLabel("E-mail",{exact:true}).fill(email);await page.getByRole("button",{name:"Solicitar recuperação"}).click();await expect(page.getByRole("status")).toContainText("instruções");
  await emailLink("recovery");await expect.poll(()=>new URL(page.url()).pathname).toBe("/redefinir-senha");
  const nextPassword=randomUUID()+"Aa1!";await page.getByLabel("Nova senha",{exact:true}).fill(nextPassword);await page.getByLabel("Confirme a senha").fill(nextPassword);await page.getByRole("button",{name:"Salvar nova senha"}).click();await expect(page).toHaveURL("/entrar?senha=alterada");
 } finally {
  await stop();
  const rows=await sql.query("select id from auth.users where email=$1",[email]);for(const row of rows.rows)await admin.auth.admin.deleteUser(row.id);
  if(mailIds.size)await fetch("http://127.0.0.1:54324/api/v1/messages",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({IDs:[...mailIds]})});
  await sql.end();
 }
});
