(function(){
  // ====== CONFIGURE AQUI ======
  const SUPABASE_URL = 'https://wefunpobgkgjkblvmtml.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_PCaTc71bwavfiRnhEUEOeQ_97O4YxBy';     
  // =============================

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const $ = (id) => document.getElementById(id);
  const fmtMoney = (n) => n.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  function fmtDate(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }

  let entries = [];
  let currentType = 'receita';
  let today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDate = fmtDate(today);
  let authMode = 'login';

  // ---------- AUTENTICAÇÃO ----------
  $('tabLogin').addEventListener('click', ()=>{ authMode='login'; $('tabLogin').classList.add('active'); $('tabSignup').classList.remove('active'); $('authSubmitBtn').textContent='Entrar'; $('authNote').textContent=''; showAuthError(''); });
  $('tabSignup').addEventListener('click', ()=>{ authMode='signup'; $('tabSignup').classList.add('active'); $('tabLogin').classList.remove('active'); $('authSubmitBtn').textContent='Criar conta'; $('authNote').textContent=''; showAuthError(''); });

  function showAuthError(msg){
    const el = $('authError');
    if(!msg){ el.style.display='none'; el.textContent=''; return; }
    el.style.display='block'; el.textContent = msg;
  }

  $('authForm').addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    showAuthError('');
    const email = $('authEmail').value.trim();
    const password = $('authPass').value;

    if(!email){ showAuthError('Preencha o e-mail.'); return; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ showAuthError('Digite um e-mail válido.'); return; }
    if(!password){ showAuthError('Preencha a senha.'); return; }
    if(password.length < 6){ showAuthError('A senha precisa ter pelo menos 6 caracteres.'); return; }

    $('authSubmitBtn').disabled = true;

    if(authMode === 'signup'){
      const {error} = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: 'https://gabrielparra23.github.io/Livro-Caixa/' }
      });
      if(error){ showAuthError(error.message); }
      else{ $('authNote').textContent = 'Conta criada. Verifique seu e-mail para confirmar, depois faça login.'; $('tabLogin').click(); }
    } else {
      const {error} = await supabase.auth.signInWithPassword({ email, password });
      if(error){ showAuthError(error.message); }
    }
    $('authSubmitBtn').disabled = false;
  });

  $('logoutBtn').addEventListener('click', async ()=>{
    await supabase.auth.signOut();
  });

  supabase.auth.onAuthStateChange((event, session)=>{
    if(session && session.user){
      $('authScreen').classList.add('hidden');
      $('appWrap').classList.remove('hidden');
      $('userEmail').textContent = session.user.email;
      initApp();
    } else {
      $('appWrap').classList.add('hidden');
      $('authScreen').classList.remove('hidden');
    }
  });

  // ---------- DADOS ----------
  async function loadEntries(){
    $('storageStatus').textContent = 'carregando…';
    const {data, error} = await supabase.from('lancamentos').select('*').order('entry_date');
    if(error){ $('storageStatus').textContent = 'erro ao carregar: ' + error.message; entries = []; return; }
    entries = data.map(r => ({ id:r.id, date:r.entry_date, desc:r.description, type:r.kind, value:Number(r.amount) }));
    $('storageStatus').textContent = 'sincronizado';
  }

  async function addEntry(entry){
    const {data:{user}} = await supabase.auth.getUser();
    const {error} = await supabase.from('lancamentos').insert({
      user_id: user.id, entry_date: entry.date, description: entry.desc, kind: entry.type, amount: entry.value
    });
    if(error){ showFormError('Erro ao salvar: ' + error.message); return false; }
    return true;
  }

  async function deleteEntry(id){
    const {error} = await supabase.from('lancamentos').delete().eq('id', id);
    if(error){ $('storageStatus').textContent = 'erro ao excluir: ' + error.message; }
  }

  // ---------- RENDER ----------
  function render(){ renderCalendar(); renderSummaries(); renderDayList(); $('data').value = selectedDate; }

  function renderCalendar(){
    $('monthLabel').textContent = MESES[viewMonth] + ' ' + viewYear;
    const grid = $('calGrid'); grid.innerHTML = '';
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();

    for(let i=0;i<startOffset;i++){ const c=document.createElement('div'); c.className='cell empty'; grid.appendChild(c); }

    for(let day=1; day<=daysInMonth; day++){
      const dateStr = viewYear+'-'+String(viewMonth+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
      const dayEntries = entries.filter(e => e.date === dateStr);
      const cell = document.createElement('div'); cell.className = 'cell';
      if(fmtDate(today) === dateStr) cell.classList.add('today');
      if(selectedDate === dateStr) cell.classList.add('selected');

      const num = document.createElement('div'); num.className='num'; num.textContent=day; cell.appendChild(num);

      const entriesWrap = document.createElement('div'); entriesWrap.className='entries';
      dayEntries.slice(0,3).forEach(e=>{
        const m = document.createElement('div'); m.className='mini '+(e.type==='receita'?'credit':'debit');
        const descSpan=document.createElement('span'); descSpan.className='desc'; descSpan.textContent=e.desc;
        const valSpan=document.createElement('span'); valSpan.textContent=(e.type==='despesa'?'-':'')+Number(e.value).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:0});
        m.appendChild(descSpan); m.appendChild(valSpan); entriesWrap.appendChild(m);
      });
      if(dayEntries.length>3){ const more=document.createElement('div'); more.className='more'; more.textContent='+'+(dayEntries.length-3)+' mais'; entriesWrap.appendChild(more); }
      cell.appendChild(entriesWrap);
      cell.addEventListener('click', ()=>{ selectedDate = dateStr; render(); });
      grid.appendChild(cell);
    }
  }

  function sumEntries(list){
    let credit=0, debit=0;
    list.forEach(e=>{ if(e.type==='receita') credit+=Number(e.value); else debit+=Number(e.value); });
    return {credit, debit, balance: credit-debit};
  }

  function renderSummaries(){
    const monthEntries = entries.filter(e=>{ const d=new Date(e.date+'T00:00:00'); return d.getFullYear()===viewYear && d.getMonth()===viewMonth; });
    const yearEntries = entries.filter(e=>{ const d=new Date(e.date+'T00:00:00'); return d.getFullYear()===viewYear; });
    const m = sumEntries(monthEntries), y = sumEntries(yearEntries);
    $('monthStampTitle').textContent = MESES[viewMonth]+' '+viewYear;
    $('yearStampTitle').textContent = 'Ano de '+viewYear;
    $('monthCredit').textContent = fmtMoney(m.credit); $('monthDebit').textContent = fmtMoney(m.debit);
    $('monthBalance').textContent = fmtMoney(m.balance); $('monthBalance').style.color = m.balance<0?'var(--debit)':'var(--ink)';
    $('yearCredit').textContent = fmtMoney(y.credit); $('yearDebit').textContent = fmtMoney(y.debit);
    $('yearBalance').textContent = fmtMoney(y.balance); $('yearBalance').style.color = y.balance<0?'var(--debit)':'var(--ink)';
  }

  function renderDayList(){
    const list = entries.filter(e=>e.date===selectedDate).sort((a,b)=>a.desc.localeCompare(b.desc));
    const d = new Date(selectedDate+'T00:00:00');
    $('dayListTitle').textContent = 'Lançamentos — '+String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();
    const wrap = $('dayList'); wrap.innerHTML = '';
    if(list.length===0){ const p=document.createElement('p'); p.className='empty-note'; p.textContent='Nenhum lançamento neste dia ainda.'; wrap.appendChild(p); return; }
    list.forEach(e=>{
      const row=document.createElement('div'); row.className='day-entry';
      const info=document.createElement('div'); info.className='info';
      const desc=document.createElement('div'); desc.className='desc'; desc.textContent=e.desc; info.appendChild(desc);
      const val=document.createElement('div'); val.className='val '+(e.type==='receita'?'credit':'debit'); val.textContent=(e.type==='despesa'?'- ':'+ ')+fmtMoney(Number(e.value));
      const del=document.createElement('button'); del.className='del'; del.setAttribute('aria-label','Excluir lançamento'); del.textContent='✕';
      del.addEventListener('click', async ()=>{ await deleteEntry(e.id); await loadEntries(); render(); });
      row.appendChild(info); row.appendChild(val); row.appendChild(del); wrap.appendChild(row);
    });
  }

  function showFormError(msg){
    const el = $('formError');
    if(!msg){ el.style.display='none'; el.textContent=''; return; }
    el.style.display='block'; el.textContent = msg;
  }

  // ---------- EVENTOS DO APP ----------
  $('prevMonth').addEventListener('click', ()=>{ viewMonth--; if(viewMonth<0){viewMonth=11; viewYear--;} render(); });
  $('nextMonth').addEventListener('click', ()=>{ viewMonth++; if(viewMonth>11){viewMonth=0; viewYear++;} render(); });

  document.querySelectorAll('.toggle-type button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      currentType = btn.dataset.type;
      document.querySelectorAll('.toggle-type button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  $('entryForm').addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    showFormError('');
    const desc = $('desc').value.trim();
    const valorRaw = $('valor').value.trim().replace(/\./g,'').replace(',', '.');
    const valor = parseFloat(valorRaw);
    const data = $('data').value;

    if(!desc){ showFormError('Preencha a descrição.'); return; }
    if(isNaN(valor) || valor <= 0){ showFormError('Informe um valor válido, ex.: 150,00'); return; }
    if(!data){ showFormError('Selecione o dia.'); return; }

    $('submitBtn').disabled = true;
    const ok = await addEntry({ date: data, desc, type: currentType, value: valor });
    $('submitBtn').disabled = false;
    if(!ok) return;

    const d = new Date(data+'T00:00:00');
    viewYear = d.getFullYear(); viewMonth = d.getMonth(); selectedDate = data;
    $('desc').value = ''; $('valor').value = '';

    await loadEntries();
    render();
  });

  async function initApp(){
    await loadEntries();
    render();
  }
})();