import json

log_path = r"C:\Users\andre\.gemini\antigravity-ide\brain\9fcf64c0-2f8d-4159-9f2f-18b2e5c8159d\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        step_index = data.get('step_index')
        if step_index == 918:
            tool_calls = data.get('tool_calls', [])
            for tc in tool_calls:
                args = tc.get('args', {})
                content = args.get('CodeContent')
                print("Length:", len(content))
                print("End of content:", repr(content[-100:]))
