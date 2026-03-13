from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()

    print("Registering/Logging in...")
    try:
        response = context.request.post("http://localhost:3000/api/auth/register", data={
            "name": "Ivan Ivanov",
            "email": "ivan.auth3@stroydoc.ai",
            "password": "password123"
        })
    except:
        pass

    page = context.new_page()
    page.goto("http://localhost:3000/")

    # Wait for app to load
    page.wait_for_timeout(2000)

    # Click sidebar item "Объекты"
    page.locator('text="Объекты"').first.click()
    page.wait_for_timeout(2000)
    page.screenshot(path="objects_navigated.png")

    try:
        page.get_by_role("button", name="Создать объект").first.click()
        page.wait_for_timeout(500)

        page.locator("input[placeholder=\"Например: Жилой комплекс 'Звездный'\"]").fill("Test Object")
        page.locator("input[placeholder=\"Например: г. Москва, ул. Ленина, д. 1\"]").fill("Test Address")

        page.get_by_role("button", name="Создать").click()
        page.wait_for_timeout(2000)

        print(f"Current URL: {page.url}")

        page.get_by_role("button", name="Создать акт").click()
        page.wait_for_timeout(1000)
        page.screenshot(path="act_create_form_verification.png")

        page.get_by_role("button", name="Сгенерировать АОСР").click()
        page.wait_for_timeout(500)
        page.screenshot(path="act_create_form_validation.png")
    except Exception as e:
        print(f"Error creating: {e}")

    browser.close()
