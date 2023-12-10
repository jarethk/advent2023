/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { shiftPoint, adjSet } from 'geometry/space2d.js';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let pipeGrid = [];
let startX = 0;
let startY = 0;

const WEST_FACING = "-LF";
const EAST_FACING = "-J7";
const SOUTH_FACING = "|LJ";
const NORTH_FACING = "|7F";

function filterAdj(adj, curr, visited) {
    let coords = shiftPoint(curr, adj)
    if (coords[0] >= pipeGrid.length || coords[0] < 0 || coords[1] < 0 || coords[1] >= pipeGrid[0].length) return false;
    let val = pipeGrid[coords[0]][coords[1]];
    dl(`Testing val ${val} at coord ${coords}`);
    if (visited.includes(coords.join("|"))) return false;
    if (adj[0] == 0 && adj[1] == 1 && EAST_FACING.includes(val)) return true;
    if (adj[0] == 0 && adj[1] == -1 && WEST_FACING.includes(val)) return true;
    if (adj[0] == 1 && adj[1] == 0 && SOUTH_FACING.includes(val)) return true;
    if (adj[0] == -1 && adj[1] == 0 && NORTH_FACING.includes(val)) return true;
    dl(`No direction on val ${val}`)
    return false;
}

for await (const line of file.readLines()) {
    pipeGrid.push([...line.split("")]);
    if (line.includes("S")) {
        startX = line.indexOf("S");
        startY = pipeGrid.length - 1;
    }
}

if (debug) console.log(`Grid: \n\t${pipeGrid.map(y => "{" + y.join("") + "}").join("\n\t")}`)

let queue = [];
let visited = [];
let steps = 0;
queue.push({
    coords: [startY, startX],
    steps: 0
});
visited.push([startY, startX].join("|"));

while (queue.length > 0) {
    let currStep = queue.shift();
    let adjacent = adjSet;
    dl(`Adjacent from current ${currStep.coords}: ${JSON.stringify(adjacent)}`)
    adjacent = adjacent.filter(c => filterAdj(c, currStep.coords, visited))
        .map(a => shiftPoint(currStep.coords, a))
        .map(c => { return { coords: c, steps: currStep.steps + 1 } });
    visited.push(...adjacent.map(a => a.coords.join("|")));
    dl(`Adjacent from current ${currStep.coords}: ${JSON.stringify(adjacent)}`)
    queue.push(...adjacent);
    steps = currStep.steps;
}

console.log(`Found end in steps: ${steps}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
