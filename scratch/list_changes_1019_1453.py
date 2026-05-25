import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

log_file = r"C:\Users\andre\.gemini\antigravity-ide\brain\9fcf64c0-2f8d-4159-9f2f-18b2e5c8159d\.system_generated\logs\transcript.jsonl"
with open(log_file, "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        idx = data.get("step_index")
        if idx is not None and 1019 <= idx < 1453:
            source = data.get("source")
            type_ = data.get("type")
            tool_calls = data.get("tool_calls")
            if source == "MODEL" and type_ == "PLANNER_RESPONSE" and tool_calls:
                for tc in tool_calls:
                    name = tc.get("name")
                    if name in ("replace_file_content", "write_to_file", "multi_replace_file_content", "run_command"):
                        args = tc.get("args", {})
                        cmd = args.get("CommandLine", "") if name == "run_command" else args.get("TargetFile", "")
                        print(f"[{idx}] {name}: {cmd or args}")
