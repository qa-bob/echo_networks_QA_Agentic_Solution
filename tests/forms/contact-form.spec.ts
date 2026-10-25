/**
 * tests/forms/contact-form.spec.ts
 *
 * Contact form tests — verify the presence and structure of contact forms.
 * IMPORTANT: These tests do NOT submit forms to avoid sending spam.
 *
 * Tag: @forms
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Contact Form @forms', () => {
  // Skip the entire suite when skipForms is configured for this site
  test.beforeEach(async ({ siteConfig }) => {
    if (siteConfig.skipForms) {
      test.skip(true, `Forms testing skipped for "${siteConfig.name}" (skipForms: true)`);
    }
  });

  // ── Form presence ───────────────────────────────────────────────────────────

  test('contact form is present on site @forms', async ({ contactPage, siteConfig }) => {
    // Check homepage first
    await contactPage.navigate();
    let form = await contactPage.findContactForm();

    // If not on homepage, walk common contact page paths (including site-specific slugs)
    if (!form) {
      await contactPage.navigateToContactPage();
      form = await contactPage.findContactForm();
    }

    expect(
      form,
      `No contact form found on "${siteConfig.name}". ` +
        'Checked homepage and common contact page paths (/contact, /reach-out-to-us-2, etc.).'
    ).not.toBeNull();
  });

  // ── Required fields ─────────────────────────────────────────────────────────

  test('contact form has required fields (name, email) @forms', async ({ contactPage, siteConfig }) => {
    await contactPage.navigate();
    let form = await contactPage.findContactForm();

    if (!form) {
      await contactPage.navigateToContactPage();
      form = await contactPage.findContactForm();
    }

    if (!form) {
      test.skip(true, 'No contact form found — covered by "contact form is present" test');
      return;
    }

    const hasEmail = await contactPage.hasEmailField();
    const hasName = await contactPage.hasNameField();

    expect(hasEmail, 'Contact form should have an email input field').toBeTruthy();

    if (!hasName) {
      console.warn(
        `[forms] "${siteConfig.name}" contact form is missing a name field. ` +
          'This is a usability concern.'
      );
    }
  });

  // ── Submit button ───────────────────────────────────────────────────────────

  test('contact form has a submit button @forms', async ({ contactPage, siteConfig }) => {
    await contactPage.navigate();
    let form = await contactPage.findContactForm();

    if (!form) {
      await contactPage.navigateToContactPage();
      form = await contactPage.findContactForm();
    }

    if (!form) {
      test.skip(true, 'No contact form found');
      return;
    }

    const hasSubmit = await contactPage.hasSubmitButton();
    expect(hasSubmit, 'Contact form should have a visible submit button').toBeTruthy();
  });

  // ── Labels and placeholders ─────────────────────────────────────────────────

  test('form fields have proper labels or placeholders @forms', async ({ contactPage, siteConfig, page }) => {
    await contactPage.navigate();
    let form = await contactPage.findContactForm();

    if (!form) {
      await contactPage.navigateToContactPage();
      form = await contactPage.findContactForm();
    }

    if (!form) {
      test.skip(true, 'No contact form found');
      return;
    }

    const fields = await contactPage.getFormFields();
    const unlabeledFields: string[] = [];

    for (const field of fields) {
      if (field.type === 'hidden' || field.type === 'submit') continue;

      const fieldLocator = form.locator(
        `input[name="${field.name}"], textarea[name="${field.name}"]`
      ).first();

      if (await fieldLocator.count() === 0) continue;

      const hasAriaLabel = await fieldLocator.getAttribute('aria-label');
      const hasPlaceholder = await fieldLocator.getAttribute('placeholder');
      const fieldId = await fieldLocator.getAttribute('id');
      const hasLabel = fieldId
        ? (await page.locator(`label[for="${fieldId}"]`).count()) > 0
        : false;

      if (!hasAriaLabel && !hasPlaceholder && !hasLabel) {
        unlabeledFields.push(field.name);
      }
    }

    if (unlabeledFields.length > 0) {
      console.warn(
        `[forms] Fields without labels/placeholders in "${siteConfig.name}": ` +
          unlabeledFields.join(', ')
      );
    }

    // Soft assertion — warn but do not fail (label presence is accessibility best practice)
    expect(
      unlabeledFields.length,
      `${unlabeledFields.length} form field(s) have no label, aria-label, or placeholder`
    ).toBeLessThanOrEqual(fields.length / 2); // Allow max 50% unlabeled
  });

  // ── HTML5 validation ─────────────────────────────────────────────────────────

  test('required fields show validation when submitted empty @forms', async ({
    contactPage,
    siteConfig,
    page,
  }) => {
    await contactPage.navigate();
    let form = await contactPage.findContactForm();

    if (!form) {
      await contactPage.navigateToContactPage();
      form = await contactPage.findContactForm();
    }

    if (!form) {
      test.skip(true, 'No contact form found');
      return;
    }

    const hasSubmit = await contactPage.hasSubmitButton();
    if (!hasSubmit) {
      test.skip(true, 'No submit button found in form');
      return;
    }

    const submitBtn = form
      .locator('button[type="submit"], input[type="submit"], button:not([type="button"]):not([type="reset"])')
      .first();

    // Block every non-GET request so nothing can actually be submitted, even
    // if the form posts via fetch/XHR or validation is missing.
    const submissionAttempts: string[] = [];
    await page.route('**/*', async (route) => {
      const req = route.request();
      if (req.method() !== 'GET' && req.method() !== 'HEAD') {
        submissionAttempts.push(`${req.method()} ${req.url()}`);
        await route.abort();
        return;
      }
      await route.continue();
    });

    await submitBtn.click({ force: true });

    // The empty form should be stopped by validation before anything is sent
    expect(
      submissionAttempts.filter((a) => a.startsWith('POST')),
      'Clicking submit on an empty form should NOT send a request (validation should prevent submission)'
    ).toHaveLength(0);

    // Check HTML5 validation API on required fields
    const firstRequired = form.locator('[required]').first();
    if (await firstRequired.count() > 0) {
      const isValid = await firstRequired.evaluate((el) => {
        return (el as HTMLInputElement).validity?.valid ?? true;
      });
      expect(
        isValid,
        'Required fields should be invalid when empty (browser validation)'
      ).toBeFalsy();
    }
  });
});
