/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { shiftPoint, adjSet, getSurrounding } from 'geometry/space2d.js';

const debug = 1;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
//const file = await open("./sample-input2.txt");
const file = await open("./sample-input3.txt");
//const file = await open("./full-input.txt");

const t0 = performance.now();

let pipeGrid = [];
let startX = 0;
let startY = 0;

const EAST_FACING = "-LF";
const WEST_FACING = "-J7";
const NORTH_FACING = "|LJ";
const SOUTH_FACING = "|7F";
const CORNER = "LFJ7";

function getAdjacent(coords) {
    let val = pipeGrid[coords[0]][coords[1]];
    return adjSet.filter(a => (val === "S" ||
        (a[0] == -1 && NORTH_FACING.includes(val)) ||
        (a[0] == 1 && SOUTH_FACING.includes(val)) ||
        (a[1] == -1 && WEST_FACING.includes(val)) ||
        (a[1] == 1 && EAST_FACING.includes(val))));
}

function filterAdj(adj, curr, visited) {
    let coords = shiftPoint(curr, adj)
    if (coords[0] >= pipeGrid.length || coords[0] < 0 || coords[1] < 0 || coords[1] >= pipeGrid[0].length) return false;
    let val = pipeGrid[coords[0]][coords[1]];
    dl(`Testing val ${val} at coord ${coords}`);
    if (visited.includes(coords.join("|"))) return false;
    // if we've only got origin in visited, start with south/west to help with shoelace
    if (adj[0] == 0 && adj[1] == 1 && WEST_FACING.includes(val)) return true;
    if (adj[0] == 0 && adj[1] == -1 && EAST_FACING.includes(val) && visited.length > 1) return true;
    if (adj[0] == 1 && adj[1] == 0 && NORTH_FACING.includes(val) && visited.length > 1) return true;
    if (adj[0] == -1 && adj[1] == 0 && SOUTH_FACING.includes(val)) return true;
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

console.log(`Grid: \n\t${pipeGrid.map(y => "{" + y.join("") + "}").join("\n\t")}`)

let queue = [];
let visited = [];
let steps = 0;
queue.push({
    coords: [startY, startX],
    steps: 0
});
visited.push([startY, startX].join("|"));
let points = [[startY, startX]];

while (queue.length > 0) {
    let currStep = queue.shift();
    let adjacent = getAdjacent(currStep.coords);
    dl(`Adjacent from current ${currStep.coords}: ${JSON.stringify(adjacent)}`)
    adjacent = adjacent.filter(c => filterAdj(c, currStep.coords, visited))
        .map(a => shiftPoint(currStep.coords, a))
        .map(c => { return { coords: c, steps: currStep.steps + 1 } });
    visited.push(...adjacent.map(a => a.coords.join("|")));
    dl(`Adjacent from current ${currStep.coords}: ${JSON.stringify(adjacent)}`);
    if (adjacent.length > 0) {
        /*
        let val = pipeGrid[adjacent[0].coords[0]][adjacent[0].coords[1]];
        if (CORNER.includes(val)) {
            console.log(`Pivoted on Y at coords: ${currStep.coords} compared to ${adjacent[0].coords} and ${lastPointY}`);
            points.push(currStep.coords);
        }
        */

        // if Y is pivoting, add to the points
        //let [lastPointY, lastPointX] = points[points.length - 1];
        let [lastPointY, lastPointX] = visited[visited.length - 1];
        //if (adjacent[0].coords[0] != lastPointY && adjacent[0].coords[1] != lastPointX) {
        console.log(`Pivoted on Y at coords: ${currStep.coords} compared to ${adjacent[0].coords} and ${lastPointY}`);
        points.push(currStep.coords);
        //}
    }
    queue.push(...adjacent);
    steps = currStep.steps;
}

console.log(`Found end in steps: ${steps}`);

console.log(JSON.stringify(points));

/*
points = [
    [7, 2],
    [1, 10],
    [6, 8],
    [7, 11],
    [10, 7]
]
*/
// shoelace
console.log(points.map((p, idx, arr) => (p[1] * arr[(idx + 1) % arr.length][0]) - (arr[(idx + 1) % arr.length][1] * p[0])).reduce((a, b) => a + b) / 2);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
