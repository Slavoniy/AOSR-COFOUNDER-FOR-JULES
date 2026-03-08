with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

start_line = 1563 # 0-indexed: 1563 is `) : subView === 'future-plan' ? (`
end_line = 1946   # 0-indexed: 1946 is `</div>` right before `) : subView === 'certificates' ? (`

new_lines = lines[:start_line] + lines[end_line:]

with open('src/App.tsx', 'w') as f:
    f.writelines(new_lines)

print("Deleted future-plan block")
