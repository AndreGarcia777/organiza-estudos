"use client";
import { logout } from "@/app/auth/actions";
export function LogoutButton() {
  return <form action={logout} onSubmit={() => { try { sessionStorage.removeItem("guia-estudos:request-draft:v1"); } catch { /* The draft is also isolated by account ID. */ } }}><button className="button secondary">Sair</button></form>;
}
