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
