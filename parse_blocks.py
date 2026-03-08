import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I want to extract the `view === 'migration'` block and the `view === 'stack'` block.
# Let's just find their lines first.
lines = content.split('\n')
for i, line in enumerate(lines):
    if "view === 'migration' ?" in line:
        print(f"Migration starts at {i + 1}")
    elif "view === 'stack' ?" in line:
        print(f"Stack starts at {i + 1}")
