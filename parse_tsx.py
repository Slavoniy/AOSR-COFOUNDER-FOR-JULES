def find_matching_brace(lines, start_idx):
    braces_count = 0
    found_first = False
    for i in range(start_idx, len(lines)):
        for char in lines[i]:
            if char == '(':
                braces_count += 1
                found_first = True
            elif char == ')':
                braces_count -= 1

        if found_first and braces_count == 0:
            return i
    return -1

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if ") : subView === 'future-plan' ? (" in line:
        start_idx = i
        break

end_idx = find_matching_brace(lines, start_idx)
print(f"Starts at line {start_idx + 1}")
print(f"Ends at line {end_idx + 1}")
