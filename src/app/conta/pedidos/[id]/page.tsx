import {RequestDetail} from "@/components/request-detail";
export const metadata={title:"Detalhes do pedido"};
export default async function StudentRequest({params}:{params:Promise<{id:string}>}){return <RequestDetail id={(await params).id}/>;}
