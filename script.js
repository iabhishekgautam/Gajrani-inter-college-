document.getElementById('year').textContent=new Date().getFullYear();document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('nav').classList.remove('show')));

const defaultData={
 notices:[
  {icon:'📢',title:'College announcements',text:'Official notices will appear in this section.',tag:'NEW'},
  {icon:'📝',title:'Examination information',text:'Contact the college office for current schedules.',tag:'INFO'},
  {icon:'🎓',title:'Admission enquiries',text:'Please contact the college office for admission details.',tag:'INFO'}
 ],
 gallery:[],
 leadership:{director:'Director',principal:'Principal'}
};
function gicData(){try{return JSON.parse(localStorage.getItem('gic_admin_data'))||defaultData}catch(e){return defaultData}}
function renderNotices(){const box=document.getElementById('noticeList');if(!box)return;const d=gicData();box.innerHTML='<div class="notice-top"><b>Latest Updates</b><span>2026</span></div>' + d.notices.map(n=>`<div class="notice-row"><strong>${n.icon}</strong><div><b>${esc(n.title)}</b><p>${esc(n.text)}</p></div><span>${esc(n.tag)}</span></div>`).join('')}
function esc(x){return String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
renderNotices();

function renderSiteAdmin(){try{const d=gicData();const dn=document.getElementById('directorNameSite'),pn=document.getElementById('principalNameSite');if(dn)dn.textContent=d.leadership?.director||'Director';if(pn)pn.textContent=d.leadership?.principal||'Principal';const gl=document.getElementById('galleryList');if(gl&&d.gallery?.length){const defaults=[['campus1.jpg','College Campus'],['campus2.jpg','Campus Grounds'],['campus3.jpg','College Building'],['campus1.jpg','Campus View'],['campus2.jpg','College Life']];const all=[...defaults.map(x=>({src:'assets/'+x[0],title:x[1]})),...d.gallery];gl.innerHTML=all.map((g,i)=>`<div class="g photo ${['a','b','c','d','e'][i%5]}"><img src="${g.src}" alt="${esc(g.title)}"><b>${esc(g.title)}</b></div>`).join('')}}catch(e){}}
renderSiteAdmin();
