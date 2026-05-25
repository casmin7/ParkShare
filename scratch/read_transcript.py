import json

log_path = r"C:\Users\andre\.gemini\antigravity-ide\brain\9fcf64c0-2f8d-4159-9f2f-18b2e5c8159d\.system_generated\logs\transcript.jsonl"

files_to_track = [
    "app.js", "index.html", "fetch_s4_real_data.py", "extract_mock.py", "mock_1000.json"
]

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        step_index = data.get('step_index')
        tool_calls = data.get('tool_calls', [])
        for tc in tool_calls:
            name = tc.get('name')
            if name in ['write_to_file', 'replace_file_content', 'multi_replace_file_content']:
                args = tc.get('args', {})
                target = args.get('TargetFile') or args.get('targetFile') or ""
                # check if any of tracked files is in target path
                matched = any(f in target for f in files_to_track)
                if matched:
                    print(f"Step {step_index}: {name} on {target.split('/')[-1].split('\\')[-1]}")
