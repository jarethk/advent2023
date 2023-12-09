import static java.util.Map.entry;

import java.lang.String;
import java.io.*;
import java.util.*;
import java.util.regex.*;

/**
 * Part1
 */
public class Part2 {

    //private static final String INPUT_FILE = "sample-input.txt";
    private static final String INPUT_FILE = "full-input.txt";
    private static final Pattern twoDigits = Pattern.compile(".*?(\\d|one|two|three|four|five|six|seven|eight|nine).*(\\d|one|two|three|four|five|six|seven|eight|nine).*?");
    private static final Pattern oneDigits = Pattern.compile(".*?(\\d|one|two|three|four|five|six|seven|eight|nine).*?");
    private static final boolean DEBUG = false;

    private static final Map<String, String> NUM_MAP = Map.ofEntries(
        entry("one", "1"),
        entry("two", "2"),
        entry("three", "3"),
        entry("four", "4"),
        entry("five", "5"),
        entry("six", "6"),
        entry("seven", "7"),
        entry("eight", "8"),
        entry("nine", "9"),
        entry("1", "1"),
        entry("2", "2"),
        entry("3", "3"),
        entry("4", "4"),
        entry("5", "5"),
        entry("6", "6"),
        entry("7", "7"),
        entry("8", "8"),
        entry("9", "9")
    );

    public Part2() {
        super();
        // no-op
    }

    public static void main(String[] args) {
        int sum = 0;
        int lineNum = 0;
        try (BufferedReader reader = new BufferedReader(new FileReader(INPUT_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (DEBUG) System.out.println(line);
                String myValue = null;
                lineNum++;
                Matcher tdMatcher = twoDigits.matcher(line);
                if (tdMatcher.matches()) {
                    myValue = NUM_MAP.get(tdMatcher.group(1)) + NUM_MAP.get(tdMatcher.group(2));
                } else {
                    Matcher oneMatcher = oneDigits.matcher(line);
                    if (oneMatcher.matches()) {
                        myValue = NUM_MAP.get(oneMatcher.group(1)) + NUM_MAP.get(oneMatcher.group(1));
                    }
                }
                System.out.println(myValue + " for line " + lineNum);
                sum += Integer.parseInt(myValue);
            }
            System.out.println("Final sum: " + sum);
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }
    }
}