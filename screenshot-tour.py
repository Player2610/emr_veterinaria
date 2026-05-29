import asyncio
from playwright.async_api import async_playwright

BASE = "http://localhost:3000"

PAGES = [
    ("/",                "dashboard"),
    ("/medical-records", "medical-records"),
    ("/owners",          "owners"),
    ("/pets",            "pets"),
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 900})

        page = await ctx.new_page()
        await page.goto(f"{BASE}/login", wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(3000)

        await page.fill('input[type="email"]', "admin@demo-clinica.com")
        await page.fill('input[type="password"]', "demo1234!")
        await page.click('button[type="submit"]')

        await page.wait_for_url(f"{BASE}/", timeout=15000)
        await page.wait_for_timeout(4000)

        for path, name in PAGES:
            try:
                await page.goto(f"{BASE}{path}", wait_until="domcontentloaded", timeout=30000)
                await page.wait_for_timeout(4000)
                await page.screenshot(path=f"C:/Users/NPC201~1.DES/AppData/Local/Temp/{name}.png", full_page=False)
                print(f"OK  {name}")
            except Exception as e:
                print(f"ERR {name}: {e}")

        await browser.close()

asyncio.run(main())
