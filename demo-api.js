// Demo version of the booking server that runs entirely in the browser.
// It answers the same /api/... requests as server.js, but saves bookings in localStorage.
(function () {
  const PHONE = '0680544998';   // WhatsApp number shown on the confirmation screen
  const DEPOSIT = 100;
  const DEMO_PASSWORD = 'demo';
  const SERVICES = [
    { id: 'plain-short',  group: 'Plain set', name: 'Short length',   price: 230, duration: 90 },
    { id: 'plain-medium', group: 'Plain set', name: 'Medium length',  price: 200, duration: 120 },
    { id: 'plain-large',  group: 'Plain set', name: 'Large length',   price: 250, duration: 150 },
    { id: 'overlay-acrylic', group: 'Overlay', name: 'Acrylic overlay', price: 200, duration: 90 },
    { id: 'overlay-gel',     group: 'Overlay', name: 'Gel overlay',     price: 180, duration: 60 },
  ];
  const OPEN = 9 * 60, CLOSE = 17 * 60, STEP = 30, CLOSED_DAYS = [0];
  const KEY = 'nailsbythato-demo-bookings';

  let mem = null;
  const load = () => { try { const v = localStorage.getItem(KEY); if (v !== null) return JSON.parse(v); } catch (e) {} return mem; };
  const save = (rows) => { mem = rows; try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch (e) {} };
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const toTime = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  const isDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d + 'T00:00:00'));
  const ymd = (d) => d.toLocaleDateString('en-CA');
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

  // A few sample bookings so the admin page and the time slots look alive.
  if (load() === null) {
    const next = (n) => { const d = new Date(); let c = 0; while (c < n) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) c++; } return ymd(d); };
    const mk = (id, name, sid, date, time, paid) => { const s = SERVICES.find((x) => x.id === sid);
      return { id, name, phone: '082 000 0001', email: 'sample@example.com', serviceId: s.id, service: s.group + ' - ' + s.name,
        price: s.price, duration: s.duration, deposit: DEPOSIT, depositPaid: paid, date, time, createdAt: new Date().toISOString() }; };
    save([ mk('s1', 'Lerato M.', 'plain-medium', next(1), '10:00', true),
           mk('s2', 'Naledi K.', 'overlay-gel', next(1), '14:00', false),
           mk('s3', 'Zanele P.', 'plain-large', next(2), '09:00', true) ]);
  }

  function freeSlots(date, service) {
    if (CLOSED_DAYS.includes(new Date(date + 'T00:00:00').getDay())) return [];
    const now = new Date(), today = ymd(now), nowMin = now.getHours() * 60 + now.getMinutes();
    if (date < today) return [];
    const taken = load().filter((b) => b.date === date).map((b) => [toMin(b.time), toMin(b.time) + b.duration]);
    const slots = [];
    for (let s = OPEN; s + service.duration <= CLOSE; s += STEP) {
      if (date === today && s <= nowMin) continue;
      if (taken.some(([a, b]) => s < b && s + service.duration > a)) continue;
      slots.push(toTime(s));
    }
    return slots;
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    init = init || {};
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    const i = url.pathname.indexOf('/api/');
    if (i === -1) return realFetch(input, init);
    const route = url.pathname.slice(i + 4);
    const method = (init.method || 'GET').toUpperCase();

    if (route === '/services') return json(SERVICES);
    if (route === '/info') return json({ deposit: DEPOSIT, phone: PHONE, demo: true });
    if (route === '/slots') {
      const service = SERVICES.find((s) => s.id === url.searchParams.get('service'));
      const date = url.searchParams.get('date');
      if (!service || !isDate(date)) return json({ error: 'Pick a service and date.' }, 400);
      return json(freeSlots(date, service));
    }
    if (route === '/bookings' && method === 'POST') {
      const { name, phone, email, serviceId, date, time } = JSON.parse(init.body || '{}');
      const service = SERVICES.find((s) => s.id === serviceId);
      if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) return json({ error: 'Please enter a valid email address.' }, 400);
      if (!name || !name.trim() || !phone || !phone.trim() || !service || !isDate(date) || !time) return json({ error: 'Please fill in all the fields.' }, 400);
      if (!freeSlots(date, service).includes(time)) return json({ error: 'Sorry, that time was just taken. Please pick another.' }, 409);
      const booking = { id: Date.now().toString(36), name: name.trim().slice(0, 60), phone: phone.trim().slice(0, 25), email: email.trim().slice(0, 100),
        serviceId: service.id, service: service.group + ' - ' + service.name, price: service.price, duration: service.duration,
        deposit: DEPOSIT, depositPaid: false, date, time, createdAt: new Date().toISOString() };
      save(load().concat(booking));
      return json(booking, 201);
    }
    if (route.indexOf('/admin/') === 0) {
      const pw = new Headers(init.headers || {}).get('x-admin-password');
      if (pw !== DEMO_PASSWORD) return json({ error: 'Wrong password.' }, 401);
      if (route === '/admin/bookings' && method === 'GET') return json(load().slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)));
      const m = route.match(/^\/admin\/bookings\/([^/]+)(\/deposit)?$/);
      if (m && method === 'PATCH' && m[2]) {
        const rows = load(), b = rows.find((x) => x.id === m[1]);
        if (!b) return json({ error: 'Not found.' }, 404);
        b.depositPaid = !b.depositPaid; save(rows); return json(b);
      }
      if (m && method === 'DELETE') { save(load().filter((b) => b.id !== m[1])); return json({ ok: true }); }
    }
    return json({ error: 'Not found.' }, 404);
  };
})();
