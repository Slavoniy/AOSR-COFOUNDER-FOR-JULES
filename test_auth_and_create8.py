from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()

    print("Registering/Logging in...")
    try:
        response = context.request.post("http://localhost:3000/api/auth/register", data={
            "name": "Ivan Ivanov",
            "email": "ivan.auth8@stroydoc.ai",
            "password": "password123"
        })
    except:
        pass

    page = context.new_page()
    page.goto("http://localhost:3000/")

    # Wait for app to load
    page.wait_for_timeout(2000)

    # Click sidebar item "Объекты", then click "Все объекты"
    page.locator('text="Объекты"').first.click()
    page.wait_for_timeout(500)
    page.locator('text="Все объекты"').first.click()
    page.wait_for_timeout(2000)

    try:
        page.get_by_role("button", name="Создать объект").first.click()
        page.wait_for_timeout(500)

        page.locator("input[placeholder=\"Например: Жилой комплекс 'Звездный'\"]").fill("Test Object")
        page.locator("input[placeholder=\"Например: г. Москва, ул. Ленина, д. 1\"]").fill("Test Address")

        page.get_by_role("button", name="Создать", exact=True).click()
        page.wait_for_timeout(2000)

        # Click the "Сметы и акты" tab
        page.locator('text="Сметы и акты"').first.click()
        page.wait_for_timeout(1000)

        # Click the correct button for creating an act, we'll try locating by text or role depending on what the UI says.
        page.locator('button:has-text("Создать акт")').first.click()
        page.wait_for_timeout(1000)

        # Now click "Сохранить" instead of "Сгенерировать АОСР" to trigger validation errors
        # Let's scroll down to make sure it's visible or just click it
        page.locator('button:has-text("Сохранить")').click()
        page.wait_for_timeout(500)

        # Take a screenshot of the validation errors!
        page.screenshot(path="act_create_form_validation.png")
        print("Success!")
    except Exception as e:
        print(f"Error creating: {e}")

    browser.close()
