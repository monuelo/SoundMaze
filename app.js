var maze = [], mazeDists = [];
// Constants
const WALL_ICON = '#';
const MAZE_SIZE = 10;

// Util Functions

function randrange(min, max, step) {
    min = min || 0;
    step = step || 1;
    return Math.floor(Math.random() * (max - min) / step) * step + min;
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
    array.sort(() => { return 0.5 - Math.random() });
}

String.prototype.replaceAt = function (index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

// Maze Generator

function generateMaze(size) {
    let x = randrange(1, size, 2), y = (size - 1) * randint(0, 1),
        coords = [[x, x], [y, y ? (y - 1) : 1]],
        dfsStart = [coords[0][1], coords[1][1]],
        exit = [coords[0][0], coords[1][0]],
        spawn = [randrange(1, size, 2), randrange(1, size, 2)];
    
    maze[dfsStart[0]] = maze[dfsStart[0]].replaceAt(dfsStart[1], ' ');
    maze[spawn[0]] = maze[spawn[0]].replaceAt(spawn[1], 'S');
    
    return spawn, exit;
}


for (let i = 0; i < MAZE_SIZE; i++) {
    maze[i] = WALL_ICON.repeat(MAZE_SIZE);
}

for (let i = 0; i < MAZE_SIZE; i++) {
    mazeDists[i] = [-1] * MAZE_SIZE;
}

var spawn, exit = generateMaze(MAZE_SIZE);

console.log(randrange(0, 100, 5))
