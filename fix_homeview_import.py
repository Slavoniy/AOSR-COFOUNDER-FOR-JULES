import re

file_path = "src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Make sure HomeView is imported correctly
if "import { HomeView } from './components/views/HomeView';" not in content:
    content = content.replace(
        "import { AuthView } from './components/views/AuthView';",
        "import { AuthView } from './components/views/AuthView';\nimport { HomeView } from './components/views/HomeView';"
    )
    with open(file_path, "w") as f:
        f.write(content)
