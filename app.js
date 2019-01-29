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

function isValid(x, y){ 
    return (x > 0 && x < MAZE_SIZE && y > 0 && y < MAZE_SIZE);
}

function isAWall(x, y) {
    return (maze[x][y] === WALL_ICON);
}

// Maze Generator

function generateMaze(size) {
    let x = randrange(1, size, 2), y = (size - 1) * randint(0, 1),
        coords = [[x, x], [y, y ? (y - 1) : 1]],
        dfsStart = [coords[0][1], coords[1][1]],
        exit = [coords[0][0], coords[1][0]],
        spawn = [randrange(1, size, 2), randrange(1, size, 2)];
    maze[dfsStart[0]] = maze[dfsStart[0]].replaceAt(dfsStart[1], ' ');
    maze[exit[0]][exit[1]] = 'E'
	mazeDists[exit[0]][exit[1]] = 0
    generateMazeRecursive(dfsStart[0],dfsStart[1],1)
    maze[spawn[0]] = maze[spawn[0]].replaceAt(spawn[1], 'S');
    return spawn, exit;
}

function generateMazeRecursive(y, x, dist) {
    mazeDists[y][x] = dist;
    let pairs = [[1,0], [0,1], [-1,0], [0,-1]];
    shuffle(pairs);
    for(let i = 1; i < 4; i++) {
        if (isValid(y+2*pairs[i][0], x+2*pairs[i][1])) {
            if ( isAWall(y+2*pairs[i][0], x+2 * pairs[i][1])) {
                maze[y+pairs[i][0]][x + pairs[i][1]] = ' ', maze[y+2*pairs[i][0]][x+2*pairs[i][1]] = ' ';
                mazeDists[y+pairs[i][0]][x+pairs[i][1]] = dist+1
                generateMazeRecursive(y+2*pairs[i][0],x+2*pairs[i][1], dist+2)
            }
        }
    }
}

for (let i = 0; i < MAZE_SIZE; i++) {
    maze[i] = WALL_ICON.repeat(MAZE_SIZE);
}

for (let i = 0; i < MAZE_SIZE; i++) {
    mazeDists[i] = [-1] * MAZE_SIZE;
}

var spawn, exit = generateMaze(MAZE_SIZE);

console.log(randrange(0, 100, 5))
