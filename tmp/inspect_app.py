import re

with open('/tmp/bundle.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Find strings in backticks
backticks = re.findall(r'`([^`\$\\]{3,50})`', text)
print("Backtick phrases total:", len(backticks))
interesting = [b for b in set(backticks) if any(w in b.lower() for w in ['drishti', 'vision', 'camera', 'voice', 'translate', 'nav', 'mode', 'speech', 'obstacle', 'scene', 'document', 'currency', 'sign', 'safety'])]
for item in sorted(interesting):
    print(" -", item)
