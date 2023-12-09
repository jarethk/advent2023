#!/usr/bin/perl

#open(FH, '<', "sample-input.txt") or die $!;
open(FH, '<', "full-input.txt") or die $!;

my $doubleDigitRe = qr/^[^\d]*(\d).*(\d)[^\d]*$/;
my $singleDigitRe = qr/^[^\d]*(\d)[^\d]*$/;

$accum = 0;
while (<FH>) {
    if ($_ =~ /${doubleDigitRe}/) {
        $accum += ($1.$2);
    } elsif (/${singleDigitRe}/) {
        $accum += ($1.$1);
    }
}

print $accum . "\n";

close(FH);