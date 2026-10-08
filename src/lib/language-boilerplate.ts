/**
 * Language Boilerplate & Driver Code
 * ─────────────────────────────────────────────────────────────────────────────
 * Each language has:
 *  - driverCode  : the hidden boilerplate that wraps the user's solution
 *  - starterCode : the editable template shown in the editor (user writes this)
 *  - label       : display name
 *  - monacoLang  : Monaco editor language id
 */

export type SupportedLanguage = "python" | "cpp" | "java" | "javascript";

export interface LanguageBoilerplate {
  label: string;
  monacoLang: string;
  starterCode: string;
  driverCode: string;
  /** Returns the full code to be compiled/executed: driverCode with USER_CODE placeholder replaced */
  buildFullCode: (userCode: string) => string;
}

// ─── Python ──────────────────────────────────────────────────────────────────
const PYTHON_DRIVER = `import json, sys, inspect

# ── [USER CODE START] ──
{{USER_CODE}}
# ── [USER CODE END] ──

def _parse_input(raw: str):
    lines = [l.strip() for l in raw.strip().split('\\n') if l.strip()]
    args = []
    for line in lines:
        try:
            args.append(json.loads(line))
        except Exception:
            args.append(line)
    return args

def _invoke(fn, args):
    sig = inspect.signature(fn)
    n = len(list(sig.parameters))
    if n == 0: return fn()
    if n == 1:
        if not args:
            raise ValueError("No input provided for the solution function.")
        if len(args) >= 2:
            d = {}
            names = ["nums","target","s","n","k","root","head","grid","matrix","intervals"]
            for i,v in enumerate(args):
                d[names[i] if i < len(names) else f"arg{i}"] = v
                d[i] = v
            try: return fn(d)
            except: pass
        try: return fn(args)
        except: pass
        return fn(args[0])
    if len(args) < n:
        raise ValueError(f"Expected {n} input values, received {len(args)}.")
    return fn(*args[:n])

def main():
    raw = sys.stdin.read()
    args = _parse_input(raw)
    res = None
    if 'Solution' in globals() and inspect.isclass(Solution):
        sol = Solution()
        methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol,m))]
        if methods:
            fn = getattr(sol, methods[0])
            res = _invoke(fn, args)
    if res is None:
        for name in ['solve','solution','twoSum','maxProfit','longestCommonSubsequence']:
            if name in globals() and callable(globals()[name]):
                res = _invoke(globals()[name], args)
                break
    if res is not None:
        if isinstance(res, (dict, list, bool, int, float)):
            print(json.dumps(res))
        else:
            print(str(res))

if __name__ == '__main__':
    main()
`;

const PYTHON_STARTER = `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []
`;

// ─── C++ ─────────────────────────────────────────────────────────────────────
const CPP_DRIVER = `#include <bits/stdc++.h>
using namespace std;

// ── [USER CODE START] ──
{{USER_CODE}}
// ── [USER CODE END] ──

// ── Driver: reads input line-by-line, calls Solution, prints JSON output ──
string toJson(vector<int>& v) {
    string s = "[";
    for (int i = 0; i < (int)v.size(); i++) {
        s += to_string(v[i]);
        if (i + 1 < (int)v.size()) s += ",";
    }
    return s + "]";
}

vector<int> parseIntArray(const string& s) {
    vector<int> v;
    string clean;
    for (char c : s) if (c != '[' && c != ']' && c != ' ') clean += c;
    istringstream ss(clean);
    string tok;
    while (getline(ss, tok, ',')) if (!tok.empty()) v.push_back(stoi(tok));
    return v;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string line1, line2;
    if (!getline(cin, line1)) return 0;
    getline(cin, line2);

    vector<int> nums = parseIntArray(line1);
    int target = stoi(line2);

    Solution sol;
    auto result = sol.twoSum(nums, target);
    cout << toJson(result) << endl;
    return 0;
}
`;

const CPP_STARTER = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            int comp = target - nums[i];
            if (seen.count(comp)) return {seen[comp], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};
`;

// ─── Java ─────────────────────────────────────────────────────────────────────
const JAVA_DRIVER = `import java.util.*;
import java.io.*;

// ── [USER CODE START] ──
{{USER_CODE}}
// ── [USER CODE END] ──

