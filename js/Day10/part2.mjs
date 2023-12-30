/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { shiftPoint, adjSet, getSurrounding, getAdjacent } from 'geometry/space2d.js';

const debug = 0;
const dl = log => { if (debug) console.log(log); };

//const file = await open("./sample-input.txt");
//const file = await open("./sample-input2.txt");
//const file = await open("./sample-input3.txt");
const file = await open("./full-input.txt");

const t0 = performance.now();

let pipeGrid = [];
let originalGrid = [];
let startX = 0;
let startY = 0;

const EAST_FACING = "-LF";
const WEST_FACING = "-J7";
const NORTH_FACING = "|LJ";
const SOUTH_FACING = "|7F";

function getAdjacentPipe(coords) {
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
    if (adj[0] == 0 && adj[1] == 1 && WEST_FACING.includes(val)) return true;
    if (adj[0] == 0 && adj[1] == -1 && EAST_FACING.includes(val)) return true;
    if (adj[0] == 1 && adj[1] == 0 && NORTH_FACING.includes(val)) return true;
    if (adj[0] == -1 && adj[1] == 0 && SOUTH_FACING.includes(val)) return true;
    dl(`No direction on val ${val}`)
    return false;
}

for await (const line of file.readLines()) {
    pipeGrid.push([...line.split("")]);
    originalGrid.push([...line.split("")]);
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

while (queue.length > 0) {
    let currStep = queue.shift();
    let adjacent = getAdjacentPipe(currStep.coords);
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

visited.forEach(v => {
    let coords = v.split("|");
    pipeGrid[coords[0]][coords[1]] = "*";
});

queue = [];
pipeGrid.forEach((row, idy) => {
    if (idy == 0 || idy == pipeGrid.length - 1) {
        row.forEach((v, idx) => {
            if (v != "*") queue.push(idy + "|" + idx);
        });
    } else {
        if (row[0] != "*") queue.push(idy + "|" + 0);
        if (row[row.length - 1] != "*") queue.push(idy + "|" + (row.length - 1));
    }
});

console.log(`Fill queue: ${queue}`)
let filled = new Set();

const SPLIT_ADDER = 0.5;

while (queue.length > 0) {
    let q = queue.shift();
    if (filled.has(q)) continue;
    filled.add(q);
    let currCoords = q.split("|").map(c => Number.parseFloat(c));
    dl(`filling coords ${currCoords}`);

    if (currCoords[0] % 1 == 0 && currCoords[1] % 1 == 0) {
        if (pipeGrid[currCoords[0]][currCoords[1]] == "0" || pipeGrid[currCoords[0]][currCoords[1]] == "*") continue;
        pipeGrid[currCoords[0]][currCoords[1]] = "0";
        let surrounding = getAdjacent(currCoords)
            .filter(c => c[0] >= 0 && c[1] >= 0 && c[0] < pipeGrid.length && c[1] < pipeGrid[0].length)
            .filter(c => pipeGrid[c[0]][c[1]] != "0");
        queue.push(...surrounding
            .filter(c => pipeGrid[c[0]][c[1]] != "*")
            .map(c => c.join("|")));
        surrounding.forEach(c => {
            if (currCoords[0] == 5 && currCoords[1] == 3) console.log(`Checking ${originalGrid[c[0]][c[1]]}`);
            if (c[0] < currCoords[0] && originalGrid[c[0]][c[1]] != "-") {
                if (originalGrid[c[0]][c[1]] == "L" || originalGrid[c[0]][c[1]] == "|") {
                    if (currCoords[0] == 5 && currCoords[1] == 3) console.log(`Can go north-west`);
                    queue.push((c[0]) + "|" + (c[1] - SPLIT_ADDER));
                }
                if (originalGrid[c[0]][c[1]] == "J" || originalGrid[c[0]][c[1]] == "|") {
                    if (currCoords[0] == 5 && currCoords[1] == 3) console.log(`Can go north-east`);
                    queue.push((c[0]) + "|" + (c[1] + SPLIT_ADDER));
                    console.log(`pushed ${queue[queue.length - 1]}`);
                }
            }
            if (c[0] > currCoords[0] && originalGrid[c[0]][c[1]] != "-") {
                if (originalGrid[c[0]][c[1]] == "F" || originalGrid[c[0]][c[1]] == "|") {
                    if (currCoords[0] == 5 && currCoords[1] == 3) console.log(`Can go south-west`);
                    queue.push((c[0]) + "|" + (c[1] - SPLIT_ADDER));
                }
                if (originalGrid[c[0]][c[1]] == "7" || originalGrid[c[0]][c[1]] == "|") {
                    if (currCoords[0] == 5 && currCoords[1] == 3) console.log(`Can go south-east`);
                    queue.push((c[0]) + "|" + (c[1] + SPLIT_ADDER));
                }
            }
            if (c[1] < currCoords[1] && originalGrid[c[0]][c[1]] != "|") {
                if (originalGrid[c[0]][c[1]] == "7" || originalGrid[c[0]][c[1]] == "-")
                    queue.push((c[0] - SPLIT_ADDER) + "|" + (c[1]));
                if (originalGrid[c[0]][c[1]] == "J" || originalGrid[c[0]][c[1]] == "-")
                    queue.push((c[0] + SPLIT_ADDER) + "|" + (c[1]));
            }
            if (c[1] > currCoords[1] && originalGrid[c[0]][c[1]] != "|") {
                if (originalGrid[c[0]][c[1]] == "F" || originalGrid[c[0]][c[1]] == "-")
                    queue.push((c[0] - SPLIT_ADDER) + "|" + (c[1]));
                if (originalGrid[c[0]][c[1]] == "L" || originalGrid[c[0]][c[1]] == "-")
                    queue.push((c[0] + SPLIT_ADDER) + "|" + (c[1]));
            }
        });
    } else {
        console.log(`filling from rounded coords ${currCoords}`);
        //currCoords[0] = Math.round(currCoords[0]);
        //currCoords[1] = Math.round(currCoords[1]);
        if (currCoords[0] % 1 == 0.5) {
            let x = currCoords[1] - 1;
            let y1 = Math.floor(currCoords[0]);
            let y2 = Math.ceil(currCoords[0]);
            if (x >= 0 && x < pipeGrid[0].length && y1 >= 0 && y2 < pipeGrid.length) {
                let oy1 = originalGrid[y1][x];
                let py1 = pipeGrid[y1][x];
                let oy2 = originalGrid[y2][x];
                let py2 = pipeGrid[y2][x];
                if (py1 != "*" && py1 != "0") queue.push(y1 + "|" + x);
                if (py2 != "*" && py2 != "0") queue.push(y2 + "|" + x);
                // going west, check can go up or down
                if ("7J|".includes(oy1)) queue.push(y1 + "|" + (x + SPLIT_ADDER));
                if ("7J|".includes(oy2)) queue.push(y2 + "|" + (x + SPLIT_ADDER));
                // going west, check can keep going west
                if ("JL-".includes(oy1) && "7F-".includes(oy2)) queue.push((y1 + SPLIT_ADDER) + "|" + (x));
            }

            // now do the same for going east
            x = currCoords[1] + 1;
            if (x >= 0 && x < pipeGrid[0].length && y1 >= 0 && y2 < pipeGrid.length) {
                let oy1 = originalGrid[y1][x];
                let py1 = pipeGrid[y1][x];
                let oy2 = originalGrid[y2][x];
                let py2 = pipeGrid[y2][x];
                if (py1 != "*" && py1 != "0") queue.push(y1 + "|" + x);
                if (py2 != "*" && py2 != "0") queue.push(y2 + "|" + x);
                // going east, check can go up or down
                if ("FL|".includes(oy1)) queue.push(y1 + "|" + (x - SPLIT_ADDER));
                if ("FL|".includes(oy2)) queue.push(y2 + "|" + (x - SPLIT_ADDER));
                // going east, check can keep going east
                if ("JL-".includes(oy1) && "7F-".includes(oy2)) queue.push((y1 + SPLIT_ADDER) + "|" + (x));
            }
        }
        if (currCoords[1] % 1 == 0.5) {
            let y = currCoords[0] - 1;
            let x1 = Math.floor(currCoords[1]);
            let x2 = Math.ceil(currCoords[1]);
            if (x1 >= 0 && x2 < pipeGrid[0].length && y >= 0 && y < pipeGrid.length) {
                let ox1 = originalGrid[y][x1];
                let px1 = pipeGrid[y][x1];
                let ox2 = originalGrid[y][x2];
                let px2 = pipeGrid[y][x2];
                if (px1 != "*" && px1 != "0") queue.push(y + "|" + x1);
                if (px2 != "*" && px2 != "0") queue.push(y + "|" + x2);
                // going north, check can go left or right
                if ("LJ-".includes(ox1)) queue.push((y + SPLIT_ADDER) + "|" + (x1));
                if ("LJ-".includes(ox2)) queue.push((y + SPLIT_ADDER) + "|" + (x2));
                // going north, check can keep going north
                if ("J7|".includes(ox1) && "LF|".includes(ox2)) queue.push((y) + "|" + (x1 + SPLIT_ADDER));
            }

            // now do the same for going south
            y = currCoords[0] + 1;
            if (x1 >= 0 && x2 < pipeGrid[0].length && y >= 0 && y < pipeGrid.length) {
                let ox1 = originalGrid[y][x1];
                let px1 = pipeGrid[y][x1];
                let ox2 = originalGrid[y][x2];
                let px2 = pipeGrid[y][x2];
                if (px1 != "*" && px1 != "0") queue.push(y + "|" + x1);
                if (px2 != "*" && px2 != "0") queue.push(y + "|" + x2);
                // going south, check can go left or right
                if ("F7-".includes(ox1)) queue.push((y - SPLIT_ADDER) + "|" + (x1));
                if ("F7-".includes(ox2)) queue.push((y - SPLIT_ADDER) + "|" + (x2));
                // going south, check can keep going south
                if ("J7|".includes(ox1) && "LF|".includes(ox2)) queue.push((y) + "|" + (x1 + SPLIT_ADDER));
            }
        }
    }


    /*
const EAST_FACING = "-LF";
const WEST_FACING = "-J7";
const NORTH_FACING = "|LJ";
const SOUTH_FACING = "|7F";
    */
    // special case?  handle flood fill where the fill squeezes between lines...
}

console.log(`Grid: \n\t${pipeGrid.map(y => "{" + y.join("") + "}").join("\n\t")}`)

console.log(`Final inner count ${pipeGrid.reduce((ac, row) => ac + row.filter(c => c != "*" && c != "0").length, 0)}`)

const t1 = performance.now();
console.log(`Call to doSomething took ${t1 - t0} milliseconds.`);
