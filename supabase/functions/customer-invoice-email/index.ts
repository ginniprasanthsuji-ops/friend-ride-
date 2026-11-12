import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
function b64(bytes:Uint8Array){let s="";for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(s)}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 const out=(v:unknown,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{...cors,"Content-Type":"application/json"}});
 if(req.method!=="POST")return out({error:"Method not allowed"},405);
 const url=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),resend=Deno.env.get("RESEND_API_KEY"),from=Deno.env.get("FRIENDRIDE_INVOICE_FROM");
 if(!url||!anon||!service||!resend||!from)return out({error:"Email service is not configured. Set RESEND_API_KEY and FRIENDRIDE_INVOICE_FROM secrets."},503);
 const auth=req.headers.get("Authorization")||"";if(!auth.startsWith("Bearer "))return out({error:"Authentication required"},401);
 const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});
 const {data:u,error:ue}=await userClient.auth.getUser();if(ue||!u.user)return out({error:"Invalid session"},401);
 let body:{invoice_id?:string};try{body=await req.json()}catch{return out({error:"Invalid JSON"},400)}
 if(!body.invoice_id||!/^[0-9a-f-]{36}$/i.test(body.invoice_id))return out({error:"Invalid invoice ID"},400);
 const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:inv,error}=await admin.from("invoices").select("id,customer_id,invoice_number,payment_status,pdf_path,customer_email,customer_name,amount").eq("id",body.invoice_id).eq("customer_id",u.user.id).maybeSingle();
 if(error)return out({error:"Invoice lookup failed"},500);if(!inv)return out({error:"Invoice not found"},404);
 if(inv.payment_status!=="paid"||!inv.pdf_path)return out({error:"Paid invoice PDF is not ready"},409);
 const recipient=inv.customer_email||u.user.email;if(!recipient)return out({error:"Customer email is unavailable"},422);
 if(!inv.pdf_path.startsWith(u.user.id+"/"))return out({error:"Invalid invoice storage path"},403);
 const {data:file,error:fe}=await admin.storage.from("friendride-invoices").download(inv.pdf_path);if(fe||!file)return out({error:"Invoice PDF unavailable"},404);
 const bytes=new Uint8Array(await file.arrayBuffer());
 const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+resend,"Content-Type":"application/json"},body:JSON.stringify({from,to:[recipient],subject:"Your FRIEND RIDE payment document "+inv.invoice_number,html:"<p>Hello "+(inv.customer_name||"Customer")+",</p><p>Thank you for using FRIEND RIDE. Your payment document is attached.</p><p>Invoice: "+inv.invoice_number+"<br>Amount: INR "+Number(inv.amount).toFixed(2)+"</p><p>Regards,<br>FRIEND RIDE</p>",attachments:[{filename:inv.invoice_number+".pdf",content:b64(bytes)}]})});
 const result=await response.json().catch(()=>({}));
 const status=response.ok?"sent":"failed";
 await admin.from("invoice_email_logs").insert({invoice_id:inv.id,recipient_email:recipient,provider:"resend",provider_message_id:result.id||null,status,error_message:response.ok?null:JSON.stringify(result).slice(0,1000)});
 if(!response.ok){await admin.from("invoices").update({email_status:"failed"}).eq("id",inv.id);return out({error:"Email provider rejected the request"},502)}
 await admin.from("invoices").update({email_status:"sent"}).eq("id",inv.id);
 return out({sent:true,recipient});
});
