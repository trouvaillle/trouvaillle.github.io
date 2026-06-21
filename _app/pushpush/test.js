const CELL = { PLAYER:0, BALL:1, HOUSE_EMPTY:2, HOUSE_FILLED:3, WALL:4, EMPTY:5, VOID:6 };
const DIR = { UP:[-1,0], DOWN:[1,0], LEFT:[0,-1], RIGHT:[0,1] };
const ROWS=13; const COLS=13;
const FS = require('fs');
const buf = FS.readFileSync('B:/projects/github/trouvaillle/trouvaillle.github.io/assets/data/pushpush.dat');
const raw = [];
for (let r = 0; r < 13; r++) {
  const row = [];
  for (let c = 0; c < 13; c++) row.push(buf.readUInt8(r * 13 + c));
  raw.push(row);
}
console.log('raw rows:', raw.length, 'cols:', raw[0].length);

class Board {
  constructor(grid) {
    this.grid = grid.map(row => [...row]);
    this.terrain = grid.map(row => row.map(cell => {
      if (cell === CELL.HOUSE_EMPTY || cell === CELL.HOUSE_FILLED) return CELL.HOUSE_EMPTY;
      if (cell === CELL.WALL) return CELL.WALL;
      if (cell === CELL.VOID) return CELL.VOID;
      return CELL.EMPTY;
    }));
  }
  get(r,c){if(r<0||r>=ROWS||c<0||c>=COLS)return null;return this.grid[r][c];}
  set(r,c,val){if(r<0||r>=ROWS||c<0||c>=COLS)return;this.grid[r][c]=val;}
  clearCell(r,c){if(r<0||r>=ROWS||c<0||c>=COLS)return;this.grid[r][c]=this.terrain[r][c];}
  findPlayer(){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(this.grid[r][c]===CELL.PLAYER)return[r,c];return null;}
  countHouseEmpty(){let n=0;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(this.grid[r][c]===CELL.HOUSE_EMPTY)n++;return n;}
}

class Player {
  constructor(board){this.board=board;const p=board.findPlayer();if(!p)throw Error('no player');this.row=p[0];this.col=p[1];}
  tryMove(dr,dc){
    const nr=this.row+dr,nc=this.col+dc;
    const t=this.board.get(nr,nc);
    if(t===null||t===CELL.WALL||t===CELL.VOID)return false;
    if(t===CELL.EMPTY||t===CELL.HOUSE_EMPTY){
      this.board.clearCell(this.row,this.col);
      this.row=nr;this.col=nc;
      this.board.set(this.row,this.col,CELL.PLAYER);
      return true;
    }
    if(t===CELL.BALL||t===CELL.HOUSE_FILLED){
      const br=nr+dr,bc=nc+dc;
      const pt=this.board.get(br,bc);
      if(pt===null)return false;
      if(pt!==CELL.EMPTY&&pt!==CELL.HOUSE_EMPTY)return false;
      this.board.set(br,bc,pt===CELL.HOUSE_EMPTY?CELL.HOUSE_FILLED:CELL.BALL);
      this.board.clearCell(nr,nc);
      this.board.clearCell(this.row,this.col);
      this.row=nr;this.col=nc;
      this.board.set(this.row,this.col,CELL.PLAYER);
      return true;
    }
    return false;
  }
}

function pg(b,l){console.log(l);for(let r=0;r<13;r++){let s='';for(let c=0;c<13;c++)s+=b.grid[r][c]+' ';console.log(s);}console.log('');}

const b = new Board(raw);
const p = new Player(b);
console.log('Initial houses:', b.countHouseEmpty());
console.log('Houses at: (3,5),(5,8),(6,3),(8,6)');
console.log('House (5,8): ball at (5,7). Push ball LEFT away from house then walk on house.');

