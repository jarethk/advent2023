import java.lang.String;
import java.io.*;
import java.util.*;
import java.util.regex.*;

/**
 * Part1
 */
public class Part1 {

    //private static final String INPUT_FILE = "sample-input.txt";
    private static final String INPUT_FILE = "full-input.txt";
    private static final Pattern digits = Pattern.compile("(\\d)");
    private static final boolean DEBUG = false;

    public Part1() {
        super();
        // no-op
    }

    public static void main(String[] args) {
        int sum = 0;

        try (BufferedReader reader = new BufferedReader(new FileReader(INPUT_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (DEBUG) System.out.println(line);
                Matcher matcher = digits.matcher(line);
                List<String> matches = new ArrayList<>();
                while (matcher.find()) {
                    matches.add(matcher.group());
                }
                String myValue = matches.get(0) + matches.get(matches.size()-1);
                sum += Integer.parseInt(myValue);
            }
            System.out.println("Final sum: " + sum);
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }
    }
}