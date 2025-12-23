import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CustomerAccountRole } from '@prisma/client';

/**
 * [ROLES-2] Role Resolution Service
 *
 * Resolves the effective project role for a user.
 * Single-user constraint (v1): Default is OWNER for project owners.
 * Uses existing CustomerAccountRole (accountRole field) to allow simulation of EDITOR/VIEWER.
 *
 * This helper provides a centralized place to determine user capabilities
 * for role-based access control across the application.
 */

export type EffectiveProjectRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface RoleCapabilities {
  /** Can view project data and previews */
  canView: boolean;
  /** Can request approvals (any role) */
  canRequestApproval: boolean;
  /** Can approve/reject approval requests (OWNER only) */
  canApprove: boolean;
  /** Can execute apply actions (OWNER/EDITOR, not VIEWER) */
  canApply: boolean;
  /** Can modify project settings (OWNER only) */
  canModifySettings: boolean;
}

@Injectable()
export class RoleResolutionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve the effective project role for a user.
   *
   * Single-user constraint (v1):
   * - Project owner gets OWNER role by default
   * - If user has accountRole set (VIEWER/EDITOR), that takes precedence for simulation
   * - This allows testing VIEWER restrictions without multi-user infrastructure
   */
  async resolveEffectiveRole(
    projectId: string,
    userId: string,
  ): Promise<EffectiveProjectRole> {
    // Get project and user data
    const [project, user] = await Promise.all([
      this.prisma.project.findUnique({
        where: { id: projectId },
        select: { userId: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { accountRole: true },
      }),
    ]);

    // If user is not the project owner, they have no access (for now)
    // Future: Could check team membership here
    if (!project || project.userId !== userId) {
      // Return VIEWER as most restrictive for non-owners (will be blocked anyway)
      return 'VIEWER';
    }

    // Single-user emulation: Use accountRole if set to simulate VIEWER/EDITOR
    // Default to OWNER for backwards compatibility
    if (user?.accountRole) {
      return user.accountRole as EffectiveProjectRole;
    }

    return 'OWNER';
  }

  /**
   * Get capabilities for a given effective role.
   * This is a pure function - no database access needed.
   */
  getCapabilities(role: EffectiveProjectRole): RoleCapabilities {
    switch (role) {
      case 'OWNER':
        return {
          canView: true,
          canRequestApproval: true,
          canApprove: true,
          canApply: true,
          canModifySettings: true,
        };
      case 'EDITOR':
        return {
          canView: true,
          canRequestApproval: true,
          canApprove: false,
          canApply: true,
          canModifySettings: false,
        };
      case 'VIEWER':
        return {
          canView: true,
          canRequestApproval: true, // Future-proofed: viewers can request
          canApprove: false,
          canApply: false,
          canModifySettings: false,
        };
    }
  }

  /**
   * Check if a user can perform apply actions on a project.
   * VIEWER role is blocked from apply operations.
   */
  async canApply(projectId: string, userId: string): Promise<boolean> {
    const role = await this.resolveEffectiveRole(projectId, userId);
    return this.getCapabilities(role).canApply;
  }

  /**
   * Check if a user can approve requests on a project.
   * Only OWNER can approve.
   */
  async canApprove(projectId: string, userId: string): Promise<boolean> {
    const role = await this.resolveEffectiveRole(projectId, userId);
    return this.getCapabilities(role).canApprove;
  }

  /**
   * Get role display label for UI.
   */
  getRoleDisplayLabel(role: EffectiveProjectRole): string {
    switch (role) {
      case 'OWNER':
        return 'Project Owner';
      case 'EDITOR':
        return 'Editor';
      case 'VIEWER':
        return 'Viewer';
    }
  }
}
