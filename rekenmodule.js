(function () {
/* Tarieven: pas hier de bedragen aan */
var LOONSTAFFEL = [[2, 14.5], [4, 12.5], [4, 11.5], [Infinity, 11]]; /* eerste 2 a 14,50, 3e-6e a 12,50, 7e-10e a 11,50, daarboven 11,- */
var JAARREKENING = 65, FISCAAL_ADVIES = 55, KORTING_GEEN_BTW = -15, JAARKORTING = 0.9;
var BASIS = { EZ: [98, 138, 198, 268], BV: [148, 198, 288, 368] };
var GRENS_BASIC = 148, GRENS_PROF = 268;

function loonKosten(n) {
var rest = Math.max(0, Math.round(n) || 0), som = 0;
for (var i = 0; i < LOONSTAFFEL.length && rest > 0; i++) {
var aantal = Math.min(rest, LOONSTAFFEL[i][0]);
som += aantal * LOONSTAFFEL[i][1];
rest -= aantal;
}
return som;
}

var state = { jaar: false, form: "EZ", vol: 1, loon: 0, extras: { jaarrek: false, advies: false, btw: true } };
function fmt(n) { return "\u20ac " + (Math.round(n * 100) / 100).toLocaleString("nl-NL", { minimumFractionDigits: 0, maximumFractionDigits: 2 }); }
function price() {
var p = BASIS[state.form][state.vol], e = state.extras;
p += loonKosten(state.loon) + (e.jaarrek ? JAARREKENING : 0) + (e.advies ? FISCAAL_ADVIES : 0) + (e.btw ? 0 : KORTING_GEEN_BTW);
return state.jaar ? p * JAARKORTING : p;
}
function render() {
var out = document.getElementById("v4t-calc-price");
if (out) {
var p = price();
out.textContent = fmt(p);
document.getElementById("v4t-calc-year").textContent = fmt(p * 12);
document.getElementById("v4t-calc-plan").textContent = p < GRENS_BASIC ? "Basic" : p < GRENS_PROF ? "Professional" : "Excellent";
}
var ls = document.getElementById("v4t-loonbedrag");
if (ls) ls.textContent = state.loon > 0 ? fmt(loonKosten(state.loon)) + " per maand" : "geen loonstroken";
Array.prototype.forEach.call(document.querySelectorAll(".v4t-price"), function (el) {
var b = parseFloat(el.getAttribute("data-base"));
el.textContent = fmt(state.jaar ? b * JAARKORTING : b);
});
Array.prototype.forEach.call(document.querySelectorAll("[data-billing]"), function (b) {
b.setAttribute("aria-pressed", String((b.getAttribute("data-billing") === "jaar") === state.jaar));
});
Array.prototype.forEach.call(document.querySelectorAll("[data-form]"), function (b) {
b.setAttribute("aria-pressed", String(b.getAttribute("data-form") === state.form));
});
Array.prototype.forEach.call(document.querySelectorAll("[data-vol]"), function (b) {
b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-vol")) === state.vol));
});
Array.prototype.forEach.call(document.querySelectorAll("[data-extra]"), function (b) {
var on = !!state.extras[b.getAttribute("data-extra")];
b.setAttribute("aria-pressed", String(on));
b.querySelector("span").textContent = on ? "+" : "\u2013";
});
}
document.addEventListener("click", function (ev) {
var t = ev.target.closest ? ev.target.closest("[data-billing],[data-form],[data-vol],[data-extra],[data-loonstap]") : null;
if (!t) return;
if (t.hasAttribute("data-loonstap")) {
var veld = document.getElementById("v4t-loonaantal");
state.loon = Math.max(0, Math.min(200, (Number(veld.value) || 0) + Number(t.getAttribute("data-loonstap"))));
veld.value = state.loon;
}
else if (t.hasAttribute("data-billing")) state.jaar = t.getAttribute("data-billing") === "jaar";
else if (t.hasAttribute("data-form")) state.form = t.getAttribute("data-form");
else if (t.hasAttribute("data-vol")) state.vol = Number(t.getAttribute("data-vol"));
else state.extras[t.getAttribute("data-extra")] = !state.extras[t.getAttribute("data-extra")];
render();
});
document.addEventListener("input", function (ev) {
if (ev.target && ev.target.id === "v4t-loonaantal") {
state.loon = Math.max(0, Math.min(200, Number(ev.target.value) || 0));
render();
}
});
render();
})();

