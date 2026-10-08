/**
 * Language Boilerplate & Driver Code
 * ─────────────────────────────────────────────────────────────────────────────
 * Each language has:
 *  - driverCode  : the hidden boilerplate that wraps the user's solution
 *  - starterCode : the editable template shown in the editor (user writes this)
 *  - label       : display name
 *  - monacoLang  : Monaco editor language id
 *
 * ── Batch JSON Protocol ──────────────────────────────────────────────────────
 * All drivers read ONE JSON payload from stdin:
 *   { "testCases": [{ "args": [...], "expected": "..." }] }
 * And print ONE JSON response to stdout:
 *   { "results": [{ "passed": bool, "actual": "...", "error"?: "..." }] }
 *
 * This means the sandbox is invoked ONCE per run/submit (not once per test case).
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
const PYTHON_DRIVER = `import json, sys, time

# ── [USER CODE START] ──
{{USER_CODE}}
# ── [USER CODE END] ──

def _run_one(args, expected):
    try:
        t0 = time.time()
        result = solve(*args) if isinstance(args, list) else solve(args)
        elapsed = int((time.time() - t0) * 1000)
        actual = json.dumps(result, separators=(",", ":"))
        if not expected:
            return {"passed": True, "actual": actual, "execTimeMs": elapsed}
        try:
            exp_norm = json.dumps(json.loads(expected), separators=(",", ":"))
        except Exception:
            exp_norm = str(expected).strip()
        return {"passed": actual == exp_norm, "actual": actual, "execTimeMs": elapsed}
    except Exception as e:
        return {"passed": False, "actual": "", "error": str(e)}

def main():
    payload = json.loads(sys.stdin.read())
    results = [_run_one(tc["args"], tc.get("expected", "")) for tc in payload["testCases"]]
    print(json.dumps({"results": results}))

if __name__ == "__main__":
    main()
`;

const PYTHON_STARTER = `def solve(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`;

// ─── JavaScript ───────────────────────────────────────────────────────────────
const JS_DRIVER = `
// ── [USER CODE START] ──
{{USER_CODE}}
// ── [USER CODE END] ──

async function main() {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const payload = JSON.parse(Buffer.concat(chunks).toString());

    const results = payload.testCases.map(({ args, expected }) => {
        try {
            const t0 = Date.now();
            const result = solve(...args);
            const elapsed = Date.now() - t0;
            const actual = JSON.stringify(result);
            if (!expected) return { passed: true, actual, execTimeMs: elapsed };
            let expNorm;
            try { expNorm = JSON.stringify(JSON.parse(expected)); } catch { expNorm = String(expected).trim(); }
            return { passed: actual === expNorm, actual, execTimeMs: elapsed };
        } catch (e) {
            return { passed: false, actual: "", error: String(e.message || e) };
        }
    });

    console.log(JSON.stringify({ results }));
}

main().catch(e => { console.error(e.message); process.exit(1); });
`;

const JS_STARTER = `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solve(nums, target) {
    const seen = {};
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (seen[comp] !== undefined) return [seen[comp], i];
        seen[nums[i]] = i;
    }
    return [];
}
`;

// ─── C++ ─────────────────────────────────────────────────────────────────────
const CPP_DRIVER = `#include <bits/stdc++.h>
using namespace std;

// ── [USER CODE START] ──
{{USER_CODE}}
// ── [USER CODE END] ──

string toJsonArray(vector<int>& v) {
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

struct TC { vector<int> nums; int target; string expected; };

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    string raw((istreambuf_iterator<char>(cin)), istreambuf_iterator<char>());

    vector<TC> tcs;
    size_t pos = 0;
    while ((pos = raw.find("\\"args\\":", pos)) != string::npos) {
        pos += 8;
        int depth = 0; size_t start = pos;
        while (pos < raw.size()) {
            if (raw[pos]=='[') depth++;
            else if (raw[pos]==']') { depth--; if(!depth){pos++;break;} }
            pos++;
        }
        string argsJson = raw.substr(start, pos-start);
        string exp = "";
        size_t epos = raw.find("\\"expected\\":", pos);
        if (epos != string::npos && epos < raw.find("},", pos)) {
            epos += 12;
            size_t q1 = raw.find("\\"", epos), q2 = raw.find("\\"", q1+1);
            if (q1!=string::npos && q2!=string::npos) exp = raw.substr(q1+1, q2-q1-1);
        }
        TC tc; tc.expected = exp;
        size_t arrS = argsJson.find('[',1), arrE = argsJson.find(']',arrS);
        tc.nums = parseIntArray(argsJson.substr(arrS, arrE-arrS+1));
        size_t c = argsJson.find(',',arrE), cl = argsJson.rfind(']');
        tc.target = stoi(argsJson.substr(c+1, cl-c-1));
        tcs.push_back(tc);
    }

    cout << "{\\"results\\":[";
    Solution sol;
    for (int i = 0; i < (int)tcs.size(); i++) {
        auto& tc = tcs[i];
        auto res = sol.twoSum(tc.nums, tc.target);
        string actual = toJsonArray(res);
        string passed = (tc.expected.empty() || actual==tc.expected) ? "true":"false";
        cout << "{\\"passed\\":" << passed << ",\\"actual\\":\\"" << actual << "\\"}";
        if (i+1<(int)tcs.size()) cout << ",";
    }
    cout << "]}" << endl;
    return 0;
}
`;

const CPP_STARTER = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int,int> seen;
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

public class Solution {
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
        for (int i = 0; i < arr.length; i++) { sb.append(arr[i]); if(i+1<arr.length)sb.append(","); }
        return sb.append("]").toString();
    }
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line=br.readLine())!=null) sb.append(line);
        String raw = sb.toString();
        List<String> argsList=new ArrayList<>(), expList=new ArrayList<>();
        int pos=0;
        while(true){
            int ai=raw.indexOf("\\"args\\":",pos); if(ai<0)break; ai+=8;
            int depth=0,start=ai;
            while(ai<raw.length()){
                if(raw.charAt(ai)=='[')depth++;
                else if(raw.charAt(ai)==']'){depth--;if(depth==0){ai++;break;}}
                ai++;
            }
            argsList.add(raw.substring(start,ai));
            int ei=raw.indexOf("\\"expected\\":",ai); String exp="";
            if(ei>=0&&ei<raw.indexOf("}",ai)){
                ei+=12; int q1=raw.indexOf('"',ei),q2=raw.indexOf('"',q1+1);
                if(q1>=0&&q2>=0)exp=raw.substring(q1+1,q2);
            }
            expList.add(exp); pos=ai;
        }
        Solution sol=new Solution();
        StringBuilder out=new StringBuilder("{\\"results\\":[");
        for(int i=0;i<argsList.size();i++){
            String aj=argsList.get(i);
            int as=aj.indexOf('[',1),ae=aj.indexOf(']',as);
            int[]nums=parseIntArray(aj.substring(as,ae+1));
            int co=aj.indexOf(',',ae),cl=aj.lastIndexOf(']');
            int target=Integer.parseInt(aj.substring(co+1,cl).trim());
            int[]res=sol.twoSum(nums,target);
            String actual=toJson(res),ex=expList.get(i);
            boolean passed=ex.isEmpty()||actual.equals(ex);
            out.append("{\\"passed\\":").append(passed).append(",\\"actual\\":\\"").append(actual).append("\\"}");
            if(i+1<argsList.size())out.append(",");
        }
        System.out.println(out.append("]}"));
    }
}
`;

const JAVA_STARTER = `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer,Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (seen.containsKey(comp)) return new int[]{seen.get(comp), i};
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}
`;

// ─── Registry ─────────────────────────────────────────────────────────────────

export const LANGUAGE_BOILERPLATES: Record<SupportedLanguage, LanguageBoilerplate> = {
  python: {
    label: "Python 3.12",
    monacoLang: "python",
    starterCode: PYTHON_STARTER,
    driverCode: PYTHON_DRIVER.replace("{{USER_CODE}}", "# (user code goes here)"),
    buildFullCode: (userCode) => PYTHON_DRIVER.replace("{{USER_CODE}}", userCode),
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
