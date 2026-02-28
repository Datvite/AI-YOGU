import { test, expect } from "@playwright/test";

test("student creates club, admin approves, club posts", async ({ page }) => {
  // Student registers
  await page.goto("/");
  await page.getByRole("link", { name: "Get Started" }).click();
  await expect(page).toHaveURL(/.*\/auth\/register/);

  const studentEmail = `e2e-student-${Date.now()}@example.com`;
  await page.getByLabel("Name").fill("E2E Student");
  await page.getByLabel("Email").fill(studentEmail);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Register" }).click();

  // Student logs in
  await page.getByRole("link", { name: "Login" }).click();
  await expect(page).toHaveURL(/.*\/auth\/login/);
  await page.getByLabel("Email").fill(studentEmail);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");

  // Student submits club creation request
  await page.getByRole("link", { name: "Profile" }).click();
  await expect(page).toHaveURL(/.*\/profile/);
  await page.getByLabel("Name").last().fill("E2E Test Club");
  await page.getByLabel("Category").last().fill("Testing");
  await page.getByLabel("Schedule").fill("Weekly");
  await page.getByLabel("Description").last().fill("E2E Test Club Description");
  await page.getByRole("button", { name: "Submit request" }).click();

  // Admin logs in
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page).toHaveURL(/.*\/auth\/login/);
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/.*\/dashboard\/admin/);

  // Admin approves club
  const approveButton = page.getByRole("button", { name: "Approve" }).first();
  await expect(approveButton).toBeVisible();
  await approveButton.click();
  await expect(page).toHaveURL(/.*\/dashboard\/admin/);

  // Club logs in
  await page.getByRole("link", { name: "Club Panel" }).click();
  await expect(page).toHaveURL(/.*\/auth\/login/);
  await page.getByLabel("Email").fill("club1@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/.*\/dashboard\/club/);

  // Club creates a post
  await page.getByLabel("Title").fill("E2E Club Post");
  await page.getByLabel("Content").fill("This is a post created in the E2E test.");
  await page.getByRole("button", { name: "Publish post" }).click();
  await expect(page.getByText("E2E Club Post")).toBeVisible();
});

