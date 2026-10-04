"use strict";
function san(s){var d=document.createElement('div');d.appendChild(document.createTextNode(String(s).trim()));return d.innerHTML}

/* Scroll reveal */
var ro=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');ro.unobserve(x.target)}})},{threshold:.1});
document.querySelectorAll('.reveal').forEach(function(el){ro.observe(el)});

/* Carousel */
/* El carrusel esta comentado en el HTML: solo se ejecuta si existe */
if(document.getElementById("ctr")){
var cur=0,ctr=document.getElementById('ctr'),tot=ctr.querySelectorAll('.cslide').length,cdo=document.getElementById('cdots'),asi;
(function(){for(var i=0;i<tot;i++){var d=document.createElement('div');d.className='cdot'+(i===0?' on':'');(function(n){d.onclick=function(){ra();go(n)}})(i);cdo.appendChild(d)}})();
function go(n){cur=(n+tot)%tot;ctr.style.transform='translateX(-'+(cur*100)+'%)';cdo.querySelectorAll('.cdot').forEach(function(d,i){d.classList.toggle('on',i===cur)})}
function ra(){clearInterval(asi);asi=setInterval(function(){go(cur+1)},5000)}
function mv(d){ra();go(cur+d)}
document.getElementById('btnP').onclick=function(){mv(-1)};
document.getElementById('btnN').onclick=function(){mv(1)};
ra();
var tx=0;
ctr.parentElement.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
ctr.parentElement.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>50)mv(dx<0?1:-1)});
}

/* Toast */
function toast(m,t){var el=document.getElementById('toast');el.textContent=m;el.className='ton t'+(t==='error'?'err':'ok');setTimeout(function(){el.className=''},4500)}

/* Validators */
function vEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())}
function vPhone(v){return /^[\d\s()\+\-\.]{7,20}$/.test(v.replace(/\s/g,''))}
function vName(v){return v.trim().length>=2}
function em(id,show){var el=document.getElementById(id);if(!el)return;el.style.display=show?'block':'none';el.classList.toggle('on',show)}
function fs(el,ok){el.classList.toggle('fok',ok);el.classList.toggle('ferr',!ok)}
function bv(el,fn,eid){
  el.addEventListener('blur',function(){var ok=fn(el.value);fs(el,ok);em(eid,!ok)});
  el.addEventListener('input',function(){if(el.classList.contains('ferr')&&fn(el.value)){fs(el,true);em(eid,false)}})
}
bv(document.getElementById('qFn'),vName,'qFnE');
bv(document.getElementById('qLn'),vName,'qLnE');
bv(document.getElementById('qPh'),vPhone,'qPhE');
bv(document.getElementById('qEm'),vEmail,'qEmE');
bv(document.getElementById('qSv'),function(v){return v!==''},'qSvE');
bv(document.getElementById('qDs'),function(v){return v.trim().length>=20},'qDsE');

/* Phone format */
document.getElementById('qPh').addEventListener('input',function(){
  var v=this.value.replace(/\D/g,'').substring(0,10);
  if(v.length>=6)v='('+v.substring(0,3)+') '+v.substring(3,6)+'-'+v.substring(6);
  else if(v.length>=3)v='('+v.substring(0,3)+') '+v.substring(3);
  this.value=v
});

/* Quote form */
document.getElementById('qForm').addEventListener('submit',function(e){
  e.preventDefault();
  var F=document.getElementById('qFn'),L=document.getElementById('qLn'),
    P=document.getElementById('qPh'),E=document.getElementById('qEm'),
    S=document.getElementById('qSv'),D=document.getElementById('qDs'),
    V=document.getElementById('qPv'),ok=true;
  [[F,vName,'qFnE'],[L,vName,'qLnE'],[P,vPhone,'qPhE'],[E,vEmail,'qEmE'],
    [S,function(v){return v!==''},'qSvE'],[D,function(v){return v.trim().length>=20},'qDsE']]
    .forEach(function(c){var v=c[1](c[0].value);fs(c[0],v);em(c[2],!v);if(!v)ok=false});
  if(!V.checked){em('qPvE',true);ok=false}else{em('qPvE',false)}
  var capEl=document.querySelector('#qForm textarea[name="h-captcha-response"]'),
    capTok=capEl?capEl.value:'';
  if(!capTok){em('qCpE',true);ok=false}else{em('qCpE',false)}
  if(!ok){toast('Por favor corrige los campos marcados en rojo.','error');var fe=document.querySelector('#qForm .ferr');if(fe)fe.scrollIntoView({behavior:'smooth',block:'center'});return}
  var btn=document.getElementById('qSub');btn.disabled=true;btn.textContent='Enviando...';
  fetch('https://api.web3forms.com/submit',{
    method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({access_key:'3f475c43-5373-4c9e-8852-2e48e2577eed',
      subject:'Nueva Solicitud de Cotizacion - PaintUpColors',
      from_name:'PaintUpColors Web',
      firstName:F.value.trim(),lastName:L.value.trim(),
      phone:P.value.trim(),email:E.value.trim(),
      service:S.value,description:D.value.trim(),
      botcheck:document.querySelector('#qForm [name="botcheck"]').checked,
      'h-captcha-response':capTok})
  }).then(function(r){return r.json()}).then(function(r){
    if(r.success){document.getElementById('qForm').style.display='none';document.getElementById('qSuc').style.display='block';toast('Solicitud enviada con exito!','success')}
    else throw new Error(r.message)
  }).catch(function(){if(window.hcaptcha)hcaptcha.reset();toast('Error al enviar. Intenta de nuevo o llamanos.','error');btn.disabled=false;btn.textContent='Enviar Solicitud de Cotizacion'})
});

