with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

# Line 1681 has two `</motion.div>`.
# Wait, `future_plan_content` already ended with `</div></div></div></div>` at line 1679.
# Then I added `</motion.div>` in `new_combined_view.append("          </motion.div>\n")`.
# Let's remove ONE of the `</motion.div>` on line 1680 or 1681.

if "          </motion.div>\n" in lines[1680]:
    del lines[1680]
elif "          </motion.div>\n" in lines[1679]:
    del lines[1679]

with open('src/App.tsx', 'w') as f:
    f.writelines(lines)
print("Deleted extra motion.div closing")
