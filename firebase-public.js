import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getFirestore, collection, query, orderBy, onSnapshot, doc } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const noticeList = document.getElementById('noticeList');
const galleryList = document.getElementById('galleryList');
const directorNameSite = document.getElementById('directorNameSite');
const principalNameSite = document.getElementById('principalNameSite');
const esc = x => String(x ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

onSnapshot(query(collection(db,'notices'),orderBy('createdAt','desc')), snap => {
  if (!noticeList) return;
  const rows = snap.docs.map(d=>({id:d.id,...d.data()}));
  noticeList.innerHTML = '<div class="notice-top"><b>Latest Updates</b><span>'+new Date().getFullYear()+'</span></div>' +
    (rows.length ? rows.map(n=>`<div class="notice-row"><strong>${esc(n.icon||'📢')}</strong><div><b>${esc(n.title)}</b><p>${esc(n.text)}</p></div><span>${esc(n.tag||'INFO')}</span></div>`).join('') : '<div class="notice-row"><strong>📢</strong><div><b>College announcements</b><p>New notices will appear here.</p></div><span>INFO</span></div>');
}, err => console.error('Notice load error:',err));

onSnapshot(query(collection(db,'gallery'),orderBy('createdAt','desc')), snap => {
  if (!galleryList) return;
  const uploaded = snap.docs.map(d=>d.data());
  const defaults = [
    ['assets/campus1.jpg','College Campus'],['assets/campus2.jpg','Campus Grounds'],['assets/campus3.jpg','College Building'],
    ['assets/campus1.jpg','Campus View'],['assets/campus2.jpg','College Life']
  ].map(x=>({src:x[0],title:x[1]}));
  const all = [...uploaded,...defaults];
  galleryList.innerHTML = all.map((g,i)=>`<div class="g photo ${['a','b','c','d','e'][i%5]}"><img src="${esc(g.src)}" alt="${esc(g.title||'College photo')}"><b>${esc(g.title||'Campus Photo')}</b></div>`).join('');
}, err => console.error('Gallery load error:',err));

onSnapshot(doc(db,'settings','leadership'), snap => {
  const d=snap.exists()?snap.data():{};
  if(directorNameSite) directorNameSite.textContent=d.director||'Director';
  if(principalNameSite) principalNameSite.textContent=d.principal||'Principal';
}, err=>console.error('Leadership load error:',err));
