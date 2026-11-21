// Negotiation Engine — counterparty with hidden reservation value, issue trade-offs, trust dynamics, BATNA.
// role 'buy'  : player is buyer (wants LOW price); counterparty seller accepts if offer + Σissue value ≥ reservation.
// role 'sell' : player is seller (wants HIGH price); counterparty buyer accepts if offer − Σissue value ≤ reservation.
export function initNegotiation(cfg) {
  return { ask: cfg.ask, trust: 60, round: 0, ended: false, history: [] };
}
const roundTo = (x, step) => Math.round(x / step) * step;

export function negotiateRound(cfg, st, offer, issueIds = []) {
  const s = { ...st, history: [...st.history] };
  const sell = cfg.role === 'sell';
  const iv = (cfg.issues || []).filter((i) => issueIds.includes(i.id)).reduce((a, i) => a + i.v, 0);
  const effective = sell ? offer - iv : offer + iv;
  const accepted = sell ? effective <= cfg.reservation : effective >= cfg.reservation;
  if (accepted) {
    s.ended = true; s.history.push({ offer, issues: issueIds, reply: 'accept' });
    return { accepted: true, price: offer, state: s };
  }
  const insult = sell ? offer > cfg.reservation * cfg.insult : offer < cfg.reservation * cfg.insult;
  s.trust -= insult ? 30 : 8;
  const resAdj = sell ? cfg.reservation + iv : cfg.reservation - iv;
  const target = sell ? Math.min(resAdj, cfg.reservation) : Math.max(resAdj, cfg.reservation);
  let next = s.ask + (target - s.ask) * cfg.concession;
  next = roundTo(next, cfg.step);
  s.ask = sell ? Math.min(next, cfg.reservation) : Math.max(next, cfg.reservation);
  s.round += 1;
  const reply = insult ? 'insult' : 'counter';
  s.history.push({ offer, issues: issueIds, reply, counter: s.ask });
  if (s.trust <= 0) { s.ended = true; s.history.push({ reply: 'walk' }); }
  else if (s.round >= cfg.rounds) s.final = true; // last-and-final: player may only accept or walk away
  return { accepted: false, state: s, insult };
}
