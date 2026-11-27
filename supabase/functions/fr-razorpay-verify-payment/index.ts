import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={ "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"authorization, apikey, content-type", "Access-Control-Allow-Methods":"POST, OPTIONS" };
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,"Content-Type":"application/json"}});
async function hmacHex(secret:string,message:string){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const sig=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(message));return Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,"0")).join("");}
function constantTimeEqual(a:string,b:string){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return json({error:"POST required"},405);
 const token=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
 const url=Deno.env.get("SUPABASE_URL"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),keyId=Deno.env.get("RAZORPAY_KEY_ID"),secret=Deno.env.get("RAZORPAY_KEY_SECRET");
 if(!url||!service||!keyId||!secret)return json({error:"Payment server configuration missing"},503);
 const sb=createClient(url,service,{auth:{persistSession:false}});
 const {data:{user},error:userError}=await sb.auth.getUser(token);
 if(userError||!user)return json({error:"Authentication required"},401);
 let body:{razorpay_order_id?:string;razorpay_payment_id?:string;razorpay_signature?:string};
 try{body=await req.json()}catch{return json({error:"Invalid JSON"},400)}
 const orderId=body.razorpay_order_id||"",paymentId=body.razorpay_payment_id||"",signature=body.razorpay_signature||"";
 if(!orderId||!paymentId||!signature||orderId.length>100||paymentId.length>100||signature.length!==64)return json({error:"Missing or invalid Razorpay fields"},400);
 const expected=await hmacHex(secret,orderId+"|"+paymentId);
 if(!constantTimeEqual(expected,signature))return json({error:"Payment signature invalid"},400);
 const {data:record,error:lookupError}=await sb.from("fr_razorpay_payment_orders").select("*").eq("razorpay_order_id",orderId).eq("user_id",user.id).single();
 if(lookupError||!record)return json({error:"Payment order not found for this account"},404);
 if(record.status==="paid"&&record.razorpay_payment_id===paymentId)return json({verified:true,status:"paid",amount_paise:record.amount_paise,order_id:orderId,payment_id:paymentId});
 if(record.status!=="created")return json({error:"Payment order is not eligible for verification"},409);
 const rp=await fetch("https://api.razorpay.com/v1/payments/"+encodeURIComponent(paymentId),{headers:{Authorization:"Basic "+btoa(keyId+":"+secret)}});
 if(!rp.ok){console.error("Razorpay payment lookup failed",rp.status);return json({error:"Payment lookup failed"},502)}
 const payment=await rp.json();
 if(payment.order_id!==orderId||payment.status!=="captured"||payment.amount!==record.amount_paise||payment.currency!==record.currency)return json({error:"Razorpay payment does not match this order"},400);
 const {data:updated,error:updateError}=await sb.from("fr_razorpay_payment_orders").update({status:"paid",razorpay_payment_id:paymentId,verified_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",record.id).eq("status","created").select("id").single();
 if(updateError||!updated)return json({error:"Payment was verified but could not be recorded"},500);
 return json({verified:true,status:"paid",amount_paise:record.amount_paise,order_id:orderId,payment_id:paymentId});
});
