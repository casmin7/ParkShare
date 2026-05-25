import json

log_path = r"C:\Users\andre\.gemini\antigravity-ide\brain\9fcf64c0-2f8d-4159-9f2f-18b2e5c8159d\.system_generated\logs\transcript.jsonl"

steps = [1303, 1326]

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        step_index = data.get('step_index')
        if step_index in steps:
            print(f"=== Step {step_index} ===")
            tool_calls = data.get('tool_calls', [])
            for tc in tool_calls:
                name = tc.get('name')
                args = tc.get('args', {})
                # args is a dict since data is from json.loads
                # Let's inspect ReplacementChunks
                chunks = args.get('ReplacementChunks')
                print(f"chunks type: {type(chunks)}")
                print(f"chunks repr: {repr(chunks)[:200]}")
                if isinstance(chunks, str):
                    try:
                        parsed = json.loads(chunks)
                        print(f"parsed type: {type(parsed)}")
                        chunks = parsed
                    except Exception as e:
                        print(f"JSON load failed: {e}")
                
                if isinstance(chunks, list):
                    for idx, chunk in enumerate(chunks):
                        print(f"  Chunk {idx}:")
                        print(f"    StartLine: {chunk.get('StartLine')}, EndLine: {chunk.get('EndLine')}")
                        print(f"    TargetContent:\n{chunk.get('TargetContent')}")
                        print(f"    ReplacementContent:\n{chunk.get('ReplacementContent')}")
                        print("-" * 40)
