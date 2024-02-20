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

function filterPath(p, fromPoint, map, visited) {
    return (map[p[0]][p[1]] != "#" &&
        !visited.has(JSON.stringify(p)) &&
        !((p[0] - fromPoint[0]) == -1 && map[p[0]][p[1]] == "v") &&
        !((p[0] - fromPoint[0]) == 1 && map[p[0]][p[1]] == "^") &&
        !((p[1] - fromPoint[1]) == -1 && map[p[0]][p[1]] == ">") &&
        !((p[1] - fromPoint[1]) == 1 && map[p[0]][p[1]] == "<"));
}

let toProcessFrom = [[0, 1]];
while (toProcessFrom.length > 0) {
    let startPoint = toProcessFrom.shift();

    let vertexPathSteps = [];

    // from this point, find the next vertex down each path
    let paths = getAdjacent(startPoint, map).filter(p => filterPath(p, startPoint, map, new Set()));
    if (paths.some(p => map[p[0]][p[1]] == ".")) console.log(`!!Alert vertex has non-slope adjacents! ${startPoint}`);
    console.log(paths);
    paths.forEach(path => {
        let visited = new Set();
        visited.add(JSON.stringify(startPoint));
        let stepCount = 1;
        let step = path;
        visited.add(JSON.stringify(step));
        let options = getAdjacent(step, map).filter(p => filterPath(p, step, map, visited));
        console.log(options);
        while (options.length == 1) {
            stepCount++;
            step = options[0];
            visited.add(JSON.stringify(step));
            options = getAdjacent(step, map).filter(p => filterPath(p, step, map, visited));
        }
        if (options.length > 1) toProcessFrom.push(step);
        console.log(`Steps from point ${startPoint}: ${stepCount}`);
        vertexPathSteps.push([JSON.stringify(step), stepCount]);
    });
    vertices.set(JSON.stringify(startPoint), vertexPathSteps);
    console.log(`++adding to vertices: ${vertexPathSteps}: ${vertices.size}`);
}

console.log(`Vertices: \n\t${[...vertices.entries()].map(v => v[0] + ":" + JSON.stringify(v[1])).join("\n\t")}`);

let theEnd = JSON.stringify([map.length - 1, map[0].length - 2]);
let theStart = JSON.stringify([0, 1]);

let reducedVertices = new Map();
let processQueue = [...vertices.keys()].reverse();
while (processQueue.length > 0) {
    let pq = processQueue.shift();
    let v = vertices.get(pq);
    // something is wrong, have a path step not processed yet
    if (v.filter(path => !(path[0] == theEnd || reducedVertices.has(path[0]))).length > 0) {
        console.log(`some reason this one needs to be reprocessed ${pq}`);
        processQueue.push(pq);
    } else {
        let max = Math.max(...v.map(path => (path[0] == theEnd) ? path[1] : path[1] + reducedVertices.get(path[0])));
        reducedVertices.set(pq, max);
    }
}

console.log(`reducedVertices: \n\t${[...reducedVertices.entries()].map(v => v[0] + ":" + JSON.stringify(v[1])).join("\n\t")}`);

console.log(`=== Max steps: ${reducedVertices.get(theStart)}`);

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
