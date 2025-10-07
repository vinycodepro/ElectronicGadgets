
    /*************** Sample product data (will be persisted to localStorage) *************/
    const SAMPLE_PRODUCTS = [
      {id:1,name:'Bluetooth Headphones X200',price:4200,desc:'Noise-cancelling, 20h battery',img:''},
      {id:2,name:'FastCharge Powerbank 20000mAh',price:2500,desc:'Dual USB-C output',img:''},
      {id:3,name:'Smartwatch S3',price:7800,desc:'Heart-rate monitor + GPS',img:''},
      {id:4,name:'USB-C Laptop Charger 65W',price:3500,desc:'PD fast charging',img:''},
      {id:5,name:'Wireless Earbuds Pro',price:5200,desc:'Compact, clear sound',img:''},
      {id:6,name:'4K Action Camera',price:12000,desc:'Waterproof to 30m',img:''}
    ];

    // Helpers for storage
    function getProducts(){
      const raw = localStorage.getItem('em_products');
      if(raw) return JSON.parse(raw);
      localStorage.setItem('em_products', JSON.stringify(SAMPLE_PRODUCTS));
      return JSON.parse(localStorage.getItem('em_products'));
    }
    function saveProducts(prods){ localStorage.setItem('em_products', JSON.stringify(prods)); }

    // Cart stored in localStorage
    function getCart(){ return JSON.parse(localStorage.getItem('em_cart')||'[]'); }
    function saveCart(c){ localStorage.setItem('em_cart', JSON.stringify(c)); renderCart(); }

    // Current user
    function getUser(){ return JSON.parse(localStorage.getItem('em_user')||'null'); }
    function saveUser(u){ localStorage.setItem('em_user', JSON.stringify(u)); renderUserArea(); }

    /************* Rendering products *************/
    const productsEl = document.getElementById('products');
    const searchInput = document.getElementById('search');
    const priceFilter = document.getElementById('price-filter');
    const sortBy = document.getElementById('sort-by');

    function renderProducts(list){
      productsEl.innerHTML = '';
      list.forEach(p=>{
        const card = document.createElement('div'); card.className='card';
        card.innerHTML = `
          <div class="product-img">${p.img?`<img src="${p.img}" style="max-width:100%;max-height:100%">`:'<div style="text-align:center">'+(p.name.split(' ')[0])+'</div>'}</div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="max-width:70%"><strong>${p.name}</strong><div class="small">${p.desc||''}</div></div>
            <div class="price">KSh ${numberWithCommas(p.price)}</div>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button class="btn add-to-cart" data-id="${p.id}">Add to cart</button>
            <button class="btn" onclick="viewProduct(${p.id})">View</button>
          </div>
        `;
        productsEl.appendChild(card);
      });
      document.querySelectorAll('.add-to-cart').forEach(btn=>{
        btn.addEventListener('click',()=> addToCart(parseInt(btn.dataset.id)));
      });
    }

    function numberWithCommas(x){ return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

    function applyFilters(){
      let prods = getProducts();
      const q = (searchInput.value||'').toLowerCase();
      if(q){ prods = prods.filter(p=> (p.name+' '+(p.desc||'')).toLowerCase().includes(q)); }
      const pf = priceFilter.value;
      if(pf!=='any'){
        const [min,max]=pf.split('-').map(Number);
        prods = prods.filter(p=>p.price>=min && p.price<=max);
      }
      const s = sortBy.value;
      if(s==='price-asc') prods.sort((a,b)=>a.price-b.price);
      if(s==='price-desc') prods.sort((a,b)=>b.price-a.price);
      renderProducts(prods);
    }

    /************* Cart logic *************/
    function addToCart(id){
      const prods = getProducts(); const p = prods.find(x=>x.id===id); if(!p) return;
      const cart = getCart();
      const existing = cart.find(i=>i.id===id);
      if(existing){ existing.qty += 1; } else { cart.push({id:p.id,name:p.name,price:p.price,qty:1,img:p.img}); }
      saveCart(cart);
      alert('Added to cart: '+p.name);
    }

    function renderCart(){
      const cart = getCart();
      document.getElementById('cart-count').innerText = cart.reduce((s,i)=>s+i.qty,0);
      const body = document.getElementById('cart-body'); body.innerHTML='';
      if(cart.length===0){ body.innerHTML='<div class="muted">Your cart is empty.</div>'; document.getElementById('cart-subtotal').innerText='KSh 0'; return; }
      cart.forEach(item=>{
        const el = document.createElement('div'); el.className='cart-item';
        el.innerHTML = `
          <img src="${item.img||'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=56 height=40><rect width=56 height=40 fill=%23eef2ff/></svg>'}" alt="">
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;align-items:center"><div><strong>${item.name}</strong></div><div>KSh ${numberWithCommas(item.price)}</div></div>
            <div style="display:flex;gap:8px;margin-top:6px;align-items:center">
              <button onclick="changeQty(${item.id}, -1)">-</button>
              <div>${item.qty}</div>
              <button onclick="changeQty(${item.id}, 1)">+</button>
              <button style="margin-left:auto;color:var(--danger);border:0;background:none;cursor:pointer" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
          </div>
        `;
        body.appendChild(el);
      });
      const subtotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
      document.getElementById('cart-subtotal').innerText = 'KSh '+numberWithCommas(subtotal);
    }
    function changeQty(id, delta){ const cart=getCart(); const it=cart.find(i=>i.id===id); if(!it) return; it.qty+=delta; if(it.qty<1) it.qty=1; saveCart(cart); }
    function removeFromCart(id){ let cart=getCart(); cart = cart.filter(i=>i.id!==id); saveCart(cart); }

    /************* Product view (simple) *************/
    function viewProduct(id){ const p = getProducts().find(x=>x.id===id); if(!p) return alert('Product not found'); alert(p.name+'\n\nPrice: KSh '+numberWithCommas(p.price)+'\n\n'+(p.desc||'')); }

    /************* User login/signup (client-side simulation) *************/
    document.getElementById('btn-login').addEventListener('click',()=>{ showModal('modal-login'); });
    document.getElementById('close-login').addEventListener('click',()=>hideModal('modal-login'));
    document.getElementById('do-signup').addEventListener('click',()=>{
      const id = document.getElementById('login-identity').value.trim(); const pass = document.getElementById('login-password').value.trim();
      if(!id||!pass) return alert('Enter identity and password');
      // simple user store
      const users = JSON.parse(localStorage.getItem('em_users')||'[]');
      if(users.find(u=>u.id===id)) return alert('User exists; please login');
      users.push({id,pass,name:id,created:Date.now()}); localStorage.setItem('em_users', JSON.stringify(users));
      saveUser({id,name:id}); hideModal('modal-login'); alert('Signed up and logged in as '+id);
    });
    document.getElementById('do-login').addEventListener('click',()=>{
      const id = document.getElementById('login-identity').value.trim(); const pass = document.getElementById('login-password').value.trim();
      const users = JSON.parse(localStorage.getItem('em_users')||'[]');
      const u = users.find(x=>x.id===id && x.pass===pass);
      if(!u) return alert('Invalid login'); saveUser({id,name:id}); hideModal('modal-login'); alert('Welcome back '+id);
    });

    function renderUserArea(){
      const ua = document.getElementById('user-area'); ua.innerHTML = '';
      const u = getUser();
      const signed = document.getElementById('signed-user'); signed.innerText = u?u.name:'Guest';
      if(u){ const btn = document.createElement('button'); btn.className='btn'; btn.innerText='Logout'; btn.addEventListener('click',()=>{ localStorage.removeItem('em_user'); renderUserArea(); }); ua.appendChild(btn); }
      else { const btn = document.createElement('button'); btn.className='btn'; btn.innerText='Login'; btn.addEventListener('click',()=> showModal('modal-login')); ua.appendChild(btn); }
    }

    /************* Admin dashboard (very simple client-side) *************/
    document.getElementById('btn-admin').addEventListener('click',()=> showModal('modal-admin'));
    document.getElementById('close-admin').addEventListener('click',()=> hideModal('modal-admin'));
    document.getElementById('admin-pass').addEventListener('input',function(){
      const v = this.value; if(v==='admin123'){ document.getElementById('admin-area').style.display='block'; document.getElementById('admin-msg').innerText='Admin access granted'; } else { document.getElementById('admin-area').style.display='none'; document.getElementById('admin-msg').innerText=''; }
    });
    document.getElementById('add-product').addEventListener('click',()=>{
      const name=document.getElementById('admin-name').value.trim(); const price=parseFloat(document.getElementById('admin-price').value||0); const img=document.getElementById('admin-img').value.trim(); const desc=document.getElementById('admin-desc').value.trim();
      if(!name||!price) return alert('Name and price required');
      const prods = getProducts(); const id = (prods.reduce((s,p)=>Math.max(s,p.id),0)||0)+1;
      prods.push({id,name,price,desc,img}); saveProducts(prods); applyFilters(); alert('Product added');
    });

    /************* Checkout & M-Pesa placeholder *************/
    document.getElementById('open-cart').addEventListener('click',()=>{ document.getElementById('cart-drawer').style.display='block'; renderCart(); });
    document.getElementById('close-cart').addEventListener('click',()=>{ document.getElementById('cart-drawer').style.display='none'; });
    document.getElementById('checkout-btn').addEventListener('click',()=>{
      const u = getUser(); if(!u){ if(!confirm('You are not logged in. Continue to checkout as guest?')) return; }
      showModal('modal-checkout');
      // prefill phone if available in user id
      const uid = u && u.id || ''; if(/^07\d{8}$/.test(uid)) document.getElementById('cust-phone').value = uid;
    });

    document.getElementById('close-checkout').addEventListener('click',()=>hideModal('modal-checkout'));
    document.getElementById('checkout-form').addEventListener('submit',function(e){
      e.preventDefault();
      const name = document.getElementById('cust-name').value.trim(); const phone = document.getElementById('cust-phone').value.trim(); const address=document.getElementById('cust-address').value.trim();
      if(!name||!phone||!address) return alert('All fields required');
      const cart = getCart(); if(cart.length===0) return alert('Your cart is empty');
    
    // Trigger real M-Pesa payment via backend
const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
hideModal('modal-checkout');
    
simulateMpesaStkPush(phone, subtotal).then(res => {
  if (res.success) {
    alert("Payment request sent! Check your phone.");
    localStorage.removeItem("em_cart");
    renderCart();
    document.getElementById("cart-drawer").style.display = "none";
  } else {
    alert("Payment failed: " + (res.message || "Unknown error"));
  }
});
    });

    /************* Utilities & modals *************/
    function showModal(id){ document.getElementById(id).classList.add('show'); }
    function hideModal(id){ document.getElementById(id).classList.remove('show'); }

    // Quick interactions
    document.getElementById('search-btn').addEventListener('click',applyFilters);
    document.getElementById('quick-filter').addEventListener('input',function(){ searchInput.value = this.value; applyFilters(); });
    [priceFilter, sortBy, searchInput].forEach(el=>el.addEventListener('change',applyFilters));

    // Init
    (function init(){
      if(!localStorage.getItem('em_products')) saveProducts(SAMPLE_PRODUCTS);
      renderUserArea(); applyFilters(); renderCart();
    })();

    // Expose a couple of functions to the window for inline handlers
    window.viewProduct = viewProduct; window.changeQty = changeQty; window.removeFromCart = removeFromCart; window.addToCart = addToCart;
    async function simulateMpesaStkPush(phone, amount) {
  try {
    const res = await fetch("http://localhost:5000/api/stkpush", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, amount }),
    });
    const data = await res.json();
    console.log("M-Pesa Response:", data);
    return data;
  } catch (err) {
    console.error("Error connecting to backend:", err);
    return { success: false, message: "Failed to connect to M-Pesa server." };
  }
}
