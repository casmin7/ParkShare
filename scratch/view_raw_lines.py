log_path = r"C:\Users\andre\.gemini\antigravity-ide\brain\9fcf64c0-2f8d-4159-9f2f-18b2e5c8159d\.system_generated\logs\transcript.jsonl"

steps = [1303, 1309, 1326, 1330, 1339]

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        for step in steps:
            if f'"step_index":{step}' in line or f'"step_index": {step}' in line:
                print(f"=== Step {step} ===")
                print(line[:1500])
                print("-" * 50)
