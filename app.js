'use strict';
// Connect a future analytics provider here. Never send addresses or email addresses.
function track(event, data = {}) { console.info('[omgevingsrapport]', event, data); window.dispatchEvent(new CustomEvent('omgevingsrapport:track', { detail: { event, data } })); }
window.track = track;
const PACKAGES = {los:'Los rapport — €14,95', huizenjacht:'Huizenjacht (3 adressen) — €29,95', makelaars:'Voor makelaars — op aanvraag'};
function parseAddress(raw) {
 const value = raw.trim();
 if (/^(https?:\/\/|www\.)/i.test(value) || /^funda\.nl\//i.test(value)) {
  let url; try { url = new URL(/^https?:/i.test(value) ? value : 'https://' + value); } catch { throw new Error('Deze link is niet geldig. Vul het adres in.'); }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Gebruik een Funda-link of vul het adres in.');
  if (!['funda.nl','www.funda.nl'].includes(url.hostname)) throw new Error('Gebruik een link van funda.nl, of vul het adres zelf in.');
  const parts = decodeURIComponent(url.pathname).split('/').filter(Boolean);
  const slugIndex = parts.findIndex(p => /^(huis|appartement|woning)-/.test(p));
  if (slugIndex < 1) throw new Error('We kunnen geen adres uit deze Funda-link halen. Vul straat, huisnummer en plaats in.');
  let slug = parts[slugIndex].replace(/^(huis|appartement|woning)-/, '').replace(/^\d{6,}-/, '').replace(/-\d{6,}$/, '');
  if (!/\d/.test(slug)) throw new Error('Het huisnummer ontbreekt in deze link. Vul het adres zelf in.');
  return (slug.replace(/-/g,' ') + ', ' + parts[slugIndex-1].replace(/-/g,' ')).replace(/\b\p{L}/gu, c => c.toLocaleUpperCase('nl'));
 }
 if (value.length < 5 || !/\d/.test(value) || !/[a-zà-ÿ]/i.test(value)) throw new Error('Vul een straat, huisnummer en plaats in, bijvoorbeeld Otto Bonsemalaan 4 Groningen.');
 return value;
}
window.parseAddress = parseAddress;
const themes = [
 ['Verborgen gebreken','amber','!','Aandachtspunt','Voorbeeld: bouwjaar vraagt om extra vragen over vocht en onderhoud.','https://bagviewer.kadaster.nl/','BAG'],
 ['Buren en lawaai','amber','!','Aandachtspunt','Voorbeeld: een weg in de omgeving kan geluid geven. Ga ook eens ’s avonds kijken.','https://www.atlasleefomgeving.nl/kaarten','Atlas Leefomgeving'],
 ['Wat komt er naast mij','green','✓','Geen signaal in de demo','Voorbeeld: geen nieuwbouwsignaal opgenomen. Dit zegt niets over jouw adres.','https://omgevingswet.overheid.nl/regels-op-de-kaart/','Regels op de kaart'],
 ['Kosten en erfpacht'],['Fundering en klimaat'],['Veiligheid'],['Bodem en gezondheid'],['VvE'],['Aardbevingen']
];
const form = document.querySelector('#address-form');
if (form) {
 const dialog = document.querySelector('dialog');
 form.addEventListener('submit', event => { event.preventDefault(); const error = document.querySelector('#address-error'); error.textContent='';
  try {
   const raw = document.querySelector('#address').value; const address = parseAddress(raw);
   document.querySelector('#result-address').textContent = address;
   track('adres_ingevoerd', { type: /funda\.nl/i.test(raw) ? 'funda_link':'adres' });
   const inGroningen = /\bgroningen\b/i.test(address);
   document.querySelector('#cards').replaceChildren(...themes.map((theme,i) => {
    const card=document.createElement('article'); const title=document.createElement('h3'); title.textContent=theme[0];
    const badge=document.createElement('span'); badge.className='status '+(theme[1]||'amber'); badge.textContent=theme[2]||'−';
    card.append(badge,title);
    if(i<3){const label=document.createElement('b');label.className='small';label.textContent=theme[3]; const p=document.createElement('p');p.textContent=theme[4]; const a=document.createElement('a');a.className='source';a.href=theme[5];a.textContent='Bronregister: '+theme[6]+' ↗';card.append(label,p,a);}
    else {card.className='locked';const p=document.createElement('p');p.className='masked';p.setAttribute('aria-hidden','true');p.textContent='Toelichting en bronnen bij dit onderdeel van het voorbeeldrapport.'; const lock=document.createElement('span');lock.className='lock-label';lock.textContent=i===8&&!inGroningen?'Alleen voor Groningen · niet van toepassing':'▣ In het volledige rapport';card.append(p,lock); if(i===8){badge.textContent=inGroningen?'!':'−';}}
    return card;
   }));
   const teaser=document.querySelector('#teaser'); teaser.hidden=false; track('teaser_bekeken',{demo:true}); teaser.focus();teaser.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  } catch(e) {error.textContent=e.message;document.querySelector('#address').focus();}
 });
 document.querySelectorAll('[data-buy]').forEach(button=>button.addEventListener('click',()=>{track('koop_klik',{pakket:button.dataset.buy});document.querySelector('#package').value=button.dataset.buy;track('pakket_gekozen',{pakket:button.dataset.buy});dialog.showModal();}));
 dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
 document.querySelector('#package').addEventListener('change',e=>track('pakket_gekozen',{pakket:e.target.value}));
 document.querySelector('#checkout-form').addEventListener('submit',e=>{e.preventDefault();const pakket=document.querySelector('#package').value;try{localStorage.setItem('omgevingsrapport_email',document.querySelector('#email').value.trim());}catch{alert('Lokaal opslaan is niet beschikbaar. Sta browseropslag toe om deze demo te proberen.');return;}track('email_achtergelaten',{pakket});location.href='checkout.html?pakket='+encodeURIComponent(pakket);});
}
const deleteButton=document.querySelector('#delete-email');if(deleteButton)deleteButton.addEventListener('click',()=>{try{localStorage.removeItem('omgevingsrapport_email');document.querySelector('#delete-status').textContent=' Je e-mail is lokaal verwijderd.';}catch{document.querySelector('#delete-status').textContent=' Browseropslag is niet beschikbaar.';}});
const packageLabel=document.querySelector('#chosen-package');if(packageLabel){const pakket=new URLSearchParams(location.search).get('pakket');packageLabel.textContent=PACKAGES[pakket]||'Nog geen pakket gekozen';const signup=document.querySelector('#signup');signup.addEventListener('submit',e=>{e.preventDefault();try{localStorage.setItem('omgevingsrapport_email',document.querySelector('#signup-email').value.trim());track('email_achtergelaten',{pakket:PACKAGES[pakket]?pakket:'onbekend'});document.querySelector('#signup-status').textContent='Je e-mail staat alleen in deze browser. Deze demo verstuurt geen aanmelding; je ontvangt nog geen bericht bij lancering.';}catch{document.querySelector('#signup-status').textContent='Opslaan is niet gelukt. Browseropslag is niet beschikbaar.';}});}
