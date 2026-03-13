import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        await page.goto("http://localhost:3000/")
        await page.wait_for_timeout(2000)

        # In HomeView there is a "Вход" button
        # Wait for button specifically in the nav bar
        await page.click("text=Вход")
        await page.wait_for_timeout(2000)

        # Check we are in auth view
        await page.screenshot(path="debug_auth_view.png")
        print("Took debug_auth_view.png")

        # Now fill in credentials (it defaults to ivan@stroydoc.ai and password123, so we can just click "Войти")
        await page.click("button:has-text('Войти')")
        await page.wait_for_timeout(3000)

        print("URL after login:", page.url)
        await page.screenshot(path="debug_after_login.png")
        print("Took debug_after_login.png")

        # Try registering instead
        await page.goto("http://localhost:3000/")
        await page.wait_for_timeout(2000)
        await page.click("text=Регистрация")
        await page.wait_for_timeout(2000)

        await page.fill("input[name='name']", "Иван Иванов")
        await page.fill("input[name='email']", "test2@test.com")
        await page.fill("input[name='password']", "password123")
        await page.click("button:has-text('Зарегистрироваться')")
        await page.wait_for_timeout(3000)

        print("URL after register:", page.url)
        await page.screenshot(path="debug_after_register.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
