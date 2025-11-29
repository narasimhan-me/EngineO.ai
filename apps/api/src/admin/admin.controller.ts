import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get admin dashboard statistics
   */
  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  /**
   * Get all users with pagination
   */
  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * Get a single user by ID
   */
  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  /**
   * Update user role
   */
  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: 'USER' | 'ADMIN' },
  ) {
    return this.adminService.updateUserRole(id, body.role);
  }

  /**
   * Update user's subscription (admin override)
   */
  @Put('users/:id/subscription')
  async updateUserSubscription(
    @Param('id') id: string,
    @Body() body: { planId: string },
  ) {
    return this.adminService.updateUserSubscription(id, body.planId);
  }
}
