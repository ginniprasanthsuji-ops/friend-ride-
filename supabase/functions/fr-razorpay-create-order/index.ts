import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={ "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"authorization, apikey, content-type", "Access-Control-Allow-Methods":"POST, OPTIONS" };
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,"Content-Type":"application/json"}});
const feeFor=(subtotal:number)=>Math.min(2500,Math.round(subtotal*0.025));
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return json({error:"POST required"},405);
 const token=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
 const url=Deno.env.get("SUPABASE_URL"), service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 const keyId=Deno.env.get("RAZORPAY_KEY_ID"), keySecret=Deno.env.get("RAZORPAY_KEY_SECRET");
 if(!url||!service||!keyId||!keySecret)return json({error:"Payment server configuration missing"},503);
 const sb=createClient(url,service,{auth:{persistSession:false}});
 const {data:{user},error:userError}=await sb.auth.getUser(token);
 if(userError||!user)return json({error:"Authentication required"},401);
 let body:{subtotal_paise?:number;store_id?:string};
 try{body=await req.json()}catch{return json({error:"Invalid JSON"},400)}
 const subtotal=Number(body.subtotal_paise);
 if(!Number.isSafeInteger(subtotal)||subtotal<0||subtotal>100000000)return json({error:"Invalid subtotal"},400);
 if(!body.store_id||String(body.store_id).length>128)return json({error:"Store ID required"},400);
 const amount=feeFor(subtotal);
 if(amount<=0)return json({error:"Platform fee is zero; no payment order needed"},400);
 const authHeader="Basic "+btoa(keyId+":"+keySecret);
 const rp=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",headers:{"Authorization":authHeader,"Content-Type":"application/json"},body:JSON.stringify({amount,currency:"INR",receipt:"fr-"+crypto.randomUUID().slice(0,24),notes:{user_id:user.id,store_id:String(body.store_id),purpose:"friendride_platform_fee"}})});
 if(!rp.ok){const err=await rp.text();console.error("Razorpay order API failed",rp.status,err.slice(0,400));return json({error:"Unable to create Razorpay order"},502)}
 const order=await rp.json();
 const {error:dbError}=await sb.from("fr_razorpay_payment_orders").insert({user_id:user.id,purpose:"platform_fee",store_id:String(body.store_id),subtotal_paise:subtotal,amount_paise:amount,currency:"INR",razorpay_order_id:order.id,status:"created"});
 if(dbError){console.error("Payment order record insert failed",dbError.message);return json({error:"Could not save payment order"},500)}
 return json({order_id:order.id,amount:order.amount,currency:order.currency,key_id:keyId,fee_paise:amount});
});
