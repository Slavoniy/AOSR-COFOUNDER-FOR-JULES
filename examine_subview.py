with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if ") : subView === 'future-plan' ? (" in line:
        start_idx = i
        break

print(f"Starts at line {start_idx + 1}")

braces_count = 0
for i in range(start_idx, len(lines)):
    line = lines[i]
    braces_count += line.count('(')
    braces_count -= line.count(')')
    if braces_count < 0:
        print(f"Ends at line {i + 1}")
        break
