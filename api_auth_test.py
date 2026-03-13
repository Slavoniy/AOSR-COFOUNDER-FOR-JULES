from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()

    page = context.new_page()

    # 1. Register a user
    print("Registering...")
    response = context.request.post("http://localhost:3000/api/auth/register", data={
        "name": "Test User",
        "email": "test2@test.com",
        "password": "password123"
    })
    print(response.status, response.text())

    # 2. Go to the app, it should auto-login using the cookie
    print("Loading dashboard...")
    page.goto("http://localhost:3000/")
    page.wait_for_timeout(2000)
    page.screenshot(path="dashboard_api.png")

    browser.close()
