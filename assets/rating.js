(function(){
  // Рейтинг: снимок в странице, поверх него живые данные из таблицы «Рейтинг ТГП».
  // #rating-app: полная ведомость с вкладками групп; #rating-top: первые места обеих групп на главной.
  var box=document.getElementById('rating-app'), topBox=document.getElementById('rating-top');
  if(!box&&!topBox) return;
  var D; try{ D=JSON.parse(document.getElementById('rating-data').textContent); }catch(e){ return; }
  var stat=document.getElementById('rating-status');
  var KEY='tgp-rating-tab', cur=D.groups[0].key;
  try{ var s=localStorage.getItem(KEY); if(s&&D.groups.some(function(g){return g.key===s;})) cur=s; }catch(e){}

  function h(tag,cls,txt){ var e=document.createElement(tag); if(cls) e.className=cls; if(txt!=null) e.textContent=txt; return e; }
  function num(v){ return Math.round(v*10)/10; }
  function fmt(v){ return String(num(v)).replace('.',','); }
  function ranked(rows){
    var r=rows.slice().sort(function(a,b){ return b[1]-a[1] || a[0].localeCompare(b[0],'ru'); });
    var out=[], i=0;
    while(i<r.length){
      var j=i; while(j+1<r.length && num(r[j+1][1])===num(r[i][1])) j++;
      var pl=(i===j)?String(i+1):((i+1)+'-'+(j+1));
      for(var k=i;k<=j;k++) out.push({name:r[k][0],sum:r[k][1],pl:pl,top:i<3,first:i===0});
      i=j+1;
    }
    return out;
  }
  function table(rows){
    var wrap=h('div','tbl'), t=h('table','rt'), th=h('thead'), tr=h('tr');
    ['Место','Студент','','Баллы'].forEach(function(x,i){ var c=h('th',i===2?'rbar':null,x); if(i===2) c.setAttribute('aria-hidden','true'); tr.appendChild(c); });
    th.appendChild(tr); t.appendChild(th);
    var tb=h('tbody'), mx=Math.max.apply(null,rows.map(function(r){return r.sum;}).concat([1]));
    rows.forEach(function(r){
      var row=h('tr',r.top?'s top':'s');
      row.appendChild(h('td','pl',r.pl)); row.appendChild(h('td','nm',r.name));
      var bc=h('td','rbar'), bi=h('i'); bi.style.width=(r.sum/mx*100).toFixed(1)+'%'; bc.setAttribute('aria-hidden','true'); bc.appendChild(bi); row.appendChild(bc);
      row.appendChild(h('td','sum',fmt(r.sum)));
      tb.appendChild(row);
    });
    t.appendChild(tb); wrap.appendChild(t); return wrap;
  }
  function render(){
    if(box){
      box.textContent='';
      var tabs=h('div','tabs'); tabs.setAttribute('role','tablist'); tabs.setAttribute('aria-label','Группа');
      D.groups.forEach(function(g){
        var b=h('button','tab',g.title); b.type='button'; b.setAttribute('role','tab');
        b.setAttribute('aria-selected',g.key===cur?'true':'false');
        b.addEventListener('click',function(){ cur=g.key; try{localStorage.setItem(KEY,cur);}catch(e){} render(); });
        tabs.appendChild(b);
      });
      box.appendChild(tabs);
      var g=D.groups.filter(function(x){return x.key===cur;})[0];
      box.appendChild(table(ranked(g.rows)));
    }
    if(topBox){
      topBox.textContent='';
      D.groups.forEach(function(g){
        var col=h('div','tcol'); col.appendChild(h('h3','tgname',g.title));
        var ol=h('ol','podium');
        ranked(g.rows).slice(0,5).forEach(function(r){
          var li=h('li',r.first?'first':null); li.appendChild(h('span','pp',r.pl)); li.appendChild(h('span','pn2',r.name)); li.appendChild(h('span','ps',fmt(r.sum)));
          ol.appendChild(li);
        });
        col.appendChild(ol); topBox.appendChild(col);
      });
    }
  }
  render();

  function parse(txt){
    var j=JSON.parse(txt.slice(txt.indexOf('(')+1, txt.lastIndexOf(')')));
    if(j.status!=='ok') throw 0;
    var rows=(j.table.rows||[]).map(function(r){
      var c=r.c||[], n=c[0]&&c[0].v, v=c[1]&&c[1].v;
      if(typeof v==='string') v=parseFloat(v.replace(',','.'));
      return [typeof n==='string'?n.trim():'', v];
    }).filter(function(r){ return r[0]; });
    if(!rows.length || rows.length>200 || rows.some(function(r){ return r[0].charAt(0)==='#' || r[0].length>80 || typeof r[1]!=='number' || !isFinite(r[1]) || r[1]<0 || r[1]>1000; })) throw 0;
    return rows;
  }
  if(!D.sheet || !/^[A-Za-z0-9_-]{20,80}$/.test(D.sheet) || !window.fetch){ return; }
  Promise.all(D.groups.map(function(g){
    var u='https://docs.google.com/spreadsheets/d/'+D.sheet+'/gviz/tq?tqx=out:json&headers=1&sheet='+encodeURIComponent(g.tab);
    return fetch(u,{credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',redirect:'error'}).then(function(r){ if(!r.ok) throw 0; return r.text(); }).then(parse);
  })).then(function(all){
    all.forEach(function(rows,i){ D.groups[i].rows=rows; });
    render();
    if(stat){
      var d=new Date(), p=function(x){return (x<10?'0':'')+x;};
      stat.textContent='По журналу на '+p(d.getDate())+'.'+p(d.getMonth()+1)+', '+p(d.getHours())+':'+p(d.getMinutes());
      stat.classList.add('live');
    }
  }).catch(function(){});
})();
