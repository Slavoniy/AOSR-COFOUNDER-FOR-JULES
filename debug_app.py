import time
from playwright.sync_api import Page, expect, sync_playwright

def test_dashboard_flow(page: Page):
    print("Testing dashboard flow...")
    page.goto("http://localhost:3000")

    # Check if handleLogin prevents default correctly.
