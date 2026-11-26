const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna driver ride feed and accept/counter-offer are limited to fresh online GPS within 15km', () => {
 const sql=fs.readFileSync(path.join(__dirname,'..','supabase','migrations','202611220007_arjuna_qa_ride_lifecycle_rpcs.sql'),'utf8').replace(/\\s+/g,' ');
 for(const fn of ['get_driver_requests','accept_ride','counter_offer_ride']){
  const start=sql.indexOf('function public.'+fn);
  assert.ok(start>=0,'RPC present: '+fn);
  const end=sql.indexOf('end $$;',start);
  const body=sql.slice(start,end);
  assert.match(body,/driver_locations/i,'driver location gating in '+fn);
  assert.match(body,/is_online=true/i,'online-only gating in '+fn);
  assert.match(body,/updated_at>=now\(\)-interval '5 minutes'/i,'fresh GPS gating in '+fn);
  assert.match(body,/<=15/i,'15km proximity limit in '+fn);
  assert.match(body,/pickup_lat is not null/i,'requires pickup coordinates in '+fn);
  assert.match(body,/pickup_lng is not null/i,'requires pickup coordinates in '+fn);
 }
});
