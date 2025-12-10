// Shopify product fixtures for Automation Engine v1 tests (scaffolding only).
//
// These fixtures are used by unit and integration tests to simulate Shopify
// product payloads for:
// - product_synced triggers (Automation Engine v1)
// - Answer Block automations (Section 8.7 – Shopify Answer Block Automations)
//
// Specs referenced:
// - docs/AUTOMATION_ENGINE_SPEC.md (Section 8.7 – Shopify Answer Block Automations)
// - docs/ANSWER_ENGINE_SPEC.md (Phase AE-1.3 – Answer Block Persistence)
//
// NOTE:
// - Shapes are intentionally approximate; they should be aligned with:
//   - ShopifyProduct interface in apps/api/src/shopify/shopify.service.ts
//   - The current sync DTOs used by ShopifyService.fetchShopifyProducts / syncProducts
// - TODO markers indicate where fields may need adjustment once implementation stabilizes.

export const basicShopifyProduct = {
  id: 1111111111,
  title: 'Basic Test Product',
  body_html:
    '<p>Basic test product description with enough detail for Answer Engine heuristics.</p>',
  metafields_global_title_tag: 'Basic Test Product – SEO Title',
  metafields_global_description_tag:
    'SEO description for Basic Test Product, suitable for search and answers.',
  images: [{ src: 'https://example.com/images/basic-test-product.jpg' }],
  // TODO: Align with ShopifyProduct interface (handle, additional fields) if needed.
};

export const shopifyProductMissingSeo = {
  id: 2222222222,
  title: 'Product Missing SEO',
  body_html:
    '<p>Product with description but no explicit SEO title/description set in Shopify.</p>',
  metafields_global_title_tag: undefined,
  metafields_global_description_tag: undefined,
  images: [{ src: 'https://example.com/images/product-missing-seo.jpg' }],
  // TODO: Confirm how missing SEO fields are represented in real Shopify responses.
};

export const shopifyProductThinDescription = {
  id: 3333333333,
  title: 'Thin Description Product',
  body_html: '<p>Too short.</p>', // Intentionally thin content.
  metafields_global_title_tag: undefined,
  metafields_global_description_tag: undefined,
  images: [{ src: 'https://example.com/images/thin-description-product.jpg' }],
  // TODO: Adjust description length and fields to match thin-content heuristics.
};

export const shopifyProductNoAnswerBlocks = {
  id: 4444444444,
  title: 'No Answer Blocks Product',
  body_html:
    '<p>Product used for tests where no Answer Blocks exist yet in the AE-1.3 persistence layer.</p>',
  metafields_global_title_tag: 'No Answer Blocks – SEO Title',
  metafields_global_description_tag:
    'SEO description for a product with no Answer Blocks persisted yet.',
  images: [{ src: 'https://example.com/images/no-answer-blocks-product.jpg' }],
  // NOTE: "No Answer Blocks" is modeled at the database level (no AnswerBlock rows),
  // not as a property on this payload. Tests will ensure the absence of AnswerBlocks
  // when using this fixture.
};
