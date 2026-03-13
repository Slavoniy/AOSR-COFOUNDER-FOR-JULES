from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()

    # 1. Register a user directly via UI to see what fails
    page = context.new_page()
    page.goto("http://localhost:3000/")

    # click Регистрация
    page.get_by_role("button", name="Регистрация").first.click()
    page.wait_for_timeout(1000)
    page.screenshot(path="auth_before_fill.png")

    # fill forms
    print("filling...")
    page.fill("input[name='name']", "Иван Иванов")
    page.fill("input[name='email']", "ivan2@stroydoc.ai")
    page.fill("input[name='password']", "password123")

    page.get_by_role("button", name="Зарегистрироваться").click()
    print("clicked register")
    page.wait_for_timeout(3000)
    page.screenshot(path="dashboard_after_ui_reg.png")

    browser.close()
