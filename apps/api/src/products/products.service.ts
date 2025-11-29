import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all products for a project (with ownership validation)
   */
  async getProductsForProject(projectId: string, userId: string) {
    // Validate project ownership
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

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
   * Get a single product by ID (with ownership validation)
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

    if (product.project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this product');
    }

    return product;
  }
}
