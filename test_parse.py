with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

def find_paren_end(lines, start_line_idx):
    level = 0
    in_str = False
    str_char = ''

    # Fast forward to the first '(' on the start_line
    line_str = lines[start_line_idx]
    start_col = line_str.find('(')
    if start_col == -1: return -1

    for r in range(start_line_idx, len(lines)):
        line = lines[r]
        c = start_col if r == start_line_idx else 0
        while c < len(line):
            char = line[c]

            if char in ("'", '"', "`"):
                if not in_str:
                    in_str = True
                    str_char = char
                elif str_char == char:
                    # check for escape
                    if c > 0 and line[c-1] != '\\':
                        in_str = False

            if not in_str:
                if char == '(':
                    level += 1
                elif char == ')':
                    level -= 1
                    if level == 0:
                        return r
            c += 1
    return -1

for i, line in enumerate(lines):
    if "subView === 'future-plan'" in line:
        start_idx = i
        break

print(f"Starts at line {start_idx + 1}")
end_idx = find_paren_end(lines, start_idx)
print(f"Ends at line {end_idx + 1}")
