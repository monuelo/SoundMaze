var cols, rows;
var scl = 40;
var grid = [];
var stack = [];

var active;
var player;
var finish;

var highlightShow = true;

function setup() {
  createCanvas(1000, 600);
  background(237, 34, 93);
  cols = floor(width / scl);
  rows = floor(height / scl);

  for (var j = 0; j < rows; j++) {
    for (var i = 0; i < cols; i++) {
      var cell = new Cell(i, j);
      grid.push(cell);
    }
  }
  active = grid[0];
  player = grid[0];
  finish = grid[index(14, 14)];
}

function index(i, j) {
  if (i < 0 || j < 0 || i > cols - 1 || j > cols - 1) {
    return -1;
  }
  return i + j * cols;
}

function draw() {
  for (var i = 0; i < grid.length; i++) {
    grid[i].show();
  }

  player.visible();
  finish.visible();


  active.checked = true;
  active.highlight();
  var next = active.checkN();
  if (next) {
    next.checked = true;
    removeLine(active, next);
    active = next;
    stack.push(active);
  }
}

function Cell(i, j) {
  this.i = i;
  this.j = j;
  this.walls = [true, true, true, true] // top right bottom left
  this.checked = false;

  this.show = function () {
    var x = this.i * scl;
    var y = this.j * scl;

    stroke(255);

    if (this.walls[0]) { line(x, y, x + scl, y); } // Top
    if (this.walls[1]) { line(x + scl, y, x + scl, y + scl); } // Right
    if (this.walls[2]) { line(x, y + scl, x + scl, y + scl); } // Bottom
    if (this.walls[3]) { line(x, y, x, y + scl); } // Left

    if (this.checked) {
      noStroke();
      fill(60, 50, 170);
      rect(x, y, scl, scl);
    }
  }

  this.checkN = function () {
    var n = []

    var top = grid[index(i, j - 1)];
    var right = grid[index(i + 1, j)];
    var bottom = grid[index(i, j + 1)];
    var left = grid[index(i - 1, j)];

    if (top && !top.checked) { n.push(top); }
    if (right && !right.checked) { n.push(right); }
    if (bottom && !bottom.checked) { n.push(bottom); }
    if (left && !left.checked) { n.push(left); }

    if (n.length > 0) {
      var r = floor(random(0, n.length));
      return n[r];
    } else {
      back();
    }
  }

  this.highlight = function () {
    if (highlightShow) {
      var x = this.i * scl;
      var y = this.j * scl;

      noStroke();
      fill(20, 240, 30, 100);
      rect(x, y, scl, scl);
    }
  }

  this.visible = function () {
    if (allChecked()) {
      var x = this.i * scl;
      var y = this.j * scl;

      noStroke();
      fill(20, 240, 30);
      rect(x + 5, y + 5, scl - 10, scl - 10);
    }
  }
}

back = function () {
  if (!allChecked()) {
    stack.pop();
    active = stack[stack.length - 1];
  } else {
    highlightShow = false;
  }
}

allChecked = function () {
  var finished = true;
  for (var i = 0; i < grid.length - 1; i++) {
    if (!grid[i].checked) {
      finished = false;
    }
  }
  if (finished) { return true; } else { return false; }
}

removeLine = function (a, n) {
  var x = a.i - n.i;
  var y = a.j - n.j;
  if (y === 1) { a.walls[0] = false; n.walls[2] = false; } else // Top
    if (x === -1) { a.walls[1] = false; n.walls[3] = false; } else // Right
      if (y === -1) { a.walls[2] = false; n.walls[0] = false; } else // Bottom
        if (x === 1) { a.walls[3] = false; n.walls[1] = false; }     // Left
}

function keyTyped(key) {
  if (key === 'w' && !player.walls[0]) {
    player = grid[index(player.i, player.j - 1)];
  } else if (key === 'd' && !player.walls[1]) {
    player = grid[index(player.i + 1, player.j)];
  } else if (key === 's' && !player.walls[2]) {
    player = grid[index(player.i, player.j + 1)];
  } else if (key === 'a' && !player.walls[3]) {
    player = grid[index(player.i - 1, player.j)];
  }

  if (player === finish) {
    Swal.fire({
      title: 'YAYY!',
      text: 'Congrats! You Win!',
      type: 'success',
      confirmButtonText: 'Cool'
    })
    reset();
  }
}

reset = function () {

      recognizer.stopListening();
    toggleButtons(true);
    document.getElementById('listen').textContent = 'Listen';
  grid = []
  background(237, 34, 93);

  for (var j = 0; j < rows; j++) {
    for (var i = 0; i < cols; i++) {
      var cell = new Cell(i, j);
      grid.push(cell);
    }
  }

  active = grid[0];
  player = grid[0];
  finish = grid[index(14, 14)];
}