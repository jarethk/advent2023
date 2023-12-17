/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { compassSet, shiftPoint } from 'geometry/space2d.js';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

const file = await open("./sample-input.txt");
//const file = await open("./full-input.txt");

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
    if (visitedSet.has(JSON.stringify(light))) continue;
    visitedSet.add(JSON.stringify(light));

    let shifter = compassSet[light.dir];
    console.log(`getting val from ${JSON.stringify(light)}`);
    let val = grid[light.coords[0]][light.coords[1]];
    while (light.coords[0] < grid.length && light.coords[0] >= 0 && light.coords[1] < grid[0].length && light.coords[1] >= 0 &&
        !(val == "|" && (light.dir == "E" || light.dir == "W")) &&
        !(val == "-" && (light.dir == "S" || light.dir == "N"))) {
        energizedSet.add(JSON.stringify(light.coords));
        if (val == "\\") {
            if (light.dir == "E") light.dir = "S";
            else if (light.dir == "S") light.dir = "E";
            else if (light.dir == "W") light.dir = "N";
            else if (light.dir == "N") light.dir = "W";
            shifter = compassSet[light.dir];
        } else if (val == "/") {
            if (light.dir == "E") light.dir = "N";
            else if (light.dir == "N") light.dir = "E";
            else if (light.dir == "W") light.dir = "S";
            else if (light.dir == "S") light.dir = "W";
            shifter = compassSet[light.dir];
        }
        light.coords = shiftPoint(light.coords, shifter);
        if (light.coords[0] < grid.length && light.coords[0] >= 0 && light.coords[1] < grid[0].length && light.coords[1] >= 0)
            val = grid[light.coords[0]][light.coords[1]];
    }
    if (light.coords[0] < grid.length && light.coords[0] >= 0 && light.coords[1] < grid[0].length && light.coords[1] >= 0) {
        if (val == "|" && (light.dir == "E" || light.dir == "W")) {
            light.dir = "S";
            queue.push(nextStep(light));
            light.dir = "N";
            queue.push(nextStep(light));
        } else if (val == "-" && (light.dir == "S" || light.dir == "N")) {
            light.dir = "E";
            queue.push(nextStep(light));
            light.dir = "W";
            queue.push(nextStep(light));
        }
    }
}

console.log(`final grid: \n\t${grid.map((row, y) => row.map((c, x) => energizedSet.has(JSON.stringify([y, x])) ? "#" : ".").join("")).join("\n\t")}`);

console.log(`Energized: ${[...energizedSet.values()].length}`);
console.log(`Visited: ${[...visitedSet.values()].length}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
