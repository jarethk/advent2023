/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { getAdjacent } from 'geometry/space2d.js';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let map = [];

for await (const line of file.readLines()) {
    map.push(line.split(""));
}

let vertices = new Map();

function filterPath(p, map, visited) {
    return (map[p[0]][p[1]] != "#" &&
        !visited.has(JSON.stringify(p)));
}

let toProcessFrom = [[0, 1]];
while (toProcessFrom.length > 0) {
    let startPoint = toProcessFrom.shift();
    if (vertices.has(JSON.stringify(startPoint))) continue;

    let vertexPathSteps = [];

    // from this point, find the next vertex down each path
    let paths = getAdjacent(startPoint, map).filter(p => filterPath(p, map, new Set()));
    if (paths.some(p => map[p[0]][p[1]] == ".")) console.log(`!!Alert vertex has non-slope adjacents! ${startPoint}`);
    console.log(paths);
    paths.forEach(path => {
        let visited = new Set();
        visited.add(JSON.stringify(startPoint));
        let stepCount = 1;
        let step = path;
        visited.add(JSON.stringify(step));
        let options = getAdjacent(step, map).filter(p => filterPath(p, map, visited));
        console.log(options);
        while (options.length == 1) {
            stepCount++;
            step = options[0];
            visited.add(JSON.stringify(step));
            options = getAdjacent(step, map).filter(p => filterPath(p, map, visited));
        }
        if (options.length > 1) toProcessFrom.push(step);
        console.log(`Steps from point ${startPoint}: ${stepCount}`);
        vertexPathSteps.push([JSON.stringify(step), stepCount]);
    });
    vertices.set(JSON.stringify(startPoint), vertexPathSteps);
    console.log(`++adding to vertices: ${vertexPathSteps}: ${vertices.size}`);
}

console.log(`Vertices: \n\t${[...vertices.entries()].map(v => v[0] + ":" + JSON.stringify(v[1])).join("\n\t")}`);
console.log(`Vertices count ${vertices.size}`);

let theEnd = JSON.stringify([map.length - 1, map[0].length - 2]);
let theStart = JSON.stringify([0, 1]);

let pathsToEnd = [];
let longestPath = 0;
let processQueue = [];
processQueue.push({
    from: theStart,
    path: [theStart],
    steps: 0
});
while (processQueue.length > 0) {
    let pq = processQueue.pop();
    let v = vertices.get(pq.from);
    let vPathSet = new Set(pq.path);
    v.filter(vpath => !vPathSet.has(vpath[0])).forEach(vpath => {
        if (vpath[0] == theEnd) {
            dl(`Adding path to end: ${pq.steps}`);
            pathsToEnd.push({
                path: [...pq.path, vpath[0]],
                steps: pq.steps + vpath[1]
            });
            if (pq.steps + vpath[1] > longestPath) {
                longestPath = pq.steps + vpath[1];
                console.log(`New longest path: ${longestPath} at time ${performance.now() - t0}`);
            }
        } else {
            processQueue.push({
                from: vpath[0],
                path: [...pq.path, vpath[0]],
                steps: pq.steps + vpath[1]
            });
        }
    });
    //console.log(`Queue length ${processQueue.length}`);
}

console.log(`=== Max steps: ${longestPath}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
