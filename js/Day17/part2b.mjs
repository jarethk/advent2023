/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { PriorityQueue } from 'priorit-queue/priority-queue';
import { compassSet, shiftPoint } from 'geometry/space2d.js';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
//const file = await open("./sample-input2.txt");
const file = await open("./full-input.txt");

const altDir = {
    'E': 'W',
    'W': 'E',
    'S': 'N',
    'N': 'S',
    '-': '-'
};

const t0 = performance.now();

let grid = [];

for await (const line of file.readLines()) {
    grid.push(line.split("").map(c => Number.parseInt(c)));
}
let visited = new Set();

const MIN_STRAIGHT = 4;
const MAX_STRAIGHT = 10;

function isInGrid(point) {
    return point[0] >= 0 && point[0] < grid.length &&
        point[1] >= 0 && point[1] < grid[0].length
}

let winner = Infinity;
let queue = new PriorityQueue();
queue.add(JSON.stringify([['-', 4], [0, 0]]), 0);
while (queue.size() > 0) {
    let dq = queue.getLowest();
    dl(`Playing from ${dq}`)
    let state = JSON.parse(dq[0]);
    let dirCount = state[0];
    let [currY, currX] = state[1];
    // been here with a lower score
    //let key = JSON.stringify(state[1]);
    let key = dq[0];
    if (visited.has(key)) continue;
    visited.add(key, dq[1]);
    //let ts = JSON.parse(dq[0]);
    //ts[0][0] = altDir(ts[0][0]);
    //visited.add(JSON.stringify(ts));

    let cellScore = 0;
    if (!(currX == 0 && currY == 0)) cellScore = grid[currY][currX];

    if (currY == grid.length - 1 && currX == grid[0].length - 1 && winner > dq[1]) {
        winner = dq[1] + cellScore;
        break;
    }

    if (debug) {
        dl(`\tCurrent Dir: ${dirCount[0]} for steps: ${dirCount[1]}; ${JSON.stringify(dirCount)}`);
    }

    let newStates = Object.entries(compassSet)
        .filter(e => e[0] != altDir[dirCount[0]])
        .filter(e => (e[0] == dirCount[0] && dirCount[1] < MAX_STRAIGHT) ||
            (e[0] != dirCount[0] && dirCount[1] >= MIN_STRAIGHT))
        .map(e => {
            let dc = (e[0] == dirCount[0]) ? dirCount[1] + 1 : 1;
            let sp = shiftPoint(state[1], e[1]);
            let ns = (dq[1] + cellScore);
            for (; dc < MIN_STRAIGHT; dc++) {
                ns += (isInGrid(sp)) ? grid[sp[0]][sp[1]] : 0;
                sp = shiftPoint(sp, e[1]);
            }
            let newState = [[[e[0], dc], sp], ns];
            return newState;
        })
        .filter(newState => isInGrid(newState[0][1]));

    if (debug) {
        dl(`\tPotential states: ${JSON.stringify(newStates)}`);
    }
    newStates.forEach(ns => {
        if (debug) {
            dl(`\tAdding: ${JSON.stringify(ns)} with score ${(ns[1])}`);
        }
        let nk = JSON.stringify(ns[0]);
        if (!queue.has(nk))
            queue.add(nk, (ns[1]));
    });
}

console.log(`Final heat: ${grid.length - 1}|${grid[0].length - 1} ${winner}`);
//console.log(`Final path: ${JSON.stringify(scored[1])}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
