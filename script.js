const colors=['#d8ded4','#e4d9ca','#d9c9c1','#e7dcb9','#cbc6d8','#e7c6b8'];
const samples=[
 {id:'1',name:'水凝亮肌精華',brand:'Lumière',category:'精華',benefits:['保濕','提亮'],location:'浴室鏡櫃',expiryDate:'2026-10-18',opened:true,notes:'晚間使用，避開眼周。',color:'#d8ded4'},
 {id:'2',name:'積雪草修護面霜',brand:'Pure Lab',category:'面霜',benefits:['修護','舒緩'],location:'睡房梳妝枱',expiryDate:'2027-03-22',opened:true,notes:'皮膚敏感時使用。',color:'#e4d9ca'},
 {id:'3',name:'柔霧氣墊粉底',brand:'Nue',category:'底妝',benefits:['遮瑕','持妝'],location:'化妝袋',expiryDate:'2027-08-14',opened:false,notes:'',color:'#d9c9c1'},
 {id:'4',name:'低敏防曬乳 SPF50',brand:'Solskin',category:'防曬',benefits:['防曬','舒緩'],location:'玄關抽屜',expiryDate:'2026-09-20',opened:true,notes:'外出前 15 分鐘使用。',color:'#e7dcb9'},
 {id:'5',name:'夜間視黃醇精華',brand:'Clarity',category:'精華',benefits:['抗老'],location:'睡房抽屜',expiryDate:'2027-01-12',opened:true,notes:'每週使用兩次。',color:'#cbc6d8'},
 {id:'6',name:'杏桃柔光胭脂',brand:'Nue',category:'彩妝',benefits:['提氣色'],location:'化妝袋',expiryDate:'2028-02-25',opened:false,notes:'',color:'#e7c6b8'}
];
let products=JSON.parse(localStorage.getItem('beauty-shelf-products-static')||'null')||samples;
let activeBenefit='全部',editingId=null,currentPhoto='';
const $=s=>document.querySelector(s); const grid=$('#product-grid'),form=$('#product-form'),modal=$('#modal');
const daysUntil=date=>{const now=new Date();now.setHours(0,0,0,0);return Math.ceil((new Date(date+'T00:00:00')-now)/86400000)};
const meta=date=>{const d=daysUntil(date);if(d<0)return[`已過期 ${Math.abs(d)} 日`,'expired'];if(d<=30)return[`剩餘 ${d} 日`,'urgent'];if(d<=90)return[`剩餘 ${d} 日`,'soon'];return[`尚有 ${d} 日`,'safe']};
function save(){localStorage.setItem('beauty-shelf-products-static',JSON.stringify(products))}
function renderBenefits(){
 const benefits=['全部',...new Set(products.flatMap(p=>p.benefits||[]).filter(Boolean))];
 if(!benefits.includes(activeBenefit))activeBenefit='全部';
 $('#benefit-filters').innerHTML=benefits.map(b=>`<button class="${b===activeBenefit?'selected':''}" data-benefit="${escapeHtml(b)}">${escapeHtml(b)}</button>`).join('');
}
function render(){
 const q=$('#search').value.trim().toLowerCase(),brand=$('#brand-filter').value||'全部品牌',date=$('#date-filter').value;
 const list=products.filter(p=>{const d=daysUntil(p.expiryDate);return(!q||[p.name,p.brand,p.category,p.location||'',p.notes,...(p.benefits||[])].join(' ').toLowerCase().includes(q))&&(brand==='全部品牌'||p.brand===brand)&&(activeBenefit==='全部'||(p.benefits||[]).includes(activeBenefit))&&(date==='全部日期'||date==='30日內'&&d>=0&&d<=30||date==='90日內'&&d>=0&&d<=90||date==='已過期'&&d<0)});
 grid.innerHTML=list.map(p=>{const [label,tone]=meta(p.expiryDate);const visual=p.photo?`<img src="${p.photo}" alt="${escapeHtml(p.name)}的產品照片">`:`<div class="bottle"><span>${escapeHtml(p.brand.slice(0,7).toUpperCase())}</span></div>`;return `<article class="product-card"><div class="product-visual" style="background:${p.color}">${visual}<span class="category">${escapeHtml(p.category)}</span><div class="card-actions"><button data-edit="${p.id}" aria-label="編輯">✎</button><button data-delete="${p.id}" aria-label="刪除">⌫</button></div></div><div class="product-info"><p class="product-brand">${escapeHtml(p.brand)}</p><h3>${escapeHtml(p.name)}</h3><div class="tags">${(p.benefits||[]).map(b=>`<span>${escapeHtml(b)}</span>`).join('')}</div>${p.location?`<div class="location">⌖ ${escapeHtml(p.location)}</div>`:''}<div class="expiry ${tone}"><span>▣ 有效日期 ${p.expiryDate.replaceAll('-','.')}</span><strong>${label}</strong></div><div class="opened">${p.opened?'✓ 已開封':'未開封'}</div></div></article>`}).join('');
 $('#result-count').textContent=list.length; $('#empty').hidden=!!list.length; grid.hidden=!list.length;
 const soon=products.filter(p=>{const d=daysUntil(p.expiryDate);return d>=0&&d<=30}).length; $('#total-count').textContent=products.length;$('#opened-count').textContent=products.filter(p=>p.opened).length;$('#expiry-count').textContent=soon;$('#bell-count').textContent=soon;$('#expiry-stat').classList.toggle('warn',soon>0);
 const filtered=q||brand!=='全部品牌'||date!=='全部日期'||activeBenefit!=='全部';$('#clear-filters').hidden=!filtered;
}
function brands(){const current=$('#brand-filter').value;const list=['全部品牌',...new Set(products.map(p=>p.brand).sort())];$('#brand-filter').innerHTML=list.map(b=>`<option>${escapeHtml(b)}</option>`).join('');if(list.includes(current))$('#brand-filter').value=current}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function updatePhotoPreview(){const box=$('#photo-preview');box.innerHTML=currentPhoto?`<img src="${currentPhoto}" alt="照片預覽">`:'<span>＋</span><small>尚未加入照片</small>';$('#remove-photo').hidden=!currentPhoto}
function openModal(product){editingId=product?.id||null;currentPhoto=product?.photo||'';$('#modal-title').textContent=editingId?'編輯產品':'加入新產品';form.reset();if(product){['name','brand','category','location','expiryDate','notes'].forEach(k=>form[k].value=product[k]||'');form.benefits.value=(product.benefits||[]).join('、');form.opened.checked=product.opened}updatePhotoPreview();modal.hidden=false;form.name.focus()}
function closeModal(){modal.hidden=true}
renderBenefits();brands();render();
$('#benefit-filters').onclick=e=>{const b=e.target.closest('[data-benefit]');if(b){activeBenefit=b.dataset.benefit;renderBenefits();render()}};
['search','brand-filter','date-filter'].forEach(id=>$('#'+id).addEventListener(id==='search'?'input':'change',render));
$('#clear-filters').onclick=()=>{$('#search').value='';$('#brand-filter').value='全部品牌';$('#date-filter').value='全部日期';activeBenefit='全部';renderBenefits();render()};
$('#add-product').onclick=()=>openModal();$('#empty-add').onclick=()=>openModal();$('#close-modal').onclick=closeModal;$('#cancel-modal').onclick=closeModal;modal.onclick=e=>{if(e.target===modal)closeModal()};
form.onsubmit=e=>{e.preventDefault();const data=new FormData(form),old=products.find(p=>p.id===editingId);const customBenefits=String(data.get('benefits')||'').split(/[、,，]/).map(v=>v.trim()).filter((v,i,a)=>v&&a.indexOf(v)===i);const item={id:editingId||crypto.randomUUID(),name:data.get('name').trim(),brand:data.get('brand').trim(),category:data.get('category'),benefits:customBenefits,location:data.get('location').trim(),expiryDate:data.get('expiryDate'),opened:data.get('opened')==='on',notes:data.get('notes').trim(),photo:currentPhoto,color:old?.color||colors[Math.floor(Math.random()*colors.length)]};products=editingId?products.map(p=>p.id===editingId?item:p):[item,...products];try{save()}catch{alert('瀏覽器儲存空間不足，請使用較少或較小的照片。');return}brands();renderBenefits();render();closeModal()};
$('#photo-input').onchange=e=>{const file=e.target.files[0];if(!file)return;if(!file.type.startsWith('image/')){alert('請選擇照片檔案。');return}const reader=new FileReader();reader.onload=()=>{const image=new Image();image.onload=()=>{const max=900,scale=Math.min(1,max/Math.max(image.width,image.height)),canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);currentPhoto=canvas.toDataURL('image/jpeg',.76);updatePhotoPreview()};image.src=reader.result};reader.readAsDataURL(file);e.target.value=''};
$('#remove-photo').onclick=()=>{currentPhoto='';updatePhotoPreview()};
grid.onclick=e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit)openModal(products.find(p=>p.id===edit.dataset.edit));if(del&&confirm('確定要刪除這件產品嗎？')){products=products.filter(p=>p.id!==del.dataset.delete);save();brands();render()}};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
