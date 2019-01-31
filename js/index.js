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

    if (this.walls[0]) { line(x, y, x + scl, y); } // top
    if (this.walls[1]) { line(x + scl, y, x + scl, y + scl); } // right
    if (this.walls[2]) { line(x, y + scl, x + scl, y + scl); } // bottom
    if (this.walls[3]) { line(x, y, x, y + scl); } // left

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
  console.log(x + "  " + y);
  if (y === 1) { a.walls[0] = false; n.walls[2] = false; } else // top
    if (x === -1) { a.walls[1] = false; n.walls[3] = false; } else // right
      if (y === -1) { a.walls[2] = false; n.walls[0] = false; } else // bottom
        if (x === 1) { a.walls[3] = false; n.walls[1] = false; }     // left
}

function keyTyped(key) {
  if (key === 'w' && !player.walls[0]) {
    player = grid[index(player.i, player.j - 1)];
    console.log("W");
  } else if (key === 'd' && !player.walls[1]) {
    player = grid[index(player.i + 1, player.j)];
    console.log("D");
  } else if (key === 's' && !player.walls[2]) {
    player = grid[index(player.i, player.j + 1)];
    console.log("S");
  } else if (key === 'a' && !player.walls[3]) {
    player = grid[index(player.i - 1, player.j)];
    console.log("A");
  }

  if (player === finish) {
    reset();
  }
}

reset = function () {
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

/// 

let recognizer;

function predictWord() {
  // Array of words that the recognizer is trained to recognize.
  const words = recognizer.wordLabels();
  recognizer.listen(({ scores }) => {
    // Turn scores into a list of (score,word) pairs.
    scores = Array.from(scores).map((s, i) => ({ score: s, word: words[i] }));
    // Find the most probable word.
    scores.sort((s1, s2) => s2.score - s1.score);
    document.querySelector('#console').textContent = scores[0].word;
  }, { probabilityThreshold: 0.75 });
}

async function app() {
  recognizer = speechCommands.create('BROWSER_FFT');
  await recognizer.ensureModelLoaded();
  buildModel();
}

app();

// One frame is ~23ms of audio.
const NUM_FRAMES = 5;
let examples = [];

function collect(label) {
  if (label == null) {
    return recognizer.stopListening();
  }
  recognizer.listen(async ({ spectrogram: { frameSize, data } }) => {
    let vals = normalize(data.subarray(-frameSize * NUM_FRAMES));
    examples.push({ vals, label });
    document.querySelector('#console').textContent =
      `${examples.length} examples collected`;
  }, {
      overlapFactor: 0.999,
      includeSpectrogram: true,
      invokeCallbackOnNoiseAndUnknown: true
    });
}

function normalize(x) {
  const mean = -100;
  const std = 10;
  return x.map(x => (x - mean) / std);
}

const INPUT_SHAPE = [NUM_FRAMES, 232, 1];
let model;

async function train() {
  toggleButtons(false);
  const ys = tf.oneHot(examples.map(e => e.label), 5);
  const xsShape = [examples.length, ...INPUT_SHAPE];
  const xs = tf.tensor(flatten(examples.map(e => e.vals)), xsShape);

  await model.fit(xs, ys, {
    batchSize: 16,
    epochs: 10,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        document.querySelector('#console').textContent =
          `Accuracy: ${(logs.acc * 100).toFixed(1)}% Epoch: ${epoch + 1}`;
      }
    }
  });
  tf.dispose([xs, ys]);
  toggleButtons(true);
}

function buildModel() {
  model = tf.sequential();
  model.add(tf.layers.depthwiseConv2d({
    depthMultiplier: 8,
    kernelSize: [NUM_FRAMES, 5],
    activation: 'relu',
    inputShape: INPUT_SHAPE
  }));
  model.add(tf.layers.maxPooling2d({ poolSize: [1, 2], strides: [2, 2] }));
  model.add(tf.layers.flatten());
  model.add(tf.layers.dense({ units: 5, activation: 'softmax' }));
  const optimizer = tf.train.adam(0.01);
  model.compile({
    optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
}

function toggleButtons(enable) {
  document.querySelectorAll('button').forEach(b => b.disabled = !enable);
}

function flatten(tensors) {
  const size = tensors[0].length;
  const result = new Float32Array(tensors.length * size);
  tensors.forEach((arr, i) => result.set(arr, i * size));
  return result;
}


async function moveBlock(labelTensor) {
  const label = (await labelTensor.data())[0];
  document.getElementById('console').textContent = label;
  if (label == 4) {
    return;
  }
  switch (label) {
    case 0:
      keyTyped('w')
      break;
    case 1:
      keyTyped('d')
      break;
    case 2:
      keyTyped('s')
      break;
    case 3:
      keyTyped('a')
      break;
  }
  let delta = 0.1;
  const prevValue = +document.getElementById('output').value;
  document.getElementById('output').value =
    prevValue + (label === 0 ? -delta : delta);
}

function listen() {
  if (recognizer.isListening()) {
    recognizer.stopListening();
    toggleButtons(true);
    document.getElementById('listen').textContent = 'Listen';
    return;
  }
  toggleButtons(false);
  document.getElementById('listen').textContent = 'Stop';
  document.getElementById('listen').disabled = false;

  recognizer.listen(async ({ spectrogram: { frameSize, data } }) => {
    const vals = normalize(data.subarray(-frameSize * NUM_FRAMES));
    const input = tf.tensor(vals, [1, ...INPUT_SHAPE]);
    const probs = model.predict(input);
    const predLabel = probs.argMax(1);
    await moveBlock(predLabel);
    tf.dispose([input, probs, predLabel]);
  }, {
      overlapFactor: 0.999,
      includeSpectrogram: true,
      invokeCallbackOnNoiseAndUnknown: true
    });
}