// Push ball at (6,5) LEFT to (6,4)
p.tryMove(0, -1); // -> (6,5)
// Push ball at (5,5) UP to (4,5)
p.tryMove(-1, 0); // -> (5,5)
// Move RIGHT to (5,6)
p.tryMove(0, 1); // -> (5,6)
// Push ball at (5,7) LEFT to (5,6) - no, player is at (5,6)
// Move DOWN to (6,6)
p.tryMove(1, 0); // -> (6,6)

// Now (6,6) is cleared, terrain = EMPTY(5). Player at (6,6).
// Actually (6,6) was original player pos, terrain = 5. clearCell sets to 5. Good.

// Move RIGHT to (6,7)... wait (6,7)=WALL(4). Can't.
// Move UP to (5,6)=EMPTY
p.tryMove(-1, 0); // -> (5,6)
// Now push ball at (5,7) LEFT to (5,6)... player is at (5,6). 
// Move DOWN to (6,6) again
p.tryMove(1, 0); // -> (6,6)
// Move UP to (5,6)=EMPTY
p.tryMove(-1, 0); // -> (5,6). Hmm I'm going in circles.

// Let me be smarter. Player at (5,6). I want ball at (5,7) to move LEFT to (5,6).
// Player needs to be at (5,8) and push LEFT.
// Can player reach (5,8)? (5,8)=HOUSE_EMPTY(2). From (5,6), move RIGHT: (5,6)->(5,7)=BALL(1).
// Push RIGHT from (5,7): pushTarget (5,8)=HOUSE_EMPTY(2) -> HOUSE_FILLED(3). 
// Then player at (5,7). House at (5,8) is now filled. Can't reach it empty.

// Different approach. What if we push ball at (5,7) DOWN?
// (6,7)=WALL. Can't.

// Push ball at (5,7) UP? (4,7)=WALL. Can't.

// Ball at (5,7) can ONLY go LEFT (to (5,6)) or RIGHT (to (5,8)=house).
// To push LEFT, player must be at (5,8). But to reach (5,8) empty, the ball must first go LEFT.
// Circular dependency.

// What about house at (8,6)?
// Ball at (7,6) above it. Push DOWN to fill house.
// Then push... DOWN again? (9,6)=WALL. Can't push.
// Push UP? Player at (8,6)=HOUSE_FILLED? No, ball+house at (8,6) after push.

// Player at (6,6) -> DOWN to (7,6)=BALL(1). Push DOWN to (8,6)=HOUSE(2) -> HOUSE_FILLED(3).
console.log('--- Push ball into house at (8,6) ---');
// First, player at (6,6). Move RIGHT to (6,7)=WALL. Can't.
// Player at (6,6). Move DOWN to (7,6):
// But wait after previous moves, player might not be at (6,6).
// Let me track current position...
console.log('Player at:', p.row, p.col);

// I give up with the complex trace. Let me just test the specific scenario
// of walking on a house and walking off, using a custom map.

console.log('\n=== CUSTOM TEST: walk on house directly ===');
const customRaw = [
  [5,5,5,5,5],
  [5,5,2,5,5],
  [5,0,5,5,5],
  [5,5,5,5,5],
  [5,5,5,5,5]
];

const cb = new Board(customRaw);
const cp = new Player(cb);
console.log('Initial house count:', cb.countHouseEmpty());

// Move right twice, then up onto house, then right off
cp.tryMove(0,1); // to (2,1)
cp.tryMove(0,1); // to (2,2)
cp.tryMove(-1,0); // to (1,2) - house!
console.log('On house: grid[1][2]=', cb.get(1,2), 'terrain[1][2]=', cb.terrain[1][2]);
console.log('House count while on house:', cb.countHouseEmpty());
cp.tryMove(0,1); // off house to (1,3)
console.log('After walking off: grid[1][2]=', cb.get(1,2), '(expect 2)');
console.log('House count after:', cb.countHouseEmpty());

if (cb.get(1,2) !== 2) {
  console.log('BUG CONFIRMED: house cell is', cb.get(1,2), 'instead of 2');
} else {
  console.log('HOUSE CORRECTLY PRESERVED');
}
