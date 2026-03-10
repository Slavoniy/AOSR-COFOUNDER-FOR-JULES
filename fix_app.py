import re

file_path = "src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Ah! `AuthView` expects `onLogin` and `onRegister`!
# Look at `AuthView.tsx`:
# interface AuthViewProps {
#   onLogin: (e: React.FormEvent) => Promise<void>;
#   onRegister: (e: React.FormEvent) => Promise<void>;
# }
# But in `App.tsx` I passed `handleLogin={handleLogin}` which is completely ignored!
# Because the prop is named `onLogin`.

content = content.replace("handleLogin={handleLogin}", "onLogin={handleLogin}")
content = content.replace("handleRegister={handleRegister}", "onRegister={handleRegister}")

with open(file_path, "w") as f:
    f.write(content)
