with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "subView === 'future-plan'" in line:
        print(f"future-plan starts at {i + 1}")
    if "subView === 'certificates'" in line:
        print(f"certificates starts at {i + 1}")
