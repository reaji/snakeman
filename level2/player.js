// Create a new Player and initialize it.
var Player = function(r, c) {
  this.life = 1;
  this.score = 0;
  this.color = playerColor;
  this.location = {
    'row': r,
    'column': c
  };
  this.locationHistory = [this.location];
  this.lastLoop = 0;
}

// Draw me to the canvas.
Player.prototype.draw = function() {
  var draw = function(location, color) {
    var x = wallStartX + location.column * wallSize + wallSize / 2;
    var y = wallStartY + location.row * wallSize + wallSize / 2;
    drawCircle(x, y, wallSize / 3, color);
    drawCircle(x + 1, y + 1, wallSize / 3, color);
  }
  var historyLength = this.locationHistory.length;
  //for (var i = 0; i < this.life; i++) {
  for (var i=this.life-1; i>=0; i--) {
    var historyIndex = historyLength - 1 - i;
    if (historyIndex < 0) break;
    var c = this.color;
    if (i==0)
      c = 0x0000FF;
    draw(this.locationHistory[historyIndex], c);
  }
}

Player.prototype.isHit = function(monster) {
  var historyLength = this.locationHistory.length;
  for (var i = 0; i < this.life; i++) {
    var historyIndex = historyLength - 1 - i;
    if (historyIndex < 0) break;
    if (isLocationEqual(this.locationHistory[historyIndex], monster.location)) {
      return true;
    }
  }
  return false;
}

// Move me by the given number of rows/columns (if possible)
Player.prototype.move = function(deltaRow, deltaColumn) {
  if (this.life == 0)
    return;

  if (deltaRow == 0 && deltaColumn == 0)
    return;

  // Look at the location I want to move to. if it's out of bounds or
  // there's a wall, cancel the move.
  var nr = player.location.row + deltaRow;
  var nc = player.location.column + deltaColumn;
  if (nr < 0 || nr >= rows || nc < 0 || nc >= columns || isWall(nr, nc)) {
    return;
  }

  player.location = {
    'row': player.location.row + deltaRow,
    'column': player.location.column + deltaColumn
  };
  this.locationHistory.push(player.location);
}

Player.prototype.hasLoop = function() {
  var loopLength = 0;
  var historyLength = this.locationHistory.length;
  for (var i = historyLength - 2; i >= this.lastLoop; i--) {
    loopLength++;
    if (isLocationEqual(this.location, this.locationHistory[i])) {
      if (loopLength == 8) {
        console.log(loopLength);
        this.lastLoop = historyLength;
        return true;
      } else {
        break;
      }
    }
  }
  return false;
}

//     ;_;
Player.prototype.die = function() {
  this.color = deadColor;
}

//     ^_^
Player.prototype.win = function() {
  this.color = dotColor;
}

//     o_O
Player.prototype.resurrect = function() {
  this.life = 1;
  this.color = playerColor;
  this.locationHistory = [this.location];
  alert("You cheated!");
}
