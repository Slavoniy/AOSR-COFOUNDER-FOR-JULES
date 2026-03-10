import re

file_path = "src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

# I messed up `App.tsx` by replacing the `return (` block but ignoring the navigation header!
# The original App.tsx had a nice navigation bar.
# Let's restore the navigation bar for `PublicApp` at least.

# Find where `const PublicApp = () => {` starts
public_app_idx = content.find("  const PublicApp = () => {")

if public_app_idx != -1:
    new_public_app = """
  const PublicApp = () => {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 pb-24">
        {/* Navigation Bar */}
        <div className="max-w-6xl w-full flex justify-between items-center mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer" onClick={() => setView('home')}>
            <HardHat className="w-6 h-6 text-blue-600" />
            <span>StroyDoc AI</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setAuthMode('login');
                setView('auth');
              }}
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              Вход
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setView('auth');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Регистрация
            </button>
          </div>
        </div>

        {/* Content View */}
        {view === 'mvp' ? (
          <MVPView setView={setView} vector={vectors[2]} />
        ) : view === 'auth' ? (
          <AuthView
            authMode={authMode}
            setAuthMode={setAuthMode}
            setView={setView}
            handleLogin={handleLogin}
            handleRegister={handleRegister}
          />
        ) : (
          <HomeView onSelectVector={(id) => {
            if (id === 3) setView('mvp');
            else alert('Этот вектор пока недоступен');
          }} selectedVector={null} />
        )}
      </div>
    );
  };
"""
    # Replace the existing PublicApp definition
    # Need to locate the end of the existing PublicApp block
    # It ends right before `  return (`

    end_public_app_idx = content.find("  return (", public_app_idx)

    content = content[:public_app_idx] + new_public_app + "\n" + content[end_public_app_idx:]

    with open(file_path, "w") as f:
        f.write(content)
