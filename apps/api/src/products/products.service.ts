import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RoleResolutionService } from '../common/role-resolution.service';

/**
 * [ROLES-3] Updated with ProjectMember-aware access enforcement
 *
 * Access control:
 * - getProductsForProject: Any ProjectMember can view
 * - getProduct: Any ProjectMember can view
 */
@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleResolution: RoleResolutionService,
  ) {}

  /**
   * Get all products for a project (with membership validation)
   * [ROLES-3] Any ProjectMember can view products
   */
  async getProductsForProject(projectId: string, userId: string) {
    // [ROLES-3] Verify membership (any role can view)
    await this.roleResolution.assertProjectAccess(projectId, userId);

    // Get products for this project
    const products = await this.prisma.product.findMany({
      where: { projectId },
      orderBy: { lastSyncedAt: 'desc' },
      select: {
        id: true,
        externalId: true,
        title: true,
        description: true,
        seoTitle: true,
        seoDescription: true,
        imageUrls: true,
        lastSyncedAt: true,
      },
    });

    return products;
  }

  /**
   * Get a single product by ID (with membership validation)
   * [ROLES-3] Any ProjectMember can view products
   */
  async getProduct(productId: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        project: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // [ROLES-3] Verify membership (any role can view)
    await this.roleResolution.assertProjectAccess(product.projectId, userId);

    return product;
  }
}
