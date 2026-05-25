import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

log_file = r"C:\Users\andre\.gemini\antigravity-ide\brain\9fcf64c0-2f8d-4159-9f2f-18b2e5c8159d\.system_generated\logs\transcript.jsonl"
with open(log_file, "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        idx = data.get("step_index")
        if idx is not None and 1019 <= idx < 1250:
            source = data.get("source")
            type_ = data.get("type")
            content = data.get("content")
            tool_calls = data.get("tool_calls")
            if source == "USER_EXPLICIT" or (source == "MODEL" and type_ in ("PLANNER_RESPONSE", "REPLACE_FILE_CONTENT", "WRITE_TO_FILE", "MULTI_REPLACE_FILE_CONTENT")):
                print(f"[{idx}] {source} {type_}")
                if content:
                    print(f"  Content: {content.strip().replace('\n', ' ')[:300]}")
                if tool_calls:
                    print(f"  Tool calls: {json.dumps(tool_calls)[:300]}")
