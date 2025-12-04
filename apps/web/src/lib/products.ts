export interface Product {
  id: string;
  externalId: string;
  title: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  imageUrls: string[] | null;
  lastSyncedAt: string;
  handle?: string | null;
  price?: number | null;
  currency?: string | null;
  shopifyStatus?: string | null;
  lastOptimizedAt?: string | null;
}

export type ProductStatus = 'missing-metadata' | 'needs-optimization' | 'optimized';

export function getProductStatus(product: Product): ProductStatus {
  const hasTitle = !!product.seoTitle?.trim();
  const hasDescription = !!product.seoDescription?.trim();

  if (!hasTitle && !hasDescription) {
    return 'missing-metadata';
  }

  const titleLength = product.seoTitle?.length ?? 0;
  const descriptionLength = product.seoDescription?.length ?? 0;

  const titleNeedsWork = titleLength > 0 && (titleLength < 30 || titleLength > 60);
  const descriptionNeedsWork =
    descriptionLength > 0 && (descriptionLength < 70 || descriptionLength > 155);

  if (!hasTitle || !hasDescription || titleNeedsWork || descriptionNeedsWork) {
    return 'needs-optimization';
  }

  return 'optimized';
}
