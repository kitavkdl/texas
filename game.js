// 포커 팟 계산 로직. 상태는 평범한 객체, 함수는 제자리 수정.
// ponytail: 사이드팟 없음 — 올인 금액이 서로 다르면 승자가 건 것보다 많이 가져간다. 필요하면 팟 분리 추가.
function newGame(names, chips) {
  return { pot: 0, players: names.map(name => ({ name, stack: chips, bet: 0, folded: false, acted: false, gain: 0 })) };
}

const maxBet = g => Math.max(0, ...g.players.map(p => p.bet));
// 판이 진행 중에 들어오면 폴드 상태로 시작 — 다음 판부터 참여 (안 그러면 라운드가 안 닫힌다)
function addPlayer(g, name, chips) {
  const midHand = g.pot > 0 || g.players.some(p => p.bet > 0);
  g.players.push({ name, stack: chips, bet: 0, folded: midHand, acted: false, gain: 0 });
}

const live = g => g.players.filter(p => !p.folded);

function put(p, to) {
  const add = Math.min(to - p.bet, p.stack);
  if (add > 0) { p.stack -= add; p.bet += add; }
}

function collect(g) {
  g.players.forEach(p => { g.pot += p.bet; p.bet = 0; p.acted = false; });
}

function win(g, i) {
  collect(g);
  g.players.forEach(p => { p.folded = false; p.gain = 0; });
  g.players[i].stack += g.pot;
  g.players[i].gain = g.pot;
  g.pot = 0;
}

// kind: 'bet'(amount = 이번 라운드 총 베팅) | 'call'(체크 포함) | 'fold'
function act(g, i, kind, amount) {
  const p = g.players[i];
  if (p.folded) return;
  g.players.forEach(q => { q.gain = 0; });
  const before = maxBet(g);
  if (kind === 'fold') p.folded = true;
  else if (kind === 'call') put(p, before);
  else if (kind === 'bet') {
    if (!(amount > p.bet) || (amount < before && amount - p.bet < p.stack)) return; // 콜보다 적은 베팅은 올인일 때만
    put(p, amount);
  }
  p.acted = true;
  if (maxBet(g) > before) live(g).forEach(q => { if (q !== p) q.acted = false; }); // 레이즈하면 다시 액션
  const l = live(g);
  if (l.length === 1) return win(g, g.players.indexOf(l[0]));
  const m = maxBet(g);
  if (l.every(q => q.acted && (q.bet === m || q.stack === 0))) collect(g);
}

if (typeof module !== 'undefined') module.exports = { newGame, addPlayer, act, win, maxBet };