/* Onthulling bij scrollen */
(function () {
if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
if (!("IntersectionObserver" in window)) return;
var kies = "section .v4t-kicker, section h2, .bs-cards2 > div, .v4t-plans > div, .v4t-cols > div, .bs-prose, .v4t-faq details, .bs-kopfoto, .v4t-calc";
var els = Array.prototype.slice.call(document.querySelectorAll(kies));
els.forEach(function (el) {
var i = Array.prototype.indexOf.call(el.parentNode.children, el);
el.style.transitionDelay = Math.min(i * 55, 220) + "ms";
el.classList.add("onthul");
});
var waarnemer = new IntersectionObserver(function (items) {
items.forEach(function (item) {
if (item.isIntersecting) { item.target.classList.add("zichtbaar"); waarnemer.unobserve(item.target); }
});
}, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
els.forEach(function (el) { waarnemer.observe(el); });
})();


/* Koppen in woorden splitsen, zodat ze bij het scrollen omhoog komen */
(function () {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  var koppen = document.querySelectorAll("section h2, .bs-pagehero h1, .v4t-service h3");

  function splits(el) {
    var kinderen = Array.prototype.slice.call(el.childNodes);
    var teller = 0;
    kinderen.forEach(function (knoop) {
      if (knoop.nodeType !== 3) return; // alleen echte tekst
      var tekst = knoop.textContent;
      if (!tekst.trim()) return;
      var stuk = document.createDocumentFragment();
      tekst.split(/(\s+)/).forEach(function (deel) {
        if (!deel) return;
        if (!deel.trim()) {
          stuk.appendChild(document.createTextNode(deel));
          return;
        }
        var buiten = document.createElement("span");
        buiten.className = "wrd";
        var binnen = document.createElement("i");
        binnen.textContent = deel;
        binnen.style.transitionDelay = Math.min(teller * 45, 340) + "ms";
        teller++;
        buiten.appendChild(binnen);
        stuk.appendChild(buiten);
      });
      el.replaceChild(stuk, knoop);
    });
    return teller > 0;
  }

  var lijst = [];
  Array.prototype.forEach.call(koppen, function (el) {
    if (el.querySelector(".wrd")) return;
    if (splits(el)) {
      el.classList.add("gesplitst");
      lijst.push(el);
    }
  });

  var waarnemer = new IntersectionObserver(function (items) {
    items.forEach(function (item) {
      if (item.isIntersecting) {
        item.target.classList.add("zichtbaar");
        waarnemer.unobserve(item.target);
      }
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -6% 0px" });

  lijst.forEach(function (el) {
    // wat al in beeld staat meteen tonen
    var r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.9) {
      setTimeout(function () { el.classList.add("zichtbaar"); }, 120);
    } else {
      waarnemer.observe(el);
    }
  });
})();

/* Mobiel menu, meetellende cijfers en een menubalk die op scrollen reageert */
(function () {
  var kop = document.querySelector('.v4t-head');
  var rij = document.querySelector('.v4t-head-row');
  var nav = document.querySelector('.v4t-nav');
  if (!kop || !rij || !nav) return;

  /* --- 1. Menubalk krijgt schaduw zodra je scrollt --- */
  var laatst = -1;
  function bijScroll() {
    var op = window.scrollY > 24;
    if (op !== laatst) { kop.classList.toggle('gescrold', op); laatst = op; }
  }
  window.addEventListener('scroll', bijScroll, { passive: true });
  bijScroll();

  /* --- 2. Mobiel menu opbouwen uit de bestaande navigatie --- */
  var knop = document.createElement('button');
  knop.className = 'bs-menuknop';
  knop.setAttribute('aria-label', 'Menu openen');
  knop.setAttribute('aria-expanded', 'false');
  knop.innerHTML = '<span></span><span></span><span></span>';

  var paneel = document.createElement('nav');
  paneel.className = 'bs-paneel';
  paneel.setAttribute('aria-label', 'Hoofdmenu');

  var paneelKop = document.createElement('div');
  paneelKop.className = 'bs-paneel-kop';
  var merk = document.createElement('span');
  merk.className = 'bs-logo bs-logo-om';
  merk.style.cssText = 'font-family:var(--font-heading);font-weight:700;font-size:24px;letter-spacing:-0.02em;color:#7ec2ec;line-height:1';
  merk.innerHTML = 'Boekhoud<span style="color:#ffffff">sterk.</span>';
  var sluit = document.createElement('button');
  sluit.className = 'bs-paneel-sluit';
  sluit.setAttribute('aria-label', 'Menu sluiten');
  sluit.innerHTML = '&times;';
  paneelKop.appendChild(merk);
  paneelKop.appendChild(sluit);
  paneel.appendChild(paneelKop);

  Array.prototype.forEach.call(nav.children, function (kind) {
    if (kind.tagName === 'A') {
      var a = document.createElement('a');
      a.href = kind.getAttribute('href');
      a.textContent = kind.textContent.trim();
      paneel.appendChild(a);
    } else if (kind.classList && kind.classList.contains('drop')) {
      var hoofd = kind.querySelector(':scope > a');
      if (hoofd) {
        var b = document.createElement('a');
        b.href = hoofd.getAttribute('href');
        b.textContent = hoofd.textContent.trim();
        paneel.appendChild(b);
      }
      Array.prototype.forEach.call(kind.querySelectorAll('.mi'), function (item) {
        if (item.classList.contains('mi-all')) return;
        var titel = item.querySelector('b');
        var s = document.createElement('a');
        s.className = 'sub';
        s.href = item.getAttribute('href');
        s.textContent = titel ? titel.textContent.trim() : item.textContent.trim();
        paneel.appendChild(s);
      });
    }
  });

  var cta = document.createElement('a');
  cta.className = 'bs-paneel-cta';
  cta.href = '/contact/';
  cta.textContent = 'Kennismaken';
  paneel.appendChild(cta);

  rij.appendChild(knop);
  document.body.appendChild(paneel);

  function zet(open) {
    paneel.classList.toggle('open', open);
    knop.setAttribute('aria-expanded', String(open));
    knop.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    document.body.classList.toggle('bs-vast', open);
    if (open) {
      Array.prototype.forEach.call(paneel.querySelectorAll('a'), function (a, i) {
        a.style.transitionDelay = (60 + i * 45) + 'ms';
      });
    }
  }
  knop.addEventListener('click', function () { zet(!paneel.classList.contains('open')); });
  sluit.addEventListener('click', function () { zet(false); });
  paneel.addEventListener('click', function (e) { if (e.target.tagName === 'A') zet(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zet(false); });

  /* --- 3. De cijfers in de hero tellen omhoog --- */
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var hero = document.querySelector('.v4t-hero');
  if (!hero) return;
  var cijfers = [];
  Array.prototype.forEach.call(hero.querySelectorAll('div'), function (el) {
    if (el.children.length) return;
    var m = /^(\d+)(\+|u|%)$/.exec(el.textContent.trim());
    if (m) cijfers.push({ el: el, doel: parseInt(m[1], 10), staart: m[2] });
  });
  if (!cijfers.length) return;

  cijfers.forEach(function (c) { c.el.classList.add('bs-telt'); c.el.textContent = '0' + c.staart; });

  function tel(c) {
    var start = performance.now(), duur = 1400;
    function stap(nu) {
      var v = Math.min((nu - start) / duur, 1);
      var soepel = 1 - Math.pow(1 - v, 3);
      c.el.textContent = Math.round(c.doel * soepel) + c.staart;
      if (v < 1) requestAnimationFrame(stap);
    }
    requestAnimationFrame(stap);
  }

  var w = new IntersectionObserver(function (items) {
    items.forEach(function (item) {
      if (!item.isIntersecting) return;
      var c = cijfers.filter(function (x) { return x.el === item.target; })[0];
      if (c) tel(c);
      w.unobserve(item.target);
    });
  }, { threshold: 0.6 });
  cijfers.forEach(function (c) { w.observe(c.el); });
})();

/* Contactformulier stelt een e-mail op */
(function(){
var k=document.getElementById("f-verstuur");
if(!k)return;
k.addEventListener("click",function(){
var w=function(id){var e=document.getElementById(id);return e?e.value.trim():"";};
var naam=w("f-naam"),mail=w("f-mail"),bericht=w("f-bericht");
var mis=[];
if(!naam)mis.push("f-naam");
if(!mail||mail.indexOf("@")<1)mis.push("f-mail");
if(!bericht)mis.push("f-bericht");
var oude=document.querySelector(".bs-formfout");
if(oude)oude.parentNode.removeChild(oude);
if(mis.length){
var p=document.createElement("p");
p.className="bs-formfout";
p.style.cssText="color:#a32d2d;font-size:14px;margin:10px 0 0";
p.textContent="Vul uw naam, e-mailadres en vraag in, dan stellen wij het bericht op.";
k.parentNode.insertBefore(p,k.nextSibling);
document.getElementById(mis[0]).focus();
return;
}
var tekst="Naam: "+naam+"\nBedrijf: "+w("f-bedrijf")+"\nE-mail: "+mail+"\nTelefoon: "+w("f-tel")+"\n\nVraag:\n"+bericht+"\n";
var onderwerp=w("f-onderwerp")||"Vraag via de website";
var oudeTekst=k.childNodes[k.childNodes.length-1];
if(oudeTekst&&oudeTekst.nodeType===3){oudeTekst.nodeValue="Bericht wordt opgesteld...";setTimeout(function(){oudeTekst.nodeValue="Verstuur uw bericht";},2500);}
window.location.href="mailto:info@boekhoudsterk.nl?subject="+encodeURIComponent(onderwerp)+"&body="+encodeURIComponent(tekst);
});
})();

/* Mobiel menu opnieuw opgebouwd voor de vernieuwde navigatie */
(function(){
function bouw(){
var rij=document.querySelector('.v4t-head-row');
var nav=document.querySelector('.v4t-nav');
if(!rij||!nav)return;
var oudeKnop=document.querySelector('.bs-menuknop');
if(oudeKnop)oudeKnop.parentNode.removeChild(oudeKnop);
var oudPaneel=document.querySelector('.bs-paneel');
if(oudPaneel)oudPaneel.parentNode.removeChild(oudPaneel);
document.body.classList.remove('bs-vast');

var knop=document.createElement('button');
knop.className='bs-menuknop';
knop.setAttribute('aria-label','Menu openen');
knop.setAttribute('aria-expanded','false');
knop.innerHTML='<span></span><span></span><span></span>';

var paneel=document.createElement('nav');
paneel.className='bs-paneel';
paneel.setAttribute('aria-label','Hoofdmenu');

var pk=document.createElement('div');
pk.className='bs-paneel-kop';
var merk=document.createElement('span');
merk.className='bs-logo bs-logo-om';
merk.style.cssText='font-family:var(--font-heading);font-weight:700;font-size:24px;letter-spacing:-0.02em;color:#7ec2ec;line-height:1';
merk.innerHTML='Boekhoud<span style="color:#ffffff">sterk.</span>';
var sluit=document.createElement('button');
sluit.className='bs-paneel-sluit';
sluit.setAttribute('aria-label','Menu sluiten');
sluit.innerHTML='&times;';
pk.appendChild(merk);pk.appendChild(sluit);
paneel.appendChild(pk);

var gehad={};
function voegToe(href,tekst,soort){
if(!href||gehad[href+soort])return;
gehad[href+soort]=1;
var a=document.createElement('a');
a.href=href;
a.textContent=tekst;
if(soort==='sub')a.className='sub';
paneel.appendChild(a);
}

Array.prototype.forEach.call(nav.children,function(kind){
if(kind.tagName==='A'){voegToe(kind.getAttribute('href'),kind.textContent.trim(),'top');return;}
if(!kind.classList||!kind.classList.contains('drop'))return;
var hoofd=kind.querySelector(':scope > a');
if(hoofd)voegToe(hoofd.getAttribute('href'),hoofd.textContent.trim(),'top');
Array.prototype.forEach.call(kind.querySelectorAll('.mk .ml, .mega-lijst .ml'),function(item){
var t=item.querySelector('b');
voegToe(item.getAttribute('href'),t?t.textContent.trim():item.textContent.trim(),'sub');
});
});

var cta=document.createElement('a');
cta.className='bs-paneel-cta';
cta.href='/contact/';
cta.textContent='Plan een kennismaking';
paneel.appendChild(cta);

rij.appendChild(knop);
document.body.appendChild(paneel);

function zet(open){
paneel.classList.toggle('open',open);
knop.setAttribute('aria-expanded',String(open));
knop.setAttribute('aria-label',open?'Menu sluiten':'Menu openen');
document.body.classList.toggle('bs-vast',open);
if(open)Array.prototype.forEach.call(paneel.querySelectorAll('a'),function(a,i){a.style.transitionDelay=(50+i*28)+'ms';});
}
knop.addEventListener('click',function(){zet(!paneel.classList.contains('open'));});
sluit.addEventListener('click',function(){zet(false);});
paneel.addEventListener('click',function(e){if(e.target.tagName==='A')zet(false);});
document.addEventListener('keydown',function(e){if(e.key==='Escape')zet(false);});
window.addEventListener('resize',function(){if(window.innerWidth>980&&paneel.classList.contains('open'))zet(false);});
console.log('mobiel menu: '+paneel.querySelectorAll('a').length+' links');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bouw);
else bouw();
})();

/* ---------- Voorstelvenster en formulier rechtstreeks versturen (Web3Forms) ---------- */
(function(){
var SLEUTEL='9f5ceca4-e9a2-4cc4-b9e2-5282d1c6c894';
var VOORBEELD=SLEUTEL.indexOf('WEB3FORMS')===0;
var ADRES='https://api.web3forms.com/submit';

function tekst(el){if(!el)return '';var c=el.cloneNode(true);var s=c.querySelectorAll('span');for(var i=0;i<s.length;i++){var t=s[i].textContent.trim();if(t==='+'||t==='-'||t==='–'||t==='−')s[i].parentNode.removeChild(s[i]);}return c.textContent.replace(/\s+/g,' ').trim();}
function actief(sel){return document.querySelector(sel+'[aria-pressed="true"]');}
function waarde(id){var e=document.getElementById(id);return e?e.value.trim():'';}

function berekening(){
 var r=[];
 var f=actief('[data-form]');if(f)r.push(['Rechtsvorm',tekst(f)]);
 var v=actief('[data-vol]');if(v)r.push(['Boekstukken per maand',tekst(v)]);
 var l=document.getElementById('v4t-loonaantal');r.push(['Loonstroken per maand',l?(l.value||'0'):'0']);
 var ex=[];var e=document.querySelectorAll('[data-extra][aria-pressed="true"]');for(var i=0;i<e.length;i++)ex.push(tekst(e[i]));
 r.push(['Aanvullend',ex.length?ex.join(', '):'geen']);
 var b=actief('[data-billing]');if(b)r.push(['Betaling',tekst(b)]);
 var p=document.getElementById('v4t-calc-price'),j=document.getElementById('v4t-calc-year'),a=document.getElementById('v4t-calc-plan');
 if(a)r.push(['Abonnement',a.textContent.trim()]);
 if(p)r.push(['Indicatie per maand',p.textContent.trim()]);
 if(j)r.push(['Indicatie per jaar',j.textContent.trim()]);
 return r;
}
/* Laatste berekening onthouden, zodat die ook met het contactformulier meegaat */
var GEHEUGEN='bs-berekening';
function onthoud(){if(!document.querySelector('.v4t-calc'))return;try{sessionStorage.setItem(GEHEUGEN,JSON.stringify(berekening()));}catch(x){}}
function herinnering(){try{var s=sessionStorage.getItem(GEHEUGEN);return s?JSON.parse(s):null;}catch(x){return null;}}
function alsTekst(som){return som.map(function(r){return r[0]+': '+r[1];}).join('\n');}
document.addEventListener('click',function(ev){if(ev.target&&ev.target.closest&&ev.target.closest('.v4t-calc'))setTimeout(onthoud,30);});
document.addEventListener('input',function(ev){if(ev.target&&ev.target.closest&&ev.target.closest('.v4t-calc'))setTimeout(onthoud,30);});

function verstuur(velden){
 if(VOORBEELD)return new Promise(function(ok){setTimeout(function(){ok({success:true});},700);});
 var d={access_key:SLEUTEL,from_name:'Website Boekhoudsterk',botcheck:''};
 for(var k in velden)d[k]=velden[k];
 return fetch(ADRES,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(d)}).then(function(r){return r.json();});
}

function fout(plek,zin){
 var oud=plek.querySelector('.bs-formfout');if(oud)oud.parentNode.removeChild(oud);
 if(!zin)return;
 var p=document.createElement('p');p.className='bs-formfout';p.setAttribute('role','alert');p.textContent=zin;plek.appendChild(p);
}
function geldig(mail){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);}
var MISLUKT='Het versturen is niet gelukt. Probeer het nog eens, of mail naar info@boekhoudsterk.nl of bel 085 250 1026.';

/* 1. Venster bij de rekenmodule */
var venster=null;
function bouwVenster(){
 var d=document.createElement('dialog');
 d.className='bs-venster';
 d.setAttribute('aria-labelledby','bs-venster-kop');
 d.innerHTML=
  '<button type="button" class="bs-venster-sluit" aria-label="Venster sluiten">&times;</button>'+
  '<div class="bs-venster-inhoud">'+
   '<p class="bs-venster-label">Uw berekening</p>'+
   '<h2 id="bs-venster-kop">Vraag uw voorstel aan</h2>'+
   '<dl class="bs-venster-som"></dl>'+
   '<form class="bs-form-velden" novalidate>'+
    '<label>Uw naam<input type="text" name="naam" autocomplete="name" placeholder="Voor- en achternaam" required></label>'+
    '<label>Bedrijfsnaam<input type="text" name="bedrijf" autocomplete="organization" placeholder="Optioneel"></label>'+
    '<label>E-mailadres<input type="email" name="email" autocomplete="email" placeholder="naam@bedrijf.nl" required></label>'+
    '<label>Telefoonnummer<input type="tel" name="telefoon" autocomplete="tel" placeholder="Zodat wij kunnen terugbellen"></label>'+
    '<label class="breed">Toelichting<textarea name="toelichting" rows="3" placeholder="Optioneel: wat moeten wij nog weten?"></textarea></label>'+
    '<input type="checkbox" name="botcheck" class="bs-verborgen" tabindex="-1" autocomplete="off">'+
    '<div class="breed bs-venster-voet">'+
     '<button type="submit" class="btn btn-primary blueprint"><i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>Verstuur aanvraag</button>'+
     '<p class="bs-venster-klein">Wij reageren met een voorstel op maat. Liever bellen? 085 250 1026.</p>'+
    '</div>'+
   '</form>'+
  '</div>'+
  '<div class="bs-venster-dank" hidden>'+
   '<p class="bs-venster-label">Verstuurd</p>'+
   '<h2>Bedankt, uw aanvraag is binnen</h2>'+
   '<p>Wij nemen zo snel mogelijk contact met u op om uw voorstel door te nemen.</p>'+
   '<button type="button" class="btn btn-primary blueprint bs-venster-klaar"><i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>Sluiten</button>'+
  '</div>';
 document.body.appendChild(d);
 d.querySelector('.bs-venster-sluit').addEventListener('click',function(){d.close();});
 d.querySelector('.bs-venster-klaar').addEventListener('click',function(){d.close();});
 d.addEventListener('click',function(e){if(e.target===d)d.close();});
 var form=d.querySelector('form');
 form.addEventListener('submit',function(e){
  e.preventDefault();
  if(form.botcheck.checked)return;
  var naam=form.naam.value.trim(),mail=form.email.value.trim();
  var voet=d.querySelector('.bs-venster-voet');
  if(!naam||!geldig(mail)){fout(voet,'Vul uw naam en een geldig e-mailadres in.');(naam?form.email:form.naam).focus();return;}
  fout(voet,'');
  var knop=form.querySelector('button[type=submit]');knop.disabled=true;
  var som=d._som||[];
  var regels=alsTekst(som);
  verstuur({
   subject:(d._modus==='bericht'?'Bericht via de website: ':'Voorstelaanvraag via de rekenmodule: ')+naam,
   naam:naam,bedrijf:form.bedrijf.value.trim()||'-',email:mail,telefoon:form.telefoon.value.trim()||'-',
   berekening:regels,toelichting:form.toelichting.value.trim()||'-',pagina:location.pathname
  }).then(function(res){
   knop.disabled=false;
   if(res&&res.success){d.querySelector('.bs-venster-inhoud').hidden=true;var t=d.querySelector('.bs-venster-dank');t.hidden=false;t.querySelector('button').focus();form.reset();}
   else fout(voet,MISLUKT);
  }).catch(function(){knop.disabled=false;fout(voet,MISLUKT);});
 });
 return d;
}
function openVenster(pakket,modus){
 if(!venster)venster=bouwVenster();
 var som=berekening();
 if(pakket)som.unshift(['Gekozen pakket',pakket]);
 venster._som=som;venster._modus=modus||'voorstel';
 var bericht=modus==='bericht';
 venster.querySelector('#bs-venster-kop').textContent=bericht?'Stuur ons een bericht':'Vraag uw voorstel aan';
 venster.querySelector('textarea[name=toelichting]').placeholder=bericht?'Uw vraag of bericht':'Optioneel: wat moeten wij nog weten?';
 var dl=venster.querySelector('.bs-venster-som');dl.innerHTML='';
 som.forEach(function(r){var dt=document.createElement('dt');dt.textContent=r[0];var dd=document.createElement('dd');dd.textContent=r[1];dl.appendChild(dt);dl.appendChild(dd);});
 venster.querySelector('.bs-venster-inhoud').hidden=false;venster.querySelector('.bs-venster-dank').hidden=true;
 fout(venster.querySelector('.bs-venster-voet'),'');
 if(venster.showModal)venster.showModal();else venster.setAttribute('open','');
 setTimeout(function(){venster.querySelector('input[name=naam]').focus();},50);
}
document.addEventListener('click',function(ev){
 var k=ev.target&&ev.target.closest?ev.target.closest('a,button'):null;
 if(!k)return;
 var t=k.textContent.replace(/\s+/g,' ').trim();
 var heeftCalc=!!document.querySelector('.v4t-calc');
 var pakket=(/^Kies (Basic|Professional|Excellent)$/.exec(t)||[])[1];
 var mailknop=k.matches('a.btn[href^="mailto:"]');
 if(heeftCalc&&k.closest('.v4t-calc')&&/voorstel/i.test(t)){ev.preventDefault();ev.stopImmediatePropagation();openVenster();return;}
 if(heeftCalc&&pakket){ev.preventDefault();ev.stopImmediatePropagation();openVenster(pakket);return;}
 if(heeftCalc&&mailknop){ev.preventDefault();ev.stopImmediatePropagation();openVenster(null,'bericht');return;}
 if(mailknop&&document.getElementById('f-naam')){
  ev.preventDefault();ev.stopImmediatePropagation();
  var veld=document.getElementById('f-naam');
  veld.scrollIntoView({behavior:'smooth',block:'center'});
  setTimeout(function(){veld.focus({preventScroll:true});},450);
 }
},true);

/* 2. Contactformulier rechtstreeks versturen */
function contact(){
 var knop=document.getElementById('f-verstuur');if(!knop)return;
 var uitleg=document.querySelector('.bs-form-uitleg');
 if(uitleg)uitleg.textContent='Uw bericht komt direct bij ons binnen. Liever bellen? Dat kan op 085 250 1026.';
 var eerder=herinnering();
 if(eerder&&eerder.length){
  var velden0=document.querySelector('.bs-form-velden');
  var blok=document.createElement('div');blok.className='breed bs-form-meesturen';
  blok.innerHTML='<p class="bs-venster-label">Uw berekening gaat mee</p><dl class="bs-venster-som"></dl>';
  var dl=blok.querySelector('dl');
  eerder.forEach(function(r){var dt=document.createElement('dt');dt.textContent=r[0];var dd=document.createElement('dd');dd.textContent=r[1];dl.appendChild(dt);dl.appendChild(dd);});
  if(velden0)velden0.insertBefore(blok,velden0.firstChild);
 }
 knop.addEventListener('click',function(ev){
  ev.preventDefault();ev.stopImmediatePropagation();
  var naam=waarde('f-naam'),mail=waarde('f-mail'),vraag=waarde('f-bericht');
  var plek=knop.parentNode;
  var mis=!naam?'f-naam':(!geldig(mail)?'f-mail':(!vraag?'f-bericht':''));
  if(mis){fout(plek,'Vul uw naam, een geldig e-mailadres en uw vraag in.');document.getElementById(mis).focus();return;}
  fout(plek,'');knop.disabled=true;
  verstuur({
   subject:'Bericht via de website: '+(waarde('f-onderwerp')||'contact')+' ('+naam+')',
   naam:naam,bedrijf:waarde('f-bedrijf')||'-',email:mail,telefoon:waarde('f-tel')||'-',
   onderwerp:waarde('f-onderwerp')||'-',vraag:vraag,
   berekening:eerder&&eerder.length?alsTekst(eerder):'niet ingevuld'
  }).then(function(res){
   knop.disabled=false;
   if(res&&res.success){
    var velden=document.querySelector('.bs-form-velden');
    var dank=document.createElement('div');dank.className='bs-form-dank';dank.setAttribute('role','status');
    dank.innerHTML='<p class="bs-venster-label">Verstuurd</p><h2>Bedankt, uw bericht is binnen</h2><p>Wij nemen zo snel mogelijk contact met u op.</p>';
    velden.parentNode.replaceChild(dank,velden);
    dank.scrollIntoView({behavior:'smooth',block:'center'});
   }else fout(plek,MISLUKT);
  }).catch(function(){knop.disabled=false;fout(plek,MISLUKT);});
 },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',contact);else contact();
})();
