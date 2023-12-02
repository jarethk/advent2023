#!/bin/zsh
DAY=2
if [ ! -d "Day"$DAY ]
then
    mkdir Day$DAY
    cd Day$DAY
    touch README-Day$DAY.md journal.md sample-input.txt full-input.txt part2.mjs
    cp ../part1.mjs part1.mjs
fi