import re

file_path = "src/hooks/useProjects.ts"
with open(file_path, "r") as f:
    content = f.read()

new_content = content.replace(
    """  useEffect(() => {
    if (isAuthenticated) {
      projectService.fetchMyProjects().then(setProjects);
    }
  }, [isAuthenticated]);""",
    """  useEffect(() => {
    if (isAuthenticated) {
      projectService.fetchMyProjects()
        .then(setProjects)
        .catch(err => {
          console.error("Failed to fetch projects:", err);
          setProjects([]); // Fallback
        });
    }
  }, [isAuthenticated]);"""
)

with open(file_path, "w") as f:
    f.write(new_content)

file_path2 = "src/modules/projects/application/projectService.ts"
with open(file_path2, "r") as f:
    content2 = f.read()

new_content2 = content2.replace(
    """  async fetchMyProjects(): Promise<Project[]> {
    const response = await fetch('/api/my-projects');
    if (!response.ok) throw new Error('Failed to fetch projects');
    this.projects = await response.json();
    return this.projects;
  }""",
    """  async fetchMyProjects(): Promise<Project[]> {
    const response = await fetch('/api/my-projects');
    if (!response.ok) throw new Error('Failed to fetch projects');
    try {
      this.projects = await response.json();
    } catch (err) {
      console.error('JSON parse error in fetchMyProjects:', err);
      this.projects = [];
    }
    return this.projects;
  }"""
)

with open(file_path2, "w") as f:
    f.write(new_content2)
