/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { PriorityQueue } from 'priorit-queue/priority-queue';
import { getAdjacent } from 'geometry/space2d.js';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let grid = [];

for await (const line of file.readLines()) {
    grid.push(line.split("").map(c => Number.parseInt(c)));
}

let scoredGrid = [];
for (let y = 0; y < grid.length; y++) {
    scoredGrid.push(new Array(grid[y].length));
}
let visited = new Set();

//console.log(`scored grid:\n\t${scoredGrid.map(row => row.join("")).join("\n\t")}`);

let winner;
let queue = new PriorityQueue();
queue.add(JSON.stringify([[0, 0]]), 0);
while (queue.size() > 0) {
    let dq = queue.getLowest();
    dl(`Playing from ${dq}`)
    let paths = JSON.parse(dq[0]);
    //dl(`curr ${JSON.stringify(paths)}`)
    let [currY, currX] = paths[paths.length - 1];
    // if we already put a score in this grid point, and that score is lower
    let scored = scoredGrid[currY][currX];

    if (!scored) scoredGrid[currY][currX] = [dq[1], [...paths]];

    let last4 = JSON.stringify(paths.slice(-4));
    if (visited.has(last4)) continue;
    visited.add(last4);

    // if at the end, done
    if (currY == grid.length - 1 && currX == grid[0].length - 1) break;

    if (currY == grid.length - 1 && currX == grid[0].length - 1) {
        if (winner == undefined) winner = [dq[1], paths];
        else if (winner > dq[1]) winner = [dq[1], paths];
    }

    let adjacent = getAdjacent([currY, currX])
        .filter(p => (p[0] >= 0 && p[1] >= 0 && p[0] < grid.length && p[1] < grid[0].length))
        .filter(p => paths.every(pt => !(pt[0] == p[0] && pt[1] == p[1])));;
    if (paths.length >= 4) {
        let [twoBackY, twoBackX] = paths[paths.length - 4];
        if (currY === twoBackY) adjacent = adjacent.filter(p => p[0] != currY);
        if (currX === twoBackX) adjacent = adjacent.filter(p => p[1] != currX);
    }
    adjacent.forEach(p => {
        queue.add(JSON.stringify([...paths, p]), dq[1] + grid[p[0]][p[1]]);
    });
    if (queue.size() % 1000 == 0) console.log(`Remaining queue: ${queue.size()}`);
}

//console.log(`scored grid:\n\t${scoredGrid.map(row => row.map(ent => ent[0]).join(",")).join("\n\t")}`);

let scored = scoredGrid[grid.length - 1][grid[0].length - 1];

console.log(`Final heat: ${grid.length - 1}|${grid[0].length - 1} ${scored[0]}`);
//console.log(`Final path: ${JSON.stringify(scored[1])}`);

let winningPath = [];
let emptyRow = new Array(grid[0].length);
emptyRow.fill('00');
for (let y = 0; y < grid.length; y++) winningPath.push([...emptyRow]);
scored[1].forEach(p => winningPath[p[0]][p[1]] = new String(scoredGrid[p[0]][p[1]][0]).padStart(2, "0"));

//console.log(`winningPath:\n\t${winningPath.map(row => row.join(",")).join("\n\t")}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
