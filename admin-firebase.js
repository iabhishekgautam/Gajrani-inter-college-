import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc, onSnapshot, query, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-storage.js';
import { firebaseConfig } from './firebase-config.js';

const app=initializeApp(firebaseConfig); const auth=getAuth(app); const db=getFirestore(app); const storage=getStorage(app);
const $=id=>document.getElementById(id); const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let unsubscribeNotices, unsubscribeGallery;

async function isAdmin(user){ const s=await getDoc(doc(db,'admins',user.uid)); return s.exists() && s.data().active!==false; }
async function login(){ const email=$('email').value.trim(), pass=$('pass').value; try{await signInWithEmailAndPassword(auth,email,pass)}catch(e){alert(e.message)} }
window.login=login;
window.logout=()=>signOut(auth);
function showApp(){ $('login').classList.add('hidden'); $('app').classList.remove('hidden'); render(); }
function showLogin(){ $('app').classList.add('hidden'); $('login').classList.remove('hidden'); }
window.showTab=id=>{document.querySelectorAll('.tab').forEach(x=>x.classList.add('hidden'));$(id).classList.remove('hidden');document.querySelectorAll('.side').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));$('pageTitle').textContent=id[0].toUpperCase()+id.slice(1)};
document.querySelectorAll('.side').forEach(b=>b.onclick=()=>window.showTab(b.dataset.tab));

function render(){
  if(unsubscribeNotices)unsubscribeNotices(); if(unsubscribeGallery)unsubscribeGallery();
  unsubscribeNotices=onSnapshot(query(collection(db,'notices'),orderBy('createdAt','desc')),s=>{const rows=s.docs.map(d=>({id:d.id,...d.data()}));$('noticeCount').textContent=rows.length;$('noticeEditor').innerHTML=rows.map(n=>`<div class="notice-admin"><div class="icon">${esc(n.icon||'📢')}</div><div><input value="${esc(n.title)}" onchange="editNotice('${n.id}','title',this.value)"><textarea onchange="editNotice('${n.id}','text',this.value)">${esc(n.text)}</textarea><input value="${esc(n.tag||'INFO')}" onchange="editNotice('${n.id}','tag',this.value)"></div><div class="buttons"><button class="mini" onclick="changeIcon('${n.id}','${esc(n.icon||'📢')}')">Icon</button><button class="mini" onclick="deleteNotice('${n.id}')">Delete</button></div></div>`).join('')||'<div class="profile-note">No notices yet.</div>'});
  unsubscribeGallery=onSnapshot(query(collection(db,'gallery'),orderBy('createdAt','desc')),s=>{const rows=s.docs.map(d=>({id:d.id,...d.data()}));$('galleryCount').textContent=rows.length;$('galleryEditor').innerHTML=rows.map(g=>`<div class="gallery-item"><img src="${esc(g.url)}" alt=""><div><input value="${esc(g.title||'Campus Photo')}" onchange="editGallery('${g.id}',this.value)"><button class="mini" onclick="deleteGallery('${g.id}','${esc(g.path||'')}')">Delete</button></div></div>`).join('')||'<div class="profile-note">No Firebase gallery uploads yet.</div>'});
  loadLeadership();
}
window.addNotice=async()=>{try{await addDoc(collection(db,'notices'),{icon:'📢',title:'New notice',text:'Write your notice here.',tag:'NEW',createdAt:serverTimestamp()});window.showTab('notices')}catch(e){alert(e.message)}};
window.editNotice=async(id,key,value)=>{try{await updateDoc(doc(db,'notices',id),{[key]:value})}catch(e){alert(e.message)}};
window.changeIcon=async(id,current)=>{const v=prompt('Emoji icon',current);if(v)window.editNotice(id,'icon',v)};
window.deleteNotice=async id=>{if(!confirm('Delete this notice?'))return;try{await deleteDoc(doc(db,'notices',id))}catch(e){alert(e.message)}};
window.editGallery=async(id,value)=>{try{await updateDoc(doc(db,'gallery',id),{title:value})}catch(e){alert(e.message)}};
window.deleteGallery=async(id,path)=>{if(!confirm('Delete this image?'))return;try{await deleteDoc(doc(db,'gallery',id));if(path)await deleteObject(ref(storage,path)).catch(()=>{});}catch(e){alert(e.message)}};
$('galleryFiles').addEventListener('change',async e=>{const files=[...e.target.files];for(const file of files){if(file.size>5*1024*1024){alert(file.name+' is larger than 5 MB');continue}try{const path=`gallery/${auth.currentUser.uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const r=ref(storage,path);await uploadBytes(r,file,{contentType:file.type});const url=await getDownloadURL(r);await addDoc(collection(db,'gallery'),{url,path,title:file.name.replace(/\.[^.]+$/,''),createdAt:serverTimestamp()});}catch(err){alert(err.message)}}e.target.value=''});
async function loadLeadership(){const s=await getDoc(doc(db,'settings','leadership'));const d=s.exists()?s.data():{};$('directorName').value=d.director||'Director';$('principalName').value=d.principal||'Principal'}
window.saveLeadership=async()=>{try{await setDoc(doc(db,'settings','leadership'),{director:$('directorName').value||'Director',principal:$('principalName').value||'Principal'},{merge:true});alert('Leadership saved')}catch(e){alert(e.message)}};
window.seedDefaults=async()=>{try{const q=await getDoc(doc(db,'settings','seed'));if(q.exists()){alert('Demo data already initialized.');return}const notices=[['📢','College announcements','Official notices will appear here.','NEW'],['📝','Examination information','Contact the college office for current schedules.','INFO'],['🎓','Admission enquiries','Please contact the college office for admission details.','INFO']];for(const n of notices)await addDoc(collection(db,'notices'),{icon:n[0],title:n[1],text:n[2],tag:n[3],createdAt:serverTimestamp()});await setDoc(doc(db,'settings','leadership'),{director:'Director',principal:'Principal'});await setDoc(doc(db,'settings','seed'),{done:true});alert('Demo data initialized')}catch(e){alert(e.message)}};
window.resetWarning=()=>alert('Firebase data is permanent until deleted from this panel. Use individual Delete buttons.');

onAuthStateChanged(auth,async user=>{if(!user)return showLogin();try{if(await isAdmin(user)){showApp()}else{await signOut(auth);alert('This account is not authorized as an administrator. Add its UID to Firestore collection "admins".')}}catch(e){await signOut(auth);alert(e.message)}});
