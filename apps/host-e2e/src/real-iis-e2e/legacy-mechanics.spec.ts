import { expect, test } from '@playwright/test';

test('IIS applies one framing policy consistently across legacy and Angular resources', async ({
  request,
}) => {
  for (const path of [
    '/default.asp',
    '/legacy-page.aspx',
    '/migrated-asp-1.aspx',
    '/migrated-asp-2.aspx',
    '/AngularShell/',
  ]) {
    const response = await request.get(path);
    expect(response.ok(), `${path} should return success`).toBe(true);

    const headers = response.headersArray();
    const frameOptions = headers.filter(
      (header) => header.name.toLowerCase() === 'x-frame-options',
    );
    const contentSecurityPolicy = headers.filter(
      (header) => header.name.toLowerCase() === 'content-security-policy',
    );

    expect(
      frameOptions,
      `${path} should send X-Frame-Options exactly once`,
    ).toHaveLength(1);
    expect(frameOptions[0].value).toBe('SAMEORIGIN');
    expect(
      contentSecurityPolicy,
      `${path} should send CSP exactly once`,
    ).toHaveLength(1);
    expect(contentSecurityPolicy[0].value).toContain("frame-ancestors 'self'");
  }
});

test('AngularShell navigates to each migrated ASPX page and renders its selected Angular element', async ({
  page,
}) => {
  await page.goto('/AngularShell/');
  const legacyFrame = page.frameLocator('iframe');

  await legacyFrame
    .getByRole('link', { name: '/migrated-asp-1.aspx' })
    .click();
  await expect(legacyFrame.locator('ca-pricing-search')).toContainText(
    'Customer pricing search',
  );
  await expect(legacyFrame.locator('ca-feature-two')).toHaveCount(0);
  await expect
    .poll(() => new URL(page.url()).searchParams.get('path'))
    .toBe('/migrated-asp-1.aspx');

  await legacyFrame
    .getByRole('link', { name: '/migrated-asp-2.aspx' })
    .click();
  await expect(legacyFrame.locator('ca-feature-two')).toContainText(
    'Settlement instructions',
  );
  await expect(legacyFrame.locator('ca-pricing-search')).toHaveCount(0);
  await expect
    .poll(() => new URL(page.url()).searchParams.get('path'))
    .toBe('/migrated-asp-2.aspx');
});

test('Classic ASP restores the same StateServer identity through the COM bridge', async ({
  page,
}) => {
  await page.goto('/default.asp');
  await expect(page.locator('#bridge-identity')).toContainText(
    'e2e-user|pricing.view',
  );

  await page.getByRole('link', { name: '/legacy-page.aspx' }).click();
  await expect(page.locator('#session-identity')).toContainText(
    'e2e-user [pricing.view]',
  );

  await page
    .getByRole('link', { name: '/legacy-page.asp', exact: true })
    .click();
  await expect(page.locator('#bridge-identity')).toContainText(
    'e2e-user|pricing.view',
  );
});

test('real WebForms ViewState survives repeated postbacks', async ({
  page,
}) => {
  await page.goto('/legacy-page.aspx');
  const increment = page.getByRole('button', {
    name: 'Increment postback count',
  });

  await increment.click();
  await expect(page.locator('#postback-count')).toContainText(
    'Postback count: 1',
  );

  await increment.click();
  await expect(page.locator('#postback-count')).toContainText(
    'Postback count: 2',
  );
});

test('a WebForms response produces a download without Response.End', async ({
  page,
}) => {
  await page.goto('/legacy-page.aspx');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download from WebForms' }).click(),
  ]);

  expect(download.suggestedFilename()).toBe('webforms-sample.txt');
});

test('logout clears authentication and iframe login promotes itself to the top window', async ({
  page,
}) => {
  await page.goto('/Logout.aspx');
  await expect(page).toHaveURL(/\/Login\.aspx$/);

  await page.goto('/AngularShell/');
  await expect(page).toHaveURL(/\/Login\.aspx(?:\?|$)/);
  await expect(
    page.getByRole('heading', { name: 'Legacy harness login' }),
  ).toBeVisible();
});
