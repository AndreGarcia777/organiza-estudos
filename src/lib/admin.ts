import "server-only";
import {notFound} from "next/navigation";
import {requireUser} from "@/lib/auth/session";
export async function requireAdmin() {
 const identity=await requireUser("/admin");
 if(!identity)notFound();
 const {data,error}=await identity.client.rpc("is_admin");
 if(error)throw new Error("Não foi possível verificar a permissão.");
 if(!data)notFound();
 return identity;
}
