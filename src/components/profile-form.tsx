"use client";
import { useActionState } from "react";
import { saveProfile } from "@/app/auth/actions";
import type { AuthState } from "@/lib/auth/validation";

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(saveProfile, {});
  return <form className="auth-form" action={action}>
    <div className="field"><label htmlFor="displayName">Nome de exibição</label><input id="displayName" name="displayName" defaultValue={displayName} minLength={2} maxLength={60} required /><small>Use um nome público, sem e-mail ou telefone.</small></div>
    {state.error && <p role="alert" className="form-error">{state.error}</p>}
    {state.message && <p role="status">{state.message}</p>}
    <button className="button primary" disabled={pending}>{pending ? "Salvando…" : "Salvar nome"}</button>
  </form>;
}
