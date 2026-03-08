import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix handleStart logic
search = """    } else if (selectedVector === 6 || selectedVector === 7) {
      setView('mvp');
      setSubView('future-plan');"""
replace = """    } else if (selectedVector === 6) {
      setView('migration');
    } else if (selectedVector === 7) {
      setView('stack');"""

content = content.replace(search, replace)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Replaced handleStart logic")
