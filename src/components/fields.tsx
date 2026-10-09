import type {InputHTMLAttributes} from "react";
export function Field({name,label,value,area=false,...props}:InputHTMLAttributes<HTMLInputElement>&{name:string;label:string;value?:string|number;area?:boolean}) {
 return <div className="field"><label htmlFor={props.id??name}>{label}</label>{area?<textarea id={props.id??name} name={name} defaultValue={value} required={props.required} maxLength={props.maxLength??2000} rows={3}/>:<input id={props.id??name} name={name} defaultValue={value} {...props}/>}</div>;
}
export function Select({name,label,value,options,id}:{name:string;label:string;value?:string;options:Record<string,string>;id?:string}) {
 const fieldId=id??name;
 return <div className="field"><label htmlFor={fieldId}>{label}</label><select id={fieldId} name={name} defaultValue={value}>{Object.entries(options).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>;
}