public class Main {
    static int[] parseIntArray(String s) {
        s = s.trim().replaceAll("[\\\\[\\\\]\\\\s]", "");
        if (s.isEmpty()) return new int[0];
        String[] parts = s.split(",");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) arr[i] = Integer.parseInt(parts[i].trim());
        return arr;
    }

    static String toJson(int[] arr) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            sb.append(arr[i]);
            if (i + 1 < arr.length) sb.append(",");
        }
        return sb.append("]").toString();
    }

    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine();
        String line2 = br.readLine();

        int[] nums = parseIntArray(line1);
        int target = Integer.parseInt(line2.trim());

        Solution sol = new Solution();
        int[] result = sol.twoSum(nums, target);
        System.out.println(toJson(result));
    }
}
`;

const JAVA_STARTER = `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (seen.containsKey(comp)) return new int[]{seen.get(comp), i};
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}
`;

// ─── JavaScript ───────────────────────────────────────────────────────────────
const JS_DRIVER = `const readline = require('readline');

// ── [USER CODE START] ──
{{USER_CODE}}
// ── [USER CODE END] ──

async function main() {
    const rl = readline.createInterface({ input: process.stdin });
    const lines = [];
    for await (const line of rl) {
        const trimmed = line.trim();
        if (trimmed) lines.push(trimmed);
    }

    const args = lines.map(l => {
        try { return JSON.parse(l); } catch { return l; }
    });

    let res = null;
    if (typeof Solution === 'function') {
        const sol = new Solution();
        const proto = Object.getPrototypeOf(sol);
        const methods = Object.getOwnPropertyNames(proto)
            .filter(m => m !== 'constructor' && typeof sol[m] === 'function');
        if (methods.length > 0) {
            const fn = (...a) => sol[methods[0]](...a);
            res = args.length >= fn.length ? fn(...args) : fn(args);
        }
    }
    if (res === null) {
        // User functions are module-scoped in Node, not properties of global.
        // Resolve the known entry points lexically so starter code such as
        // A function twoSum(...) starter is actually invoked.
        const candidates = [];
        if (typeof twoSum === 'function') candidates.push(twoSum);
        if (typeof solve === 'function') candidates.push(solve);
        if (typeof solution === 'function') candidates.push(solution);
        if (typeof maxProfit === 'function') candidates.push(maxProfit);
        if (candidates.length === 0) throw new Error('No supported solution function found.');
        res = candidates[0](...args);
    }
    if (res === null || res === undefined) throw new Error('Solution returned no output.');
    console.log(typeof res === 'object' ? JSON.stringify(res) : String(res));
}

main().catch(e => { console.error(e.message); process.exit(1); });
`;

const JS_STARTER = `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    const seen = {};
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (seen[comp] !== undefined) return [seen[comp], i];
        seen[nums[i]] = i;
    }
    return [];
}
`;

// ─── Registry ─────────────────────────────────────────────────────────────────

const SIMPLE_PYTHON_DRIVER = `import json, sys

{{USER_CODE}}

def main():
    values = []
    for line in sys.stdin:
        line = line.strip()
        if line:
            values.append(json.loads(line))

    if "solve" not in globals():
        raise RuntimeError("Define a solve(...) function in the editor.")

    result = solve(*values)
    print(json.dumps(result, separators=(",", ":")))

if __name__ == "__main__":
    main()
`;

const SIMPLE_PYTHON_STARTER = `def solve(nums, target):
    seen = {}
    for i, value in enumerate(nums):
        complement = target - value
        if complement in seen:
            return [seen[complement], i]
        seen[value] = i
    return []
`;

export const LANGUAGE_BOILERPLATES: Record<SupportedLanguage, LanguageBoilerplate> = {
  python: {
    label: "Python 3.12",
    monacoLang: "python",
    starterCode: SIMPLE_PYTHON_STARTER,
    // Keep the marker so database-stored templates can inject the submitted code.
    driverCode: SIMPLE_PYTHON_DRIVER,
    buildFullCode: (userCode) => SIMPLE_PYTHON_DRIVER.replace("{{USER_CODE}}", userCode),
  },
  cpp: {
    label: "C++ 17",
    monacoLang: "cpp",
    starterCode: CPP_STARTER,
    driverCode: CPP_DRIVER.replace("{{USER_CODE}}", "// (user code goes here)"),
    buildFullCode: (userCode) => CPP_DRIVER.replace("{{USER_CODE}}", userCode),
  },
  java: {
    label: "Java 21",
    monacoLang: "java",
    starterCode: JAVA_STARTER,
    driverCode: JAVA_DRIVER.replace("{{USER_CODE}}", "// (user code goes here)"),
    buildFullCode: (userCode) => JAVA_DRIVER.replace("{{USER_CODE}}", userCode),
  },
  javascript: {
    label: "JavaScript (Node 20)",
    monacoLang: "javascript",
    starterCode: JS_STARTER,
    driverCode: JS_DRIVER.replace("{{USER_CODE}}", "// (user code goes here)"),
    buildFullCode: (userCode) => JS_DRIVER.replace("{{USER_CODE}}", userCode),
  },
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_BOILERPLATES) as SupportedLanguage[];
