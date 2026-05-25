import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

log_file = r"C:\Users\andre\.gemini\antigravity-ide\brain\9fcf64c0-2f8d-4159-9f2f-18b2e5c8159d\.system_generated\logs\transcript.jsonl"
with open(log_file, "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        idx = data.get("step_index")
        content = data.get("content", "")
        if "def extrude_line_to_polygon" in content:
            print(f"Step {idx}: Found definition!")
            # Print the definition block from the content
            start = content.find("def extrude_line_to_polygon")
            print(content[start:start+1200])
            break
