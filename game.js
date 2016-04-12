//
// This program draws a maze that the player can navigate with the arrow keys.
// The maze is full of dots that the player can eat points.
// The player is also being chased by monsters!
//

//
// The maze is represented by a string that is formatted into a grid.
// Each cell in the grid represents either:
// - the start point ('A');
// - a wall ('#').
// - a monster ('Z');
// - a walkable empty space (' ').
//
//         -------------------
var maze = '                 '
         + ' # ## ##Z## ## # '
         + '   #   ###   #   '
         + ' #   #     #   # '
         + ' ## ## # # ## ## '
         + ' Z#     A     #Z '
         + ' ## ## # # ## ## '
         + ' #   #     #   # '
         + '   #   ###   #   '
         + ' # ## ##Z## ## # '
         + '                 ';
//         -------------------

var columns = 17;
var rows = 11;

var pathColor = 0x95CFB7;
var wallColor = 0xFF823A;
var dotColor = 0xF2F26F;
var monsterColor = 0xF04155;
var playerColor = 0xFFF7BD;
var deadColor = 0x000000;

// shorter delays mean faster monsters.
var monsterMoveDelayMin = 500;
var monsterMoveDelayMax = 1000;
var hitDelay = 500;

var maxLives = 4;

// ============================================================================

var startLocation;
var wallStartX, wallStartY, wallSize;
var dotSize;
var dots = [];
var player;
var monsters = [];
var maxScore;
var hitTime = 0;

function setup() {
  renderer.backgroundColor = wallColor;
  buildMaze();
  player = new Player(startLocation.row, startLocation.column);
}

function update() {
  graphics.clear();
  drawPath();
  drawDots();
  drawPlayer();
  drawMonsters();
  checkCollisions();
  updateMonster();
  updateState();
}

function onKeyDown(event) {
  var deltaRow = 0;
  var deltaColumn = 0;
  switch (event.keyCode) {
    case 37: // Left Arrow
      deltaColumn = -1;
      break;
    case 38: // Up Arrow
      deltaRow = -1;
      break;
    case 39: // Right Arrow
      deltaColumn = +1;
      break;
    case 40: // Down Arrow
      deltaRow = +1;
      break;
    case 76: // L for 'Live Again'
      if (player.life == 0)
        player.resurrect();
      break;
  }

  if (player.life > 0 && deltaRow != 0 || deltaColumn != 0) {
    player.move(deltaRow, deltaColumn);
    if (player.hasLoop()) {
      gainLife();
    }
  }
}

function buildMaze() {
  // Calculate the best-fit size of a wall block based on the canvas size
  // and number of columns or rows in the grid.
  wallSize = Math.min(renderer.width / (columns + 2), renderer.height / (rows + 2));

  // Calculate the starting position when drawing the maze.
  wallStartX = (renderer.width - (wallSize * columns)) / 2;
  wallStartY = (renderer.height - (wallSize * rows)) / 2;

  // The size of a dot is some fraction of the size of a maze spot.
  dotSize = wallSize / 8;

  maxScore = 0;
  var monsterSides = 3;

  // Find the player and monster locations, and initialize the dot map.
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < columns; c++) {
      var i = (r * columns) + c;
      var ch = maze[i];
      if (ch == 'A') {
        startLocation = {
          'row': r,
          'column': c
        };
      } else if (ch == 'Z') {
        monsters.push(new Monster(monsterSides, r, c));
        monsterSides += 1;
      }

      if (!isWall(r, c) && ch != 'Z' && ch != 'A') {
        // each clear space in the maze should have a dot in it.
        dots[i] = '.';
        maxScore += 1;
      } else {
        dots[i] = ' ';
      }
    }
  }
}

function isWall(r, c) {
  var i = (r * columns) + c;
  var ch = maze[i];
  return ((ch != ' ') && (ch != 'A') && (ch != 'Z'));
}

function canMoveTo(r, c) {
  // is this spot outside the maze?
  if (r < 0 || c < 0 || r >= rows || c >= columns)
    return false;
  // is there a wall in this spot?
  if (isWall(r, c))
    return false;
  return true;
}

// ============================================================================

function drawPath() {
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < columns; c++) {
      var i = (r * columns) + c;
      var ch = maze[i];
      // The start and monster locations are also on the path,
      // so check for them too.
      if (ch == ' ' || ch == 'A' || ch == 'Z') {
        var x = wallStartX + c * wallSize;
        var y = wallStartY + r * wallSize;
        drawRect(x, y, wallSize, wallSize, pathColor);
      }
    }
  }
}

function drawDots() {
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < columns; c++) {
      var i = (r * columns) + c;
      var ch = dots[i];
      if (ch == '.') {
        var x = wallStartX + c * wallSize + wallSize / 2;
        var y = wallStartY + r * wallSize + wallSize / 2;
        drawCircle(x, y, dotSize, dotColor);
      }
    }
  }
}

function drawPlayer() {
  player.draw();
}

function drawMonsters() {
  for (var i in monsters) {
    var monster = monsters[i];
    monster.draw();
  }
}

// ============================================================================

function checkCollisions() {
  // check to see if the player is on top of an edible dot.
  var i = player.location.row * columns + player.location.column;
  if (dots[i] == '.') {
    player.score += 1;
    dots[i] = ' ';
    if (player.score % 10 == 0) {
      gainLife();
    }
  }

  // check to see if the player is on top of any monsters.
  for (var j in monsters) {
    var monster = monsters[j];
    if (player.isHit(monster)) {
      if (player.life <= 0) break;
      if (gameTime > hitTime) {
        player.life--;
        hitTime = gameTime + hitDelay;
      }
    }
  }
}

function updateState() {
  var lifediv = document.getElementById('life');
  var scorediv = document.getElementById('score');

  lifediv.innerHTML = player.life;
  scorediv.innerHTML = player.score;

  if (player.life <= 0) {
    player.die();
    lifediv.innerHTML += ' YOU DIE!'
  } else if (player.score == maxScore) {
    player.win();
    scorediv.innerHTML += ' YOU WIN!';
  }
}

function updateMonster() {
  for (var i in monsters) {
    var monster = monsters[i];
    monster.update(player);
  }
}

function spawnMonster() {
  var r, c;
  do {
    r = randomInt(0, rows - 1);
    c = randomInt(0, columns - 1);
  } while (isWall(r, c));
  monsters.push(new Monster(randomInt(3, 6), r, c));
}

function gainLife() {
  if (player.life >= maxLives) return;
  player.life++;
  spawnMonster();
}
