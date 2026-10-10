# Problem Title Here

**Difficulty:** Easy / Medium / Hard
**Time Limit:** 2000 ms
**Memory Limit:** 256 MB
**Tags:** Array, Math, String (comma separated)
**Parameters Count:** 1
**Parameters Names:** nums (comma separated)

---

## Problem Description
Provide a clear and concise description of the problem here. 

Explain what the input is, what the expected output is, and any specific rules or conditions that apply.

### Example 1:
**Input:** `nums = [1, 5, 3, 9, 2]`  
**Output:** `9`  
**Explanation:** (Optional) Explain why the output is 9.

### Example 2:
**Input:** `nums = [-10, -3, -5, -1]`  
**Output:** `-1`  
**Explanation:** (Optional) Explain why the output is -1.

### Constraints:
* `1 <= nums.length <= 10^4`
* `-10^4 <= nums[i] <= 10^4`

---

## Test Cases

*Note: In the Admin Panel, you will input these as raw JSON or via the visual builder.*

| Hidden? | Input Args (JSON Array) | Expected Output (String) |
| :--- | :--- | :--- |
| False | `[[1, 5, 3, 9, 2]]` | `"9"` |
| False | `[[-10, -3, -5, -1]]` | `"-1"` |
| True | `[[0]]` | `"0"` |

---

## Driver Codes & Templates

### Python 3
**Initial Code (shown to user):**
```python
def find_largest(nums):
    # Write your code here
    pass
```
**Driver Code:**
```python
import sys
import json

# ── [USER CODE START] ──
{{USER_CODE}}
# ── [USER CODE END] ──

def run_all_test_cases():
    input_data = sys.stdin.read().strip()
    if not input_data:
        return
        
    payload = json.loads(input_data)
    test_cases = payload.get("testCases", [])
    
    results = []
    for tc in test_cases:
        args = tc.get("args", [])
        expected = tc.get("expected", "")
        
        # Call the user function
        actual = find_largest(*args)
        
        # Format the actual output to match expected string format
        actual_str = json.dumps(actual).replace(" ", "")
        passed = (actual_str == expected)
        
        results.append({
            "passed": passed,
            "actual": actual_str
        })
        
    print(json.dumps({"results": results}))

if __name__ == "__main__":
    run_all_test_cases()
```

### JavaScript / Node.js
**Initial Code (shown to user):**
```javascript
function findLargest(nums) {
    // Write your code here
}
```
**Driver Code:**
```javascript
const fs = require('fs');

// ── [USER CODE START] ──
{{USER_CODE}}
// ── [USER CODE END] ──

function runAllTestCases() {
    const inputData = fs.readFileSync(0, 'utf-8').trim();
    if (!inputData) return;
    
    const payload = JSON.parse(inputData);
    const testCases = payload.testCases || [];
    
    const results = testCases.map(tc => {
        const args = tc.args || [];
        const expected = tc.expected || "";
        
        // Call the user function
        const actual = findLargest(...args);
        
        // Format the actual output
        const actualStr = JSON.stringify(actual);
        const passed = (actualStr === expected);
        
        return {
            passed: passed,
            actual: actualStr
        };
    });
    
    console.log(JSON.stringify({ results }));
}

runAllTestCases();
```

### C++
**Initial Code (shown to user):**
```cpp
class Solution {
public:
    int findLargest(vector<int>& nums) {
        // Write your code here
        return 0;
    }
};
```
**Driver Code:**
*(Replace the parsing logic below depending on the specific input shape of your problem. This template assumes an array of integers `[[...]]` as the single argument).*
```cpp
#include <bits/stdc++.h>
using namespace std;

// ── [USER CODE START] ──
{{USER_CODE}}
// ── [USER CODE END] ──

void parseAndRun() {
    string json;
    string line;
    while(getline(cin, line)) json += line;
    
    cout << "{\"results\":[";
    
    int pos = 0;
    bool first = true;
    while ((pos = json.find("\"args\":[", pos)) != string::npos) {
        pos += 8;
        
        // Extract the nums array
        int arrStart = json.find("[", pos);
        int arrEnd = json.find("]", arrStart);
        string arrStr = json.substr(arrStart + 1, arrEnd - arrStart - 1);
        
        vector<int> nums;
        istringstream ss(arrStr);
        string token;
        while(getline(ss, token, ',')) {
            if(!token.empty()) nums.push_back(stoi(token));
        }
        
        // Extract expected output
        int expectedStart = json.find("\"expected\":\"", arrEnd);
        expectedStart += 12;
        int expectedEnd = json.find("\"", expectedStart);
        string expectedStr = json.substr(expectedStart, expectedEnd - expectedStart);
        
        // Run solution
        Solution sol;
        int act = sol.findLargest(nums);
        string actStr = to_string(act);
        
        bool passed = (actStr == expectedStr);
        
        if(!first) cout << ",";
        cout << "{\"passed\":" << (passed ? "true" : "false") << ",\"actual\":\"" << actStr << "\"}";
        first = false;
        
        pos = expectedEnd;
    }
    cout << "]}" << endl;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    parseAndRun();
    return 0;
}
```

### Java
**Initial Code (shown to user):**
```java
class Solution {
    public int findLargest(int[] nums) {
        // Write your code here
        return 0;
    }
}
```
**Driver Code:**
*(Replace the parsing logic below depending on the specific input shape of your problem).*
```java
import java.util.*;
import java.io.*;

// ── [USER CODE START] ──
{{USER_CODE}}
// ── [USER CODE END] ──

class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        
        while ((line = br.readLine()) != null) {
            sb.append(line);
        }
        String json = sb.toString();

        System.out.print("{\"results\":[");
        
        int pos = 0;
        boolean first = true;
        
        while ((pos = json.indexOf("\"args\":[", pos)) != -1) {
            pos += 8;
            
            // Extract the nums array
            int arrStart = json.indexOf("[", pos);
            int arrEnd = json.indexOf("]", arrStart);
            String arrStr = json.substring(arrStart + 1, arrEnd).trim();
            
            int[] nums = new int[0];
            if (!arrStr.isEmpty()) {
                String[] parts = arrStr.split(",");
                nums = new int[parts.length];
                for (int i = 0; i < parts.length; i++) {
                    nums[i] = Integer.parseInt(parts[i].trim());
                }
            }
            
            // Extract expected output
            int expectedStart = json.indexOf("\"expected\":\"", arrEnd);
            expectedStart += 12;
            int expectedEnd = json.indexOf("\"", expectedStart);
            String expectedStr = json.substring(expectedStart, expectedEnd);
            
            // Run solution
            Solution sol = new Solution();
            int act = sol.findLargest(nums);
            String actStr = String.valueOf(act);
            
            boolean passed = actStr.equals(expectedStr);
            
            if (!first) System.out.print(",");
            System.out.print("{\"passed\":" + (passed ? "true" : "false") + ",\"actual\":\"" + actStr + "\"}");
            first = false;
            
            pos = expectedEnd;
        }
        System.out.println("]}");
    }
}
```
