import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

log_file = r"C:\Users\andre\.gemini\antigravity-ide\brain\9fcf64c0-2f8d-4159-9f2f-18b2e5c8159d\.system_generated\logs\transcript.jsonl"
with open(log_file, "r", encoding="utf-8") as f:
    lines = f.readlines()
    print(f"Total lines in log: {len(lines)}")
    for line in lines[-20:]:
        data = json.loads(line)
        idx = data.get("step_index")
        source = data.get("source")
        type_ = data.get("type")
        status = data.get("status")
        content = data.get("content")
        print(f"[{idx}] {source} {type_} ({status})")
        if content:
            print(f"  Content: {content.strip().replace('\n', ' ')[:300]}")