(function () {
  const sliders = ['si1', 'si2', 'si3', 'si4'];

  sliders.forEach((id) => {
    const inner = document.getElementById(id);
    if (!inner) return;
    const total = inner.children.length;
    let current = 0;

    setInterval(() => {
      current = (current + 1) % total;
      inner.style.transform = `translateX(-${current * 100}%)`;
    }, 3000); // cambia cada 3 segundos
  });
})();

/* Reviews: se guardan en Cloudflare KV (functions/api/reviews.js) */
function rCard(rv){
  var st='',n=rv.name||'',i,j;
  for(i=0;i<rv.rating;i++)st+='&#9733;';for(j=rv.rating;j<5;j++)st+='&#9734;';
  var ini=n.split(' ').map(function(w){return w[0]||''}).join('').substring(0,2).toUpperCase();
  var card=document.createElement('div');card.className='rcard in';
  card.innerHTML='<div class="stars">'+st+'</div><div class="rq">"</div><p class="rt">'+san(rv.text)+'</p>'+
    '<div class="ra"><div class="rav">'+san(ini)+'</div><div><div class="rn">'+san(n)+'</div>'+
    '<div class="rl">'+san(rv.city||'Cliente verificado')+'</div></div></div>';
  return card
}
function loadReviews(){
  fetch('/api/reviews').then(function(r){return r.json()}).then(function(list){
    var g=document.getElementById('rGrid');
    list.forEach(function(rv){g.appendChild(rCard(rv))})
  }).catch(function(){})
}
loadReviews();

document.getElementById('revForm').addEventListener('submit',function(e){
  e.preventDefault();
  var form=this,
    n=document.getElementById('rNm').value.trim(),
    c=document.getElementById('rCt').value.trim(),
    t=document.getElementById('rTx').value.trim(),
    r=document.querySelector('input[name="rat"]:checked'),ok=true;
  if(!vName(n)){em('rNmE',true);ok=false}else{em('rNmE',false)}
  if(!r){em('rRtE',true);ok=false}else{em('rRtE',false)}
  if(t.length<20){em('rTxE',true);ok=false}else{em('rTxE',false)}
  if(!ok){toast('Completa todos los campos requeridos.','error');return}
  var btn=form.querySelector('button[type="submit"]');if(btn)btn.disabled=true;
  fetch('/api/reviews',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name:n,city:c,text:t,rating:parseInt(r.value)})
  }).then(function(res){return res.json()}).then(function(d){
    if(!d.success)throw new Error(d.message);
    document.getElementById('rGrid').prepend(rCard(d.review));
    form.reset();toast('Gracias por tu comentario!','success')
  }).catch(function(err){
    toast(err&&err.message&&err.message.indexOf('Espera')===0?err.message:'No se pudo guardar tu reseña. Intenta de nuevo.','error')
  }).then(function(){if(btn)btn.disabled=false})
});

/*galeria de proyectos*/

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".project-card");
  const modal = document.getElementById("projectModal");
  const closeModal = document.querySelector(".close-btn");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalGallery = document.getElementById("modalGallery");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const title = card.getAttribute("data-title");
      const description = card.getAttribute("data-description");
      
      // Obtenemos la cadena de rutas y la convertimos en un arreglo separando por comas
      const rawImages = card.getAttribute("data-images");
      const images = rawImages ? rawImages.split(",").map(src => src.trim()) : [];

      modalTitle.textContent = title;
      modalDescription.textContent = description;

      // Limpiamos las imágenes del proyecto anterior
      modalGallery.innerHTML = "";

      // Insertamos las nuevas fotos del proyecto seleccionado
      images.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = title;
        modalGallery.appendChild(img);
      });

      modal.style.display = "flex";
    });
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});