/* eslint-disable no-unused-vars */
import { open } from 'node:fs/promises';
import { PriorityQueue } from 'priorit-queue/priority-queue';
import { adjSet, getAdjacent, shiftPoint } from 'geometry/space2d.js';

const debug = 1;
const dl = log => { if (debug) console.log(log); };

const file = await open("./sample-input.txt");
//const file = await open("./full-input.txt");

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

const MIN_STRAIGHT = 4;
const MAX_STRAIGHT = 10;
const SLICE_LENGTH = -2;

let winner;
let queue = new PriorityQueue();
queue.add(JSON.stringify([[[0, 0]], '-']), 0);
while (queue.size() > 0) {
    let dq = queue.getLowest();
    //dl(`Playing from ${dq}`)
    let pathsAndDir = JSON.parse(dq[0]);
    let paths = pathsAndDir[0];
    //dl(`curr ${JSON.stringify(paths)}`)
    let [currY, currX] = paths[paths.length - 1];
    //let [priorY, priorX] = paths.length >= 2 ? paths[paths.length - 2] : [0, 0];
    // if we already put a score in this grid point, and that score is lower
    let scored = scoredGrid[currY][currX];

    //if (scored != undefined) continue;
    //if (scored && scored[0] < dq[1]) continue;
    //if (scored && scored[1].length < paths.length) continue;
    //if (winner && winner < dq[1]) continue;
    //if (winner && winner[1].length < paths.length) continue;
    if (!scored) scoredGrid[currY][currX] = [dq[1], [...paths]];

    let last10 = JSON.stringify([paths.slice(SLICE_LENGTH), pathsAndDir[1]]);
    if (visited.has(last10)) continue;
    visited.add(last10);
    //if (visited.has(currY + "|" + currX + "|" + priorY + "|" + priorX)) continue;
    //visited.add(currY + "|" + currX + "|" + priorY + "|" + priorX);

    // if at the end, done
    if (currY == grid.length - 1 && currX == grid[0].length - 1) break;

    if (currY == grid.length - 1 && currX == grid[0].length - 1) {
        if (winner == undefined) winner = [dq[1], paths];
        else if (winner > dq[1]) winner = [dq[1], paths];
    }

    let adjLists = adjSet.filter(adj => {
        let p = shiftPoint([currY, currX], adj);
        return paths.every(pt => !(pt[0] == p[0] && pt[1] == p[1]));
    }).filter(adj => {
        //return !((currY - priorY) == adj[0] && (currX - priorX) == adj[1]) && !((priorY - currY) == adj[0] && (priorX - currX) == adj[1])
        return (pathsAndDir[1] == "Y" && adj[1] != 0) && (pathsAndDir[1] == "X" && adj[0] != 0)
    }).map(adj => {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => [adj[0] * n, adj[1] * n]).map(adj => shiftPoint([currY, currX], adj))
    }).filter(adjList => (adjList[MIN_STRAIGHT - 1][0] >= 0 && adjList[MIN_STRAIGHT - 1][1] >= 0
        && adjList[MIN_STRAIGHT - 1][0] < grid.length && adjList[MIN_STRAIGHT - 1][1] < grid[0].length));

    adjLists.forEach(adjList => {
        let score = dq[1];
        let minSlice = adjList.slice(0, MIN_STRAIGHT);
        let newPath = [...paths];
        let newDir = paths[paths - 1][0] == adjList[0][0] ? "Y" : "X";

        minSlice.forEach((p, idx) => {
            score += grid[p[0]][p[1]];

            if (idx == MIN_STRAIGHT - 1) {
                newPath.push(p);
                queue.add(JSON.stringify([newPath, newDir]), score);
            } else {
                let last10 = JSON.stringify([newPath.slice(SLICE_LENGTH), newDir]);
                visited.add(last10);
                if (!scoredGrid[p[0]][p[1]]) scoredGrid[p[0]][p[1]] = [score, [...newPath]];
            }
        });

        adjList.slice(MIN_STRAIGHT)
            .filter(p => (p[0] >= 0 && p[1] >= 0 && p[0] < grid.length && p[1] < grid[0].length))
            .forEach(p => {
                score += grid[p[0]][p[1]];
                newPath.push(p);
                queue.add(JSON.stringify([newPath, newDir]), score);
            });
    })
    if (queue.size() % 1000 == 0) console.log(`Remaining queue: ${queue.size()} at ${performance.now() - t0} milliseconds`);
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
