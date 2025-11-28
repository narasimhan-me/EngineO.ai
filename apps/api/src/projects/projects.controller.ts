import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * GET /projects/:id/integration-status
   * Returns integration status for a project including Shopify connection
   */
  @Get(':id/integration-status')
  async getIntegrationStatus(@Param('id') projectId: string) {
    const status = await this.projectsService.getIntegrationStatus(projectId);

    if (!status) {
      throw new NotFoundException('Project not found');
    }

    return status;
  }

  /**
   * GET /projects/:id
   * Returns project details
   */
  @Get(':id')
  async getProject(@Param('id') projectId: string) {
    const project = await this.projectsService.getProject(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
}
