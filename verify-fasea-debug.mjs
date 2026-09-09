import 'dotenv/config';

const BASE = 'http://localhost:3000';
async function j(res) { let b = null; try { b = await res.json(); } catch {} return { status: res.status, body: b }; }

const ts = Date.now();
const email = `fasea.${ts}@example.com`;
const password = 'Password123!';
const username = `fasea${ts % 100000}`;

await j(await fetch(`${BASE}/api/auth/register`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, username }),
}));

const login = await j(await fetch(`${BASE}/api/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ identifier: email, password }),
}));
if (login.status !== 200) { console.log('LOGIN FAIL:', login.status, JSON.stringify(login.body)); process.exit(1); }
const H = { 'Authorization': `Bearer ${login.body.token}`, 'Content-Type': 'application/json' };
console.log('login: OK');

// Deposit tokens to have something to convert (only token/bound allowed now)
const dep = await j(await fetch(`${BASE}/api/fund`, {
  method: 'POST', headers: H,
  body: JSON.stringify({ amount: 100, type: 'token' }),
}));
console.log('fund POST token: ', dep.status, JSON.stringify(dep.body?.newBalances));

// 'main' must be rejected now
const depMain = await j(await fetch(`${BASE}/api/fund`, {
  method: 'POST', headers: H,
  body: JSON.stringify({ amount: 100, type: 'main' }),
}));
console.log('fund POST main (esperado 400):', depMain.status);

// Economy GET must NOT contain main
const eco = await j(await fetch(`${BASE}/api/economy`, { headers: H }));
console.log('economy GET:', eco.status, 'claves:', Object.keys(eco.body?.balances || {}), 'main?', 'main' in (eco.body?.balances || {}));

// Convert 5 tokens → bound
const conv = await j(await fetch(`${BASE}/api/economy/convert`, {
  method: 'POST', headers: H,
  body: JSON.stringify({ amount: 5 }),
}));
console.log('convert 5:', conv.status, conv.body?.message, JSON.stringify(conv.body?.newBalances));

// One-way rule: bound → token must fail
const back = await j(await fetch(`${BASE}/api/economy`, {
  method: 'POST', headers: H,
  body: JSON.stringify({ from: 'bound', to: 'token', amount: 5 }),
}));
console.log('economy bound→token (esperado 400):', back.status, back.body?.message);

// Balances: token 95, bound 5; no 'balance' key
const bal = await j(await fetch(`${BASE}/api/user/balances`, { headers: H }));
console.log('user/balances:', bal.status, 'token:', bal.body?.tokenBalance, 'bound:', bal.body?.boundTokenBalance, 'has "balance"?:', 'balance' in (bal.body || {}));

// Withdrawal stats must read bound
const wd = await j(await fetch(`${BASE}/api/withdrawal/request`, { headers: H }));
console.log('withdrawal stats bound:', bal.body?.boundTokenBalance, '| GET withdrawal:', wd.status, JSON.stringify(wd.body?.stats || wd.body)?.slice(0, 120));

// Daily reward credits tokenBalance
const rw = await j(await fetch(`${BASE}/api/rewards`, { method: 'POST', headers: H }));
console.log('rewards POST:', rw.status, rw.body?.message, 'newTokenBalance:', rw.body?.newTokenBalance);
console.log('EMAIL=' + email);