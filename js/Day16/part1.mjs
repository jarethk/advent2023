/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { compassSet, shiftPoint } from 'geometry/space2d.js';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

function nextStep(light) {
    dl(`Next step from: ${JSON.stringify(light)}`)
    return { coords: shiftPoint(light.coords, compassSet[light.dir]), dir: light.dir };
}

let grid = [];

for await (const line of file.readLines()) {
    grid.push([...line.split("")]);
}

let energizedSet = new Set();
let visitedSet = new Set();
let queue = [];
queue.push({
    coords: [0, 0], dir: "E"
});
while (queue.length > 0) {
    let light = queue.shift();
    if (!(light.coords[0] < grid.length && light.coords[0] >= 0 && light.coords[1] < grid[0].length && light.coords[1] >= 0))
        continue;
    let val = grid[light.coords[0]][light.coords[1]];
    // a bit of efficiency.  If we're passing through empty space, we only care about the vertical/horizontal, not full compass
    let visitor = { coords: light.coords, dir: (val != "." ? light.dir : (light.dir == "N" || light.dir == "S") ? "|" : "-") };
    if (visitedSet.has(JSON.stringify(visitor))) continue;

    energizedSet.add(JSON.stringify(light.coords));
    visitedSet.add(JSON.stringify(visitor));
    switch (val) {
        case ".":
            queue.push(nextStep(light));
            break;
        case "\\":
            if (light.dir == "E") light.dir = "S";
            else if (light.dir == "S") light.dir = "E";
            else if (light.dir == "W") light.dir = "N";
            else if (light.dir == "N") light.dir = "W";
            queue.push(nextStep(light));
            break;
        case "/":
            if (light.dir == "E") light.dir = "N";
            else if (light.dir == "N") light.dir = "E";
            else if (light.dir == "W") light.dir = "S";
            else if (light.dir == "S") light.dir = "W";
            queue.push(nextStep(light));
            break;
        case "|":
            if (light.dir == "N" || light.dir == "S") queue.push(nextStep(light));
            else {
                light.dir = "S";
                queue.push(nextStep(light));
                light.dir = "N";
                queue.push(nextStep(light));
            }
            break;
        case "-":
            if (light.dir == "E" || light.dir == "W") queue.push(nextStep(light));
            else {
                light.dir = "E";
                queue.push(nextStep(light));
                light.dir = "W";
                queue.push(nextStep(light));
            }
            break;
        default:
            console.log(`Invalid state ${grid[light.coords[0]][light.coords[1]]} at ${JSON.stringify(light)}`);
            break;
    }
}

console.log(`final grid: \n\t${grid.map((row, y) => row.map((c, x) => energizedSet.has(JSON.stringify([y, x])) ? "#" : ".").join("")).join("\n\t")}`);

console.log(`Energized: ${[...energizedSet.values()].length}`);
console.log(`Visited: ${[...visitedSet.values()].length}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
