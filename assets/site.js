if(window.top!==window.self){try{window.top.location.replace(window.self.location.href);}catch(e){document.documentElement.hidden=true;}}

(function(){
  var hdr=document.getElementById('hdr');
  function sc(){ hdr.classList.toggle('solid', window.scrollY>40); }
  sc(); window.addEventListener('scroll',sc,{passive:true});
  var mb=document.getElementById('menuBtn'), m=document.getElementById('menu'), mc=document.getElementById('menuClose');
  function setM(o){ m.classList.toggle('open',o); mb.setAttribute('aria-expanded',o?'true':'false'); document.body.style.overflow=o?'hidden':''; if(o) mc.focus(); else mb.focus(); }
  mb.addEventListener('click',function(){ setM(true); }); mc.addEventListener('click',function(){ setM(false); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&m.classList.contains('open')) setM(false); });
  var q=document.getElementById('q');
  if(q){
    var cnt=document.getElementById('count'), chipB='', items=[].slice.call(document.querySelectorAll('#main .s'));
    var terms=[].slice.call(document.querySelectorAll('.term'));
    var norm=function(s){return (s||'').toLowerCase().replace(/ё/g,'е');};
    items.forEach(function(el){el._t=norm(el.textContent);});
    var chipOk=function(el){ if(!el.classList.contains('term')||!chipB) return true; return chipB==='list'?el.dataset.src==='list':el.dataset.b===chipB; };
    var apply=function(){
      var v=norm(q.value.trim()), n=0, on=v.length>=2;
      items.forEach(function(el){
        var ok=(!on||el._t.indexOf(v)>-1)&&chipOk(el);
        el.classList.toggle('hide',!ok); if(ok&&on) n++;
        if(el.classList.contains('topic')){ if(on&&ok){el.open=true; el._auto=true;} else if(el._auto){el.open=false; el._auto=false;} }
      });
      [].slice.call(document.querySelectorAll('.tgroup,.group')).forEach(function(g){ g.classList.toggle('hide',on&&!g.querySelector('.s:not(.hide)')); });
      [].slice.call(document.querySelectorAll('.gg')).forEach(function(g){ g.classList.toggle('hide',!g.querySelector('.s:not(.hide)')); });
      [].slice.call(document.querySelectorAll('details.more')).forEach(function(d){ var a=d.querySelector('.s:not(.hide)'); if(on&&a){ if(!d.open){d.open=true; d._auto=true;} } else if(d._auto){ d.open=false; d._auto=false; } });
      var ge=document.getElementById('gloss-empty'); if(ge) ge.classList.toggle('hide',terms.filter(function(t){return !t.classList.contains('hide');}).length>0||!terms.length);
      cnt.textContent=on?('Найдено: '+n):'';
    };
    q.addEventListener('input',apply);
    [].slice.call(document.querySelectorAll('.chip[data-b]')).forEach(function(c){
      c.addEventListener('click',function(){ chipB=c.dataset.b; [].slice.call(document.querySelectorAll('.chip[data-b]')).forEach(function(x){x.setAttribute('aria-pressed',x===c?'true':'false');}); apply(); });
    });
  }
  function openHash(){ var h=location.hash.slice(1); if(!h) return; var el=document.getElementById(h); if(el&&el.tagName==='DETAILS') el.open=true; }
  window.addEventListener('hashchange',openHash); openHash();
})();
