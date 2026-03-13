import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        await page.goto("http://localhost:3000/")
        await page.wait_for_timeout(2000)

        # Click login button
        await page.click("button:has-text('Вход')", timeout=5000)
        await page.wait_for_timeout(1000)

        # Fill out login form
        await page.fill("input[type='email']", "test@test.com")
        await page.fill("input[type='password']", "password123")

        # Submit login
        await page.click("button:has-text('Войти')", timeout=5000)
        await page.wait_for_timeout(3000)

        print("Logged in!")

        # Navigate to Objects View from Dashboard
        await page.goto("http://localhost:3000/dashboard/objects")
        await page.wait_for_timeout(2000)

        # Take a screenshot to see what's happening
        await page.screenshot(path="debug_before_create.png")
        print("Saved debug_before_create.png")

        # Create an object
        print("Creating object...")
        try:
            # Let's try locating by general button classes/text
            await page.click("button:has-text('Новый объект')", timeout=5000)
        except:
            print("Trying another button to create object...")
            try:
                await page.click("button:has-text('Создать первый объект')", timeout=5000)
            except:
                print("Trying to click plus icon...")
                try:
                   await page.click("button:has-text('+')", timeout=5000)
                except:
                   print("Trying to navigate to /dashboard/objects directly")
                   await page.goto("http://localhost:3000/dashboard/objects")
                   await page.wait_for_timeout(2000)
                   await page.click("text=Новый объект", timeout=5000)


        await page.wait_for_timeout(1000)

        # Fill modal
        await page.fill("input[placeholder='Например: ЖК Лесной']", "Тест Объект 123")
        # Find the specific create button inside the modal
        await page.click("button.bg-blue-600.text-white:has-text('Создать')", timeout=5000)
        await page.wait_for_timeout(2000)

        # Click the new object
        try:
            await page.click("text=Тест Объект 123", timeout=5000)
            await page.wait_for_timeout(2000)
        except:
            print("Trying to click object card...")
            cards = await page.locator(".grid > div").all()
            if cards:
                await cards[-1].click()
            await page.wait_for_timeout(2000)

        print(f"Current URL: {page.url}")

        # Take screenshot of object detail view
        await page.screenshot(path="debug_object_detail.png")
        print("Took debug_object_detail.png")

        # Click "Сметы и акты" tab
        try:
            await page.click("button:has-text('Сметы и акты')", timeout=5000)
            await page.wait_for_timeout(2000)
            print("Clicked Сметы и акты")
        except Exception as e:
            print(f"Could not click 'Сметы и акты': {e}")
            await browser.close()
            return

        await page.screenshot(path="debug_estimates_tab.png")
        print("Took debug_estimates_tab.png")

        # Click "+ Создать акт вручную"
        try:
            await page.click("button:has-text('+ Создать акт вручную')", timeout=5000)
            await page.wait_for_timeout(1000)
            print("Clicked '+ Создать акт вручную'")
        except Exception as e:
            print(f"Could not click '+ Создать акт вручную': {e}")
            # Try alternate button
            try:
                await page.click("button:has-text('+ Создать акт')", timeout=5000)
                await page.wait_for_timeout(1000)
                print("Clicked '+ Создать акт'")
            except Exception as e2:
                print(f"Could not click alternate button either: {e2}")
                await browser.close()
                return

        # Take screenshot of the form
        await page.screenshot(path="debug_form.png")
        print("Took debug_form.png")

        # Trigger validation by submitting empty form
        try:
            await page.click("button:has-text('Создать акт')", timeout=5000)
            await page.wait_for_timeout(1000)
            print("Clicked 'Создать акт' to trigger validation")
        except Exception as e:
            print(f"Could not click 'Создать акт' (submit): {e}")

        # Capture final screenshot with validation errors
        await page.screenshot(path="/home/jules/verification/verification.png")
        print("Took /home/jules/verification/verification.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
