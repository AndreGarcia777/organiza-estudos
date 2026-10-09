"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/supabase/server";
import { appOrigin, authEmailFlowsEnabled } from "@/lib/app-mode";
import { safeNext, validEmail, validPassword, type AuthState } from "@/lib/auth/validation";

export async function authenticate(_state: AuthState, form: FormData): Promise<AuthState> {
  const mode = String(form.get("mode") ?? "");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = safeNext(form.get("next"));
  if (!["login", "signup", "recover", "reset"].includes(mode)) return { error: "Operação inválida." };
  if (mode !== "login" && !authEmailFlowsEnabled()) {
    return { error: "Cadastro e recuperação de senha estão desativados nesta versão de avaliação. Use uma conta previamente preparada pelo responsável." };
  }
  if (mode !== "reset" && !validEmail(email)) return { error: "Informe um e-mail válido." };
  if (["signup", "reset"].includes(mode) && !validPassword(password)) return { error: "Use uma senha de 12 a 128 caracteres." };
  if (mode === "login" && (password.length < 1 || password.length > 128)) return { error: "Informe sua senha." };
  if (["signup", "reset"].includes(mode) && password !== form.get("confirmPassword")) return { error: "As senhas devem ser iguais." };

  let target: string | null = null;
  try {
    const client = await createSupabaseServer();
    if (!client) return { error: "Autenticação indisponível no modo demonstração. Nenhum dado foi enviado." };
    if (mode === "login") {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) return { error: "Não foi possível entrar. Confira os dados da conta ou tente novamente mais tarde." };
      target = next;
    } else if (mode === "signup") {
      const { error } = await client.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${appOrigin()}/auth/callback?next=${next}` },
      });
      if (error) return { error: "Não foi possível solicitar o cadastro. Confira os dados e tente novamente mais tarde." };
      return { message: "Se o cadastro puder ser realizado, você receberá as instruções no e-mail informado. Confira também a pasta de spam." };
    } else if (mode === "recover") {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${appOrigin()}/auth/callback?next=/redefinir-senha`,
      });
      if (error) return { error: "Não foi possível solicitar a recuperação agora. Tente novamente mais tarde." };
      return { message: "Se houver uma conta elegível, as instruções serão enviadas ao e-mail informado." };
    } else {
      const { data: { user }, error: userError } = await client.auth.getUser();
      if (userError || !user) return { error: "O link expirou ou a sessão não é válida. Solicite uma nova recuperação." };
      const { error } = await client.auth.updateUser({ password });
      if (error) return { error: "Não foi possível alterar a senha. Solicite um novo link ou tente uma senha diferente." };
      const { error: signOutError } = await client.auth.signOut({ scope: "global" });
      if (signOutError) return { message: "Senha alterada. Não foi possível encerrar todas as sessões; use Sair na sua conta." };
      target = "/entrar?senha=alterada";
    }
  } catch {
    return { error: "O serviço de autenticação está indisponível. Tente novamente mais tarde." };
  }
  revalidatePath("/", "layout");
  redirect(target ?? "/conta");
}

export async function logout() {
  const client = await createSupabaseServer();
  if (client) {
    const { error } = await client.auth.signOut();
    if (error) redirect("/conta?erro=sair");
  }
  revalidatePath("/", "layout");
  redirect("/entrar");
}

export async function saveProfile(_state: AuthState, form: FormData): Promise<AuthState> {
  const displayName = String(form.get("displayName") ?? "").trim();
  if (displayName.length < 2 || displayName.length > 60) return { error: "Use de 2 a 60 caracteres no nome de exibição." };
  try {
    const client = await createSupabaseServer();
    if (!client) return { error: "Perfis indisponíveis no modo demonstração." };
    const { data: { user } } = await client.auth.getUser();
    if (!user) return { error: "Entre novamente para salvar seu perfil." };
    const { data: profile, error: readError } = await client.from("profiles").select("id").eq("id", user.id).maybeSingle();
    if (readError) return { error: "Não foi possível carregar seu perfil." };
    const result = profile
      ? await client.from("profiles").update({ display_name: displayName }).eq("id", user.id)
      : await client.from("profiles").insert({ display_name: displayName });
    if (result.error) return { error: "Não foi possível salvar o perfil. Tente novamente." };
    revalidatePath("/conta");
    return { message: "Nome de exibição salvo." };
  } catch {
    return { error: "Serviço indisponível. Seu perfil não foi salvo." };
  }
}
