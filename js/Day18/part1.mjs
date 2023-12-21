/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { dirSet, shiftPoint, getSurrounding } from 'geometry/space2d.js';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let current = [0, 0];
let coords = [];

const LINE_RE = /^(\w)\s(\d+)\s(.+)$/;

for await (const line of file.readLines()) {
    let parts = line.match(LINE_RE);
    let moves = Number.parseInt(parts[2]);
    if (coords.length == 0) coords.push([current, parts[3]]);
    for (let m = 0; m < moves; m++) {
        current = shiftPoint(current, dirSet[parts[1]]);
        coords.push([current, parts[3]]);
    }
}

const REV_SORT = (a, b) => b - a;
const FIRST_LAST = (v, idx, arr) => ((idx == 0) || (idx == arr.length - 1));
let [maxX, minX] = coords.map(p => p[0][1]).sort(REV_SORT).filter(FIRST_LAST);
let [maxY, minY] = coords.map(p => p[0][0]).sort(REV_SORT).filter(FIRST_LAST);
console.log(`minx: ${minX}; miny: ${minY}; maxx: ${maxX}; maxy: ${maxY}`);
let grid = [];
// generate grid of appropriate size
for (let y = 0; y <= (maxY - minY); y++) {
    grid.push(new Array((maxX - minX) + 1).fill(" "));
}

// dig the trench
coords.forEach(p => {
    grid[p[0][0] - minY][p[0][1] - minX] = "X";
});

let queue = [];
grid.forEach((row, idy) => {
    if (idy == 0 || idy == grid.length - 1) {
        row.forEach((v, idx) => {
            if (v == " ") queue.push(idy + "|" + idx);
        });
    } else {
        if (row[0] == " ") queue.push(idy + "|" + 0);
        if (row[row.length - 1] == " ") queue.push(idy + "|" + (row.length - 1));
    }
});

console.log(`Fill queue: ${queue}`)

let fillCount = 0;
while (queue.length > 0) {
    let currCoords = queue.shift().split("|").map(c => Number.parseInt(c));
    dl(`filling coords ${currCoords}`)
    if (grid[currCoords[0]][currCoords[1]] != " ") continue;
    grid[currCoords[0]][currCoords[1]] = ".";
    fillCount++;
    //console.log(getSurrounding(currCoords));
    queue.push(...getSurrounding(currCoords)
        .filter(c => c[0] >= 0 && c[1] >= 0 && c[0] < grid.length && c[1] < grid[0].length)
        .filter(c => grid[c[0]][c[1]] == " ")
        .map(c => c.join("|")));
}


//console.log("\t" + grid.map(row => row.join("")).join("\n\t"));
console.log(`Outer frame: ${coords.length}`)
//console.log(`Volume: ${grid.map(row => row.filter(c => c != ".").length).reduce((a, b) => a + b)}`)
console.log(`FillCount : ${fillCount}`)
console.log(`Volume : ${(grid.length * grid[0].length) - fillCount}`)

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
