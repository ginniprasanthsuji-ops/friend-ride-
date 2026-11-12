import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const cors = { "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods":"POST, OPTIONS" };
const enc = new TextEncoder();
function b64(bytes: Uint8Array) { let s=""; for (let i=0;i<bytes.length;i+=0x8000) s+=String.fromCharCode(...bytes.subarray(i,i+0x8000)); return btoa(s); }
function safeText(v: unknown) { return String(v ?? "—").replace(/[\r\n\t]+/g," ").slice(0,180); }

Deno.serve(async (req) => {
 if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
 const respond=(v:unknown,status=200)=>new Response(JSON.stringify(v),{status,headers:{...cors,"Content-Type":"application/json"}});
 if(req.method!=="POST") return respond({error:"Method not allowed"},405);
 const url=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!anon||!service) return respond({error:"Server configuration missing"},500);
 const auth=req.headers.get("Authorization")||"";
 if(!auth.startsWith("Bearer ")) return respond({error:"Authentication required"},401);
 const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});
 const {data:ud,error:ue}=await userClient.auth.getUser();
 if(ue||!ud.user) return respond({error:"Invalid session"},401);
 let body:{invoice_id?:string};try{body=await req.json()}catch{return respond({error:"Invalid JSON"},400)}
 if(!body.invoice_id||!/^[0-9a-f-]{36}$/i.test(body.invoice_id))return respond({error:"Invalid invoice ID"},400);
 const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:inv,error}=await admin.from("invoices").select("*").eq("id",body.invoice_id).eq("customer_id",ud.user.id).maybeSingle();
 if(error)return respond({error:"Invoice lookup failed"},500);
 if(!inv)return respond({error:"Invoice not found"},404);
 if(inv.payment_status!=="paid")return respond({error:"Only confirmed paid transactions have a downloadable receipt"},409);
 let path=inv.pdf_path;
 if(!path){
  const pdf=await PDFDocument.create(),page=pdf.addPage([595.28,841.89]),font=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const purple=rgb(0.33,0.13,0.72);page.drawText("FRIEND RIDE",{x:48,y:790,size:24,font:bold,color:purple});
  page.drawText(inv.document_type==="tax_invoice"?"TAX INVOICE":inv.document_type==="credit_note"?"CREDIT NOTE":"PAYMENT RECEIPT",{x:48,y:755,size:15,font:bold});
  const lines=[
   ["Invoice Number",inv.invoice_number],["Invoice Date",inv.issued_at?new Date(inv.issued_at).toLocaleString("en-IN"):"—"],
   ["Customer",inv.customer_name||ud.user.user_metadata?.full_name||"Customer"],["Customer Email",inv.customer_email||ud.user.email||"—"],
   ["Service",inv.source_type],["Reference",inv.source_id||"—"],["Seller / Provider",inv.seller_name||"—"],
   ["Seller GSTIN",inv.seller_gstin||"—"],["Place of Supply",inv.place_of_supply||"—"],["Payment Status","PAID"],
  ];
  let y=715;for(const [k,v] of lines){page.drawText(k,{x:48,y,size:10,font:bold,color:rgb(.35,.32,.4)});page.drawText(safeText(v),{x:190,y,size:10,font});y-=25;}
  y-=8;page.drawLine({start:{x:48,y},end:{x:547,y},thickness:1,color:rgb(.82,.79,.87)});y-=35;
  page.drawText("Amount Paid",{x:48,y,size:13,font:bold});page.drawText("INR "+Number(inv.amount).toFixed(2),{x:400,y,size:15,font:bold,color:purple});
  y-=45;page.drawText("Transaction details",{x:48,y,size:12,font:bold});y-=22;
  const detail=inv.details&&typeof inv.details==="object"?inv.details:{};
  const detailLines=Array.isArray(detail.items)?detail.items.slice(0,12):[];
  for(const item of detailLines){const label=safeText(item?.description||item?.name||"Item");const amount=safeText(item?.amount??"");page.drawText(label,{x:55,y,size:9,font});page.drawText(amount,{x:430,y,size:9,font});y-=17;}
  page.drawText("This document is generated electronically by FRIEND RIDE.",{x:48,y:55,size:8,font,color:rgb(.4,.4,.4)});
  const bytes=await pdf.save();path=ud.user.id+"/"+inv.invoice_number.replace(/[^a-zA-Z0-9._-]/g,"_")+".pdf";
  const {error:up}=await admin.storage.from("friendride-invoices").upload(path,bytes,{contentType:"application/pdf",upsert:true});
  if(up)return respond({error:"PDF storage failed"},500);
  const {error:save}=await admin.from("invoices").update({pdf_path:path}).eq("id",inv.id).eq("customer_id",ud.user.id);
  if(save)return respond({error:"PDF record update failed"},500);
 }
 if(!path.startsWith(ud.user.id+"/"))return respond({error:"Invalid invoice storage path"},403);
 const {data:signed,error:se}=await admin.storage.from("friendride-invoices").createSignedUrl(path,60,{download:(inv.invoice_number||"FRIEND-RIDE-Invoice")+".pdf"});
 if(se||!signed?.signedUrl)return respond({error:"Could not create secure download link"},500);
 return respond({url:signed.signedUrl,file_name:(inv.invoice_number||"FRIEND-RIDE-Invoice")+".pdf"});
});
