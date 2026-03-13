from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()

    # 1. Register user via API (so they exist and are logged in)
    print("Registering/Logging in...")
    try:
        response = context.request.post("http://localhost:3000/api/auth/register", data={
            "name": "Ivan Ivanov",
            "email": "ivan.auth@stroydoc.ai",
            "password": "password123"
        })
    except:
        pass # maybe already registered

    response = context.request.post("http://localhost:3000/api/auth/login", data={
        "email": "ivan.auth@stroydoc.ai",
        "password": "password123"
    })

    # Wait for the token cookie to be set on context
    page = context.new_page()
    page.goto("http://localhost:3000/dashboard/objects")

    print("Creating object...")
    # Click "Создать объект"
    page.get_by_role("button", name="Создать объект").first.click()
    page.wait_for_timeout(500)

    # Fill in the form
    page.locator("input[placeholder=\"Например: Жилой комплекс 'Звездный'\"]").fill("Test Object")
    page.locator("input[placeholder=\"Например: г. Москва, ул. Ленина, д. 1\"]").fill("Test Address")

    # Click "Создать" in the modal
    page.get_by_role("button", name="Создать").click()

    print("Waiting for navigation to object page...")
    page.wait_for_timeout(2000)

    # Should now be on /dashboard/objects/[id]
    print(f"Current URL: {page.url}")

    # Now click "Создать акт"
    page.get_by_role("button", name="Создать акт").click()
    page.wait_for_timeout(1000)

    # Should open ActCreateForm modal
    page.screenshot(path="act_create_form_verification.png")
    print("Screenshot saved to act_create_form_verification.png")

    # Let's interact with ActCreateForm to trigger validation
    page.get_by_role("button", name="Сгенерировать АОСР").click()
    page.wait_for_timeout(500)

    page.screenshot(path="act_create_form_validation.png")
    print("Screenshot saved to act_create_form_validation.png")

    browser.close()
