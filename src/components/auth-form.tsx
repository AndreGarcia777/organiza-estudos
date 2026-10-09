"use client";
import { useActionState } from "react";
import { authenticate } from "@/app/auth/actions";
import type { AuthState } from "@/lib/auth/validation";

export function AuthForm({ mode, next = "/conta" }: { mode: "login" | "signup" | "recover" | "reset"; next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(authenticate, {});
  const newPassword = mode === "signup" || mode === "reset";
  const labels = { login: "Entrar", signup: "Criar conta", recover: "Solicitar recuperação", reset: "Salvar nova senha" };
  return <form action={action} className="auth-form">
    <input type="hidden" name="mode" value={mode} />
    <input type="hidden" name="next" value={next} />
    {mode !== "reset" && <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>}
    {mode !== "recover" && <div className="field"><label htmlFor="password">{newPassword ? "Nova senha" : "Senha"}</label><input id="password" name="password" type="password" autoComplete={newPassword ? "new-password" : "current-password"} minLength={newPassword ? 12 : 1} maxLength={128} required />{newPassword && <small>Use de 12 a 128 caracteres.</small>}</div>}
    {newPassword && <div className="field"><label htmlFor="confirmPassword">Confirme a senha</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></div>}
    {state.error && <p role="alert" className="form-error">{state.error}</p>}
    {state.message && <p role="status" className="demo-callout">{state.message}</p>}
    <button className="button primary" disabled={pending} type="submit">{pending ? "Aguarde…" : labels[mode]}</button>
  </form>;
}
