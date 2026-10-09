import {RequestDetail} from "@/components/request-detail";
export const metadata={title:"Atendimento do pedido"};
export default async function AdminRequest({params}:{params:Promise<{id:string}>}){return <RequestDetail id={(await params).id} administrator/>;}
