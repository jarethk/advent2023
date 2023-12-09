#!/usr/bin/perl

#open(FH, '<', "sample-input2.txt") or die $!;
open(FH, '<', "full-input.txt") or die $!;

my $numbersRe = qr/(?:one)|(?:two)|(?:three)|(?:four)|(?:five)|(?:six)|(?:seven)|(?:eight)|(?:nine)|\d/;
my $doubleDigitRe = qr/(${numbersRe}).*(${numbersRe})/;
my $singleDigitRe = qr/(${numbersRe})/;

my %numMap = (
    "one", "1",
    "two", "2",
    "three", "3",
    "four", "4",
    "five", "5",
    "six", "6",
    "seven", "7",
    "eight", "8",
    "nine", "9",
    "1", "1",
    "2", "2",
    "3", "3",
    "4", "4",
    "5", "5",
    "6", "6",
    "7", "7",
    "8", "8",
    "9", "9"
);

$accum = 0;
while (<FH>) {
    if ($_ =~ /${doubleDigitRe}/) {
        print "Translate map2: " . $1 . ":" . $numMap{$1} . "; " . $2 . ":" . $numMap{$2} . "\n";
        $accum += ($numMap{$1}.$numMap{$2});
    } elsif (/${singleDigitRe}/) {
        print "Translate map1: " . $1 . ":" . $numMap{$1} . "\n";
        $accum += ($numMap{$1}.$numMap{$1});
    }
}

print $accum . "\n";

close(FH);