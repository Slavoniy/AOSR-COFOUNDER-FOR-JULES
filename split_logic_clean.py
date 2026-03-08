with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

migration_idx = 1282
stack_idx = 1416
mvp_idx = 1546  # This is where `) : (` starts for MVPView
future_plan_idx = 1563 # `) : subView === 'future-plan' ? (`
cert_idx = 1946 # `) : subView === 'certificates' ? (`

# Content of `future-plan` starts after 1563 and ends right before 1946
future_plan_content = lines[1564:1946]

# Remove the trailing closing tag of the `future-plan` div which was `</div>` at 1945
# Let's inspect the last few lines of `future_plan_content` to be safe.
# Actually, the div starting at 1564 is `<div className="space-y-12 pb-20">`
# and it is closed right before `) : subView === 'certificates' ? (`.

new_combined_view = []
new_combined_view.append("        ) : view === 'migration' || view === 'stack' ? (\n")
new_combined_view.append("""          <motion.div
            key={view === 'migration' ? 'migration' : 'stack'}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-5xl w-full space-y-8 mt-8"
          >
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к выбору вектора
            </button>
""")
new_combined_view.extend(future_plan_content)
new_combined_view.append("          </motion.div>\n")

# To prevent JSX nesting issues, we must carefully place `new_combined_view` into `lines`.
# Replace `lines[1282:1546]` with `new_combined_view`.
# And then we MUST DELETE `lines[1563:1946]`.
# BUT, we need to adjust the indices because deleting modifies line numbers.

new_lines = lines[:future_plan_idx] + lines[cert_idx:]
new_lines = new_lines[:migration_idx] + new_combined_view + new_lines[mvp_idx:]

with open('src/App.tsx', 'w') as f:
    f.writelines(new_lines)

print("Applied changes.")
