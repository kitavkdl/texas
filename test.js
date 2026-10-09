// node test.js
const assert = require('assert');
const { newGame, addPlayer, act, win } = require('./game.js');
const stacks = g => g.players.map(p => p.stack);

// A 100 베팅, B 콜, C 폴드 → 라운드 자동 마감, B 승
let g = newGame(['A', 'B', 'C'], 1000);
act(g, 0, 'bet', 100); act(g, 1, 'call'); assert.equal(g.pot, 0); act(g, 2, 'fold');
assert.equal(g.pot, 200); assert.deepEqual(stacks(g), [900, 900, 1000]);
win(g, 1); assert.deepEqual(stacks(g), [900, 1100, 1000]); assert.equal(g.pot, 0);

// 전원 폴드 → 남은 사람 자동 승리
g = newGame(['A', 'B', 'C'], 1000);
act(g, 0, 'bet', 50); act(g, 1, 'fold'); act(g, 2, 'fold');
assert.deepEqual(stacks(g), [1000, 1000, 1000]);

// 레이즈하면 라운드가 안 닫히고, 콜하면 닫힘
g = newGame(['A', 'B'], 1000);
act(g, 0, 'bet', 100); act(g, 1, 'bet', 300); assert.equal(g.pot, 0);
act(g, 0, 'call'); assert.equal(g.pot, 600);

// 전원 체크 → 닫힘 (팟 0), 올인은 스택 한도까지만
g = newGame(['A', 'B'], 100);
act(g, 0, 'bet', 500); assert.equal(g.players[0].stack, 0);
act(g, 1, 'call'); assert.equal(g.pot, 200);
win(g, 0); assert.deepEqual(stacks(g), [200, 0]);
// 인원 추가: 빈 게임에서 시작, 판 도중 추가된 사람은 폴드 상태라 라운드를 안 막음
g = newGame([], 1000); addPlayer(g, 'A', 1000); addPlayer(g, 'B', 1000);
act(g, 0, 'bet', 100); addPlayer(g, 'C', 500); assert(g.players[2].folded);
act(g, 1, 'call'); assert.equal(g.pot, 200);
win(g, 0); assert(!g.players[2].folded);
console.log('ok');
