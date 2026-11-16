const app = document.querySelector('#app');
const token = document.querySelector('meta[name="csrf-token"]');
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const money = value => 'Rs. ' + Number(value ?? 0).toLocaleString('en-PK');
const dialog = document.querySelector('#dialog');
const dialogBody = document.querySelector('#dialog-body');
const show = (title, html) => {
  document.querySelector('#dialog-title').textContent = title;
  dialogBody.innerHTML = html;
  bootstrap.Modal.getOrCreateInstance(dialog).show();
};
async function api(path, method = 'GET', data) {
  const response = await fetch('/api/' + path, {
    method, headers: {Accept:'application/json','X-CSRF-TOKEN':token.content,...(data instanceof FormData ? {} : {'Content-Type':'application/json'})},
    body: data instanceof FormData ? data : data === undefined ? undefined : JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw Error(result.message || result.error || 'Request failed.');
  if (result.csrf_token) token.content = result.csrf_token;
  return result;
}
const field = (name, label, type = 'text', required = true, value = '') => '<label class="form-label w-100">'+esc(label)+'<input class="form-control" name="'+esc(name)+'" type="'+type+'" value="'+esc(value)+'" '+(required?'required':'')+'></label>';
const button = (label, style = 'success') => '<button class="btn btn-'+style+'">'+esc(label)+'</button>';
const error = message => '<div class="alert alert-danger" role="alert">'+esc(message)+'</div>';
function bind(form, handler) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const submit = event.submitter;
    const feedback = form.querySelector('[data-feedback]');
    if (submit) submit.disabled = true;
    if (feedback) feedback.innerHTML = '';
    try { await handler(Object.fromEntries(new FormData(form)), form); }
    catch (failure) { if (feedback) feedback.innerHTML = error(failure.message); }
    finally { if (submit) submit.disabled = false; }
  });
}
function table(rows, keys) {
  if (!rows.length) return '<p class="text-secondary my-3">No records to display.</p>';
  return '<div class="table-responsive"><table class="table table-hover align-middle"><thead><tr>'+keys.map(key=>'<th scope="col">'+esc(key.replaceAll('_',' '))+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+keys.map(key=>'<td>'+esc(row[key])+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
}
async function shop() {
  const {products, categories, payments, business} = await api('catalog');
  const bagBody = document.querySelector('#bag-body');
  let bag;
  try { bag = JSON.parse(localStorage.getItem('herbal-bootstrap-bag')) || {}; } catch { bag = {}; }
  let checkoutToken = crypto.randomUUID();
  const base = product => product.variants.find(variant => variant.type === 'Unstitched' && variant.available);
  function renderBag() {
    const items = products.filter(product => bag[product.id] && base(product));
    const count = items.reduce((total, product) => total + bag[product.id], 0);
    document.querySelector('#bag-count').textContent = count;
    localStorage.setItem('herbal-bootstrap-bag', JSON.stringify(bag));
    if (!count) { bagBody.innerHTML = '<p>Your bag is empty.</p>'; return; }
    const subtotal = items.reduce((total, product) => total + base(product).price * bag[product.id], 0);
    const shipping = subtotal > Number(business.free_delivery_threshold) ? 0 : Number(business.standard_delivery_charge);
    const methods = [['cod','Cash on delivery'],['bank','Bank transfer']].filter(([code])=>payments[code+'_enabled']);
    bagBody.innerHTML = items.map(product=>'<div class="d-flex justify-content-between align-items-center gap-2 border-bottom py-2"><span>'+esc(product.name)+' × '+esc(bag[product.id])+'</span><button class="btn btn-sm btn-outline-secondary" data-remove="'+product.id+'">Remove</button></div>').join('')+
      '<p class="mt-3">Subtotal '+money(subtotal)+' · Delivery '+money(shipping)+'</p><p class="fw-semibold">Total '+money(subtotal+shipping)+'</p>'+
      (methods.length ? '<form><div data-feedback></div>'+[['name','Name'],['email','Email','email'],['phone','Phone','tel'],['address','Street address'],['city','City'],['postal_code','Postal code']].map(args=>field(...args)).join('')+'<label class="form-label w-100">Payment method<select class="form-select" name="payment_method">'+methods.map(([code,label])=>'<option value="'+code+'">'+label+'</option>').join('')+'</select></label>'+button('Place order')+'</form>' : '<p>Checkout is temporarily unavailable.</p>');
    bagBody.querySelectorAll('[data-remove]').forEach(control=>control.onclick=()=>{delete bag[control.dataset.remove];renderBag();});
    const form = bagBody.querySelector('form');
    if (form) bind(form, async values => {
      const result = await api('orders','POST',{...values,country:'Pakistan',checkout_token:checkoutToken,items:items.map(product=>({id:product.id,variant_id:base(product).id,quantity:bag[product.id]}))});
      bag = {}; checkoutToken = crypto.randomUUID(); renderBag();
      bagBody.innerHTML = '<div class="alert alert-success">Order placed. Reference <strong>'+esc(result.order?.reference || result.reference)+'</strong></div><a href="/track">Track your order</a>';
    });
  }
  app.innerHTML = '<section id="catalog"><h2>Shop botanical oils</h2><div class="row g-2 mb-4"><label class="col-sm-8">Search oils<input id="query" class="form-control" type="search"></label><label class="col-sm-4">Collection<select id="category" class="form-select"><option value="">All oils</option>'+categories.map(category=>'<option>'+esc(category)+'</option>').join('')+'</select></label></div><div id="products" class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4"></div></section>';
  const query = document.querySelector('#query');
  const category = document.querySelector('#category');
  function detail(product) {
    const variant = base(product);
    show(product.name,'<div class="row g-4"><div class="col-md-6"><img class="img-fluid rounded product-image" src="'+esc(product.image)+'" alt="'+esc(product.name)+'"></div><div class="col-md-6"><p>'+esc(product.description)+'</p><p>'+esc(product.color)+' · '+esc(product.fabric)+'</p><p class="fw-bold">'+money(product.price)+'</p>'+(variant?'<button class="btn btn-success" id="add-bottle">Add to bag</button><div class="mt-2" role="status" id="bag-feedback"></div>':'<span class="badge text-bg-secondary">Sold out</span>')+'</div></div>');
    const add = document.querySelector('#add-bottle');
    if (add) add.onclick = () => {
      const count = Number(bag[product.id]) || 0;
      const limit = Math.min(20,variant.stock ?? 20);
      if (count < limit) { bag[product.id] = count + 1; renderBag(); }
      document.querySelector('#bag-feedback').textContent = count < limit ? 'Added to your bag.' : 'Available quantity is already in your bag.';
    };
  }
  function renderProducts() {
    const items = products.filter(product=>(!category.value || product.category===category.value) && [product.name,product.fabric,product.category].join(' ').toLowerCase().includes(query.value.trim().toLowerCase()));
    document.querySelector('#products').innerHTML = items.map(product=>'<article class="col"><div class="card h-100 shadow-sm"><img class="card-img-top product-image" loading="lazy" src="'+esc(product.image)+'" alt="'+esc(product.name)+'"><div class="card-body"><p class="small text-secondary mb-1">'+esc(product.category)+' · '+esc(product.color)+'</p><h3 class="h5">'+esc(product.name)+'</h3><p class="fw-semibold">'+money(product.price)+(base(product)?'':' <span class="badge text-bg-secondary">Sold out</span>')+'</p><button class="btn btn-outline-success" data-product="'+product.id+'">View details</button></div></div></article>').join('') || '<p>No oils match your search.</p>';
    app.querySelectorAll('button[data-product]').forEach(control=>control.onclick=()=>detail(products.find(product=>String(product.id)===control.dataset.product)));
  }
  query.oninput = category.onchange = renderProducts;
  renderProducts(); renderBag();
  const selected = products.find(product=>String(product.id)===document.body.dataset.product);
  if (selected) detail(selected);
}
function track() {
  app.innerHTML = '<div class="card shadow-sm mx-auto" style="max-width:36rem"><div class="card-body p-4"><h1 class="h3">Track your order</h1><form><div data-feedback></div>'+field('reference','Order reference','text',true,new URLSearchParams(location.search).get('reference'))+field('email','Order email','email')+button('Track order')+'</form><div id="tracking-result" class="mt-3" aria-live="polite"></div></div></div>';
  bind(app.querySelector('form'), async data=>{
    document.querySelector('#tracking-result').innerHTML = '';
    const {order} = await api('track','POST',data);
    document.querySelector('#tracking-result').innerHTML = '<dl class="mb-0">'+['reference','status','payment_status','courier_name','courier_tracking_number'].filter(key=>order[key]).map(key=>'<dt>'+esc(key.replaceAll('_',' '))+'</dt><dd>'+esc(order[key])+'</dd>').join('')+'</dl>';
  });
}
async function admin() {
  const {user} = await api('auth');
  if (!user) {
    app.innerHTML = '<section class="card shadow-sm mx-auto" style="max-width:30rem"><div class="card-body p-4"><h1 class="h3">Staff sign-in</h1><form><div data-feedback></div>'+field('email','Email','email')+field('password','Password','password')+button('Sign in')+'</form></div></section>';
    bind(app.querySelector('form'), async values=>{await api('auth/login','POST',values); await admin();});
    return;
  }
  let data = await api('admin/data');
  const permissions = new Set(data.permissions);
  const can = key => permissions.has(key);
  const sections = [
    ['Overview'],['Products','products.view'],['Orders','orders.view'],
    ['Customers','customers.manage'],['Categories','taxonomy.manage'],
    ['Brands','taxonomy.manage'],['Media','products.view'],['Settings','settings.manage'],['Staff','users.manage'],
  ].filter(([,permission])=>!permission || can(permission));
  app.innerHTML = '<header class="d-flex flex-wrap justify-content-between gap-3 mb-4"><h1 class="h2">Store administration</h1><form><div data-feedback></div>'+button('Sign out','outline-secondary')+'</form></header><div class="row g-4"><aside class="col-lg-3"><nav aria-label="Administration" class="nav nav-pills flex-lg-column gap-1">'+sections.map(([label])=>'<button class="nav-link" data-section="'+label+'">'+label+'</button>').join('')+'</nav></aside><section class="col-lg-9" id="admin-panel"></section></div>';
  bind(app.querySelector('form'),async()=>{await api('auth/logout','POST');await admin();});
  const panel = document.querySelector('#admin-panel');
  const select = (name,label,options,value) => '<label class="form-label w-100">'+esc(label)+'<select name="'+name+'" class="form-select">'+options.map(option=>'<option'+(String(value)===String(option)?' selected':'')+'>'+esc(option)+'</option>').join('')+'</select></label>';
  function editProduct(product={}) {
    const variants=product.raw_variants ?? product.variants ?? [];
    const base=variants.find(item=>item.type==='Unstitched') ?? {};
    show(product.id?'Edit product':'New product','<form><div data-feedback></div>'+field('name','Product name','text',true,product.name)+field('sku','SKU','text',false,product.sku)+select('category','Collection',data.categories.map(row=>row.name),product.category)+select('brand','Brand',data.brands.map(row=>row.name),product.brand)+'<label class="form-label w-100">Description<textarea class="form-control" name="description">'+esc(product.description)+'</textarea></label>'+field('color','Bottle volume','text',false,product.color)+field('fabric','Featured botanical','text',false,product.fabric)+field('image','Primary image path','text',false,product.image)+field('price','Regular price','text',true,base.regular_price??product.price)+field('sale_price','Sale price','text',false,base.sale_enabled?base.sale_price:'')+field('stock','Stock bottles','number',true,base.stock??0)+select('publication_status','Publication',['draft','published','archived'],product.publication_status)+button('Save product')+'</form>');
    bind(dialogBody.querySelector('form'),async values=>{
      const regular=Number(values.price), stock=Number(values.stock), sale=values.sale_price===''?null:Number(values.sale_price);
      if (!Number.isFinite(regular)||regular<0||!Number.isInteger(stock)||stock<0||(sale!==null&&(!Number.isFinite(sale)||sale<=0||sale>=regular))) throw Error('Enter valid prices and a nonnegative whole stock quantity.');
      const images=[values.image,...(product.images??[]).filter(image=>image!==product.image)].filter(Boolean);
      const other=variants.find(item=>item.type==='Stitched')??{type:'Stitched',regular_price:regular,sale_price:null,sale_enabled:false,stock:0,enabled:false};
      await api('admin/products',product.id?'PUT':'POST',{...values,...(product.id?{id:product.id}:{}),sku:values.sku||null,image:values.image||null,images,price:regular,stock,variants:[{type:'Unstitched',regular_price:regular,sale_price:sale,sale_enabled:sale!==null,stock,enabled:base.enabled??true},other]});
      data=await api('admin/data'); bootstrap.Modal.getInstance(dialog).hide(); await render('Products');
    });
  }
  async function render(section) {
    app.querySelectorAll('[data-section]').forEach(control=>control.classList.toggle('active',control.dataset.section===section));
    panel.innerHTML='<h2 class="h4">'+section+'</h2><div class="admin-records"></div>';
    const content=panel.querySelector('.admin-records');
    if(section==='Overview') {
      const stats=data.stats??{};
      content.innerHTML='<div class="row row-cols-2 row-cols-md-4 g-3">'+[['Products',data.products.length],['Orders',stats.total_orders],['Pending',stats.pending_orders],['Revenue',stats.revenue==null?null:money(stats.revenue)]].filter(([,value])=>value!=null).map(([label,value])=>'<div class="col"><div class="card h-100"><div class="card-body"><span>'+label+'</span><div class="h4">'+esc(value)+'</div></div></div></div>').join('')+'</div>';
    } else if(section==='Products') {
      content.innerHTML='<div class="d-flex flex-wrap gap-2 mb-3"><input class="form-control w-auto" aria-label="Search products" placeholder="Name, SKU, collection or status">'+(can('products.create')?'<button class="btn btn-success">Add product</button>':'')+'</div><div data-list></div>';
      const search=content.querySelector('input'), list=content.querySelector('[data-list]');
      function filter(){
        const products=data.products.filter(product=>[product.name,product.sku,product.category,product.publication_status].join(' ').toLowerCase().includes(search.value.trim().toLowerCase()));
        list.innerHTML=table(products,['name','sku','category','price','stock','publication_status']);
        if(can('products.edit')) list.querySelectorAll('tbody tr').forEach((row,index)=>{
          const control=document.createElement('button'); control.className='btn btn-sm btn-outline-success'; control.textContent='Edit'; control.onclick=()=>editProduct(products[index]); row.cells[0].append(' ',control);
        });
      }
      search.oninput=filter; filter();
      const add=content.querySelector('div > button'); if(add) add.onclick=()=>editProduct();
    } else if(section==='Orders') {
      content.innerHTML=table(data.orders,['reference','name','status','total','created_at']);
      content.querySelectorAll('tbody tr').forEach((row,index)=>{
        const order=data.orders[index];
        const control=document.createElement('button'); control.className='btn btn-link'; control.textContent=order.reference; row.cells[0].replaceChildren(control);
        control.onclick=async()=>{
          try {
            const {items}=await api('admin/order-items?id='+order.id);
            const stages=['Pending','Confirmed','Processing','Packed','Shipped','Out for Delivery','Delivered'];
            const next=stages[stages.indexOf(order.status)+1];
            const options=stages.includes(order.status)?[order.status,next,...(stages.indexOf(order.status)<4?['Cancelled']:[]),...(order.status==='Delivered'?['Returned']:[])].filter(Boolean):[];
            const controls=can('orders.update')&&options.length>1
              ? '<form><div data-feedback></div>'+select('status','Status',options,order.status)+select('delivery_method','Delivery method',['courier','direct','collection'],order.delivery_method)+field('courier_name','Courier','text',false,order.courier_name)+field('courier_tracking_number','Tracking number','text',false,order.courier_tracking_number)+button('Update order')+'</form>'
              : '';
            show(order.reference,table(items,['name','quantity','price'])+controls);
            const form=dialogBody.querySelector('form');
            if(form) bind(form,async values=>{
              await api('admin/orders','PUT',{id:order.id,...values});
              data=await api('admin/data');
              bootstrap.Modal.getInstance(dialog).hide();
              await render('Orders');
            });
          } catch(failure) { show(order.reference,error(failure.message)); }
        };
      });
    } else if(section==='Customers') content.innerHTML=table(data.customers,['name','email','phone','order_count']);
    else if(section==='Categories'||section==='Brands'){
      const kind=section.toLowerCase();
      content.innerHTML='<form class="mb-3"><div data-feedback></div>'+field('name',section==='Categories'?'Category name':'Brand name')+button('Add')+'</form>'+table(data[kind],['name']);
      bind(content.querySelector('form'),async values=>{await api('admin/'+kind,'POST',values);data=await api('admin/data');await render(section);});
    } else if(section==='Media') content.innerHTML=table((await api('admin/media')).assets??[],['kind','path','bytes']);
    else if(section==='Staff') content.innerHTML=table((await api('admin/users')).users??[],['name','email','role','last_login_at']);
    else if(section==='Settings'){
      const keys=[['brand_name','Brand name'],['tagline','Tagline'],['standard_delivery_charge','Delivery charge','number'],['free_delivery_threshold','Free delivery threshold','number'],['return_address','Return address']];
      content.innerHTML='<form><div data-feedback></div>'+keys.map(([key,label,type])=>field(key,label,type,false,data.business[key])).join('')+button('Save')+'</form>';
      bind(content.querySelector('form'),async values=>{await api('admin/business-settings','PUT',values);data=await api('admin/data');await render(section);});
    }
  }
  app.querySelectorAll('[data-section]').forEach(control=>control.onclick=()=>render(control.dataset.section).catch(failure=>{panel.innerHTML=error(failure.message);}));
  await render('Overview');
}
try {
  if (document.body.dataset.page==='admin') await admin();
  else if (document.body.dataset.page==='track') track();
  else await shop();
} catch (failure) {
  app.innerHTML = error(failure.message);
} finally {
  app.setAttribute('aria-busy','false');
}
