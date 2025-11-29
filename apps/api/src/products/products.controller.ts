import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductsService } from './products.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * GET /projects/:projectId/products
   * Get all products for a project
   */
  @Get(':projectId/products')
  async getProducts(@Request() req: any, @Param('projectId') projectId: string) {
    return this.productsService.getProductsForProject(projectId, req.user.id);
  }
}
