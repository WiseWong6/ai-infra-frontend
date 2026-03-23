import json

log_path = "/Users/wisewong/.gemini/antigravity/brain/41628f3b-2330-41fe-b037-879706eb46c3/.system_generated/logs/overview.txt"
try:
    with open(log_path, 'r') as f:
        lines = f.readlines()

    for line in lines:
        if "multi_replace_file_content" in line and "frontend-app-config.html" in line:
            data = json.loads(line)
            if data["step_index"] == 225:
                args = data["tool_calls"][0]["args"]
                chunks = json.loads(args["ReplacementChunks"])
                for i, chunk in enumerate(chunks):
                    with open(f"chunk_{i}.txt", 'w') as outf:
                        outf.write(chunk["TargetContent"])
                break
except Exception as e:
    print(e)
