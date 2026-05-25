import subprocess
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

def main():
    result = subprocess.run(
        ["git", "diff", "app.js"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=r"c:\Users\andre\OneDrive\Desktop\Folder nou\ParkShare",
        text=True,
        encoding="utf-8"
    )
    lines = result.stdout.splitlines()
    for line in lines:
        if len(re.findall(r'"lat":\s*\d+\.\d+', line)) > 2:
            continue
        if len(line) > 300:
            print(line[:300] + " ... [TRUNCATED LINE]")
        else:
            print(line)

if __name__ == "__main__":
    main()
