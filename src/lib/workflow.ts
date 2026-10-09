export const states: Record<string,string> = { received:"Recebido", in_review:"Em análise", awaiting_information:"Aguardando informações", selection_available:"Seleção disponível", adjustment_requested:"Ajuste solicitado", completed:"Concluído", cancelled:"Cancelado" };
export const commercial: Record<string,string> = {to_agree:"A combinar",free_pilot:"Piloto gratuito",awaiting_payment:"Aguardando pagamento",payment_reported:"Pagamento informado pelo administrador",cancelled:"Cancelado"};
export const transitions: Record<string,string[]> = {received:["in_review","cancelled"],in_review:["awaiting_information","cancelled"],awaiting_information:["in_review","cancelled"],selection_available:["completed","cancelled"],adjustment_requested:["in_review","cancelled"],completed:[],cancelled:[]};
export const money = (cents: number | null | undefined) => cents == null ? "Não combinado" : new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(cents/100);
export const uuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export type Operation = "request"|"material"|"offer"|"manage"|"selection"|"publish"|"feedback"|"answer"|"review"|"moderate_review";
export type Result = {error?:string;message?:string;href?:string};
