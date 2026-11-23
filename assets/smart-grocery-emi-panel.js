/* Smart Grocery EMI onboarding panel (standalone UI mount helper).
 * Integration point: call mountSmartGroceryEmiPanel(container) from the app route.
 * No credentials, OTPs, report PDFs, or identity data are collected here.
 */
(function(global){
 const DIGILOCKER="https://www.digilocker.gov.in/";
 const CIBIL="https://www.cibil.com/freecibilscore";
 function mountSmartGroceryEmiPanel(container){
  if(!container) throw new Error("Mount container required");
  container.innerHTML=`
   <section class="fr-emi-onboard" aria-label="Smart Grocery EMI onboarding">
    <header><h2>🛒 Smart Grocery EMI</h2><p>Apply for an approved grocery credit limit</p></header>
    <article class="fr-emi-step"><h3>1. Identity information</h3><p>DigiLocker helps you access government-issued digital documents. Availability depends on issuer.</p><a rel="noopener noreferrer" target="_blank" href="${DIGILOCKER}">Open Official DigiLocker ↗</a><p class="fr-emi-warning">Never share DigiLocker password or OTP with FRIEND RIDE. Document verification requires an authorized integration and your consent.</p></article>
    <article class="fr-emi-step"><h3>2. Credit information</h3><p>Read the credit enquiry purpose and provider information. Separate consent is required before any authorized enquiry.</p><a rel="noopener noreferrer" target="_blank" href="${CIBIL}">Check Free CIBIL Score & Report ↗</a><p>After viewing your report, you may enter the score below. This entry is not verified by FRIEND RIDE.</p>
     <label for="fr-emi-cibil-score">Score (300–900)</label><input id="fr-emi-cibil-score" inputmode="numeric" type="number" min="300" max="900" placeholder="Enter score" />
     <label for="fr-emi-cibil-date">Report date</label><input id="fr-emi-cibil-date" type="date" />
     <label class="fr-emi-consent"><input id="fr-emi-cibil-consent" type="checkbox" /> I consent to storing this score and report date for this EMI application.</label>
     <button type="button" id="fr-emi-cibil-save">Save score in this screen</button><div id="fr-emi-cibil-result" role="status" aria-live="polite"></div>
    </article>
    <article class="fr-emi-step"><h3>3. Application review</h3><p>Credit limit is shown only after valid lender or authorized Admin approval. Approval is not guaranteed.</p></article>
   </section>`;
  const save=container.querySelector("#fr-emi-cibil-save"),out=container.querySelector("#fr-emi-cibil-result");
  save.addEventListener("click",()=>{
   const score=Number(container.querySelector("#fr-emi-cibil-score").value),date=container.querySelector("#fr-emi-cibil-date").value,consent=container.querySelector("#fr-emi-cibil-consent").checked;
   if(!consent){out.textContent="Please provide consent first.";return;}
   if(!Number.isInteger(score)||score<300||score>900){out.textContent="Enter a valid score from 300 to 900.";return;}
   if(!date){out.textContent="Choose your report date.";return;}
   out.innerHTML="";
   const card=document.createElement("div");card.className="fr-emi-score-card";
   const heading=document.createElement("strong");heading.textContent=score+" / 900";
   const status=document.createElement("small");status.textContent="Customer-entered • Unverified";
   const report=document.createElement("small");report.textContent="Report date: "+date;
   card.append(heading,status,report);out.append(card);
   out.dataset.score=String(score);out.dataset.reportDate=date;out.dataset.consent="true";
  });
  return {unmount(){container.replaceChildren();}};
 }
 global.FRIEND_RIDE_EMI_PANEL={mount:mountSmartGroceryEmiPanel};
})(window);
