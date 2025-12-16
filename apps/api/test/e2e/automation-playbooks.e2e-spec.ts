import { INestApplication, HttpException, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../utils/test-app';
import { cleanupTestDb, disconnectTestDb, testPrisma } from '../utils/test-db';
import { ProductIssueFixService } from '../../src/ai/product-issue-fix.service';

class ProductIssueFixServiceStub {
  public mode:
    | 'success'
    | 'failOnSecond'
    | 'rateLimitOnSecond'
    | 'dailyLimitOnSecond' = 'success';
  public callCount = 0;

  async fixMissingSeoFieldFromIssue(input: {
    userId: string;
    productId: string;
    issueType: 'missing_seo_title' | 'missing_seo_description';
  }) {
    this.callCount += 1;
    const { productId, issueType } = input;

    if (this.mode === 'failOnSecond' && this.callCount === 2) {
      throw new Error('Synthetic failure for test');
    }

    if (this.mode === 'rateLimitOnSecond' && this.callCount === 2) {
      throw new HttpException(
        {
          message: 'Synthetic rate limit for test',
          error: 'RATE_LIMIT',
          code: 'RATE_LIMIT',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (this.mode === 'dailyLimitOnSecond' && this.callCount === 2) {
      throw new HttpException(
        {
          message: 'Synthetic daily AI limit for test',
          error: 'AI_DAILY_LIMIT_REACHED',
          code: 'AI_DAILY_LIMIT_REACHED',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return {
      productId,
      projectId: 'test-project',
      issueType,
      updated: true,
      field: issueType === 'missing_seo_title' ? 'seoTitle' : 'seoDescription',
    };
  }
}

const productIssueFixServiceStub = new ProductIssueFixServiceStub();

async function signupAndLogin(
  server: any,
  email: string,
  password: string,
): Promise<{ token: string; userId: string }> {
  await request(server)
    .post('/auth/signup')
    .send({
      email,
      password,
      name: 'Test User',
      captchaToken: 'test-token',
    })
    .expect(201);

  const loginRes = await request(server)
    .post('/auth/login')
    .send({
      email,
      password,
      captchaToken: 'test-token',
    })
    .expect(200);

  return {
    token: loginRes.body.accessToken as string,
    userId: loginRes.body.user.id as string,
  };
}

async function createProject(
  server: any,
  token: string,
  name: string,
  domain: string,
): Promise<string> {
  const res = await request(server)
    .post('/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name, domain })
    .expect(201);
  return res.body.id as string;
}

async function createProduct(
  projectId: string,
  data: {
    title: string;
    externalId: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
  },
): Promise<string> {
  const product = await testPrisma.product.create({
    data: {
      projectId,
      title: data.title,
      externalId: data.externalId,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
    },
  });
  return product.id;
}

describe('Automation Playbooks (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    app = await createTestApp((builder) =>
      builder
        .overrideProvider(ProductIssueFixService)
        .useValue(productIssueFixServiceStub),
    );
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await cleanupTestDb();
    await disconnectTestDb();
    await app.close();
  });

  beforeEach(async () => {
    await cleanupTestDb();
    productIssueFixServiceStub.mode = 'success';
    productIssueFixServiceStub.callCount = 0;
  });

  describe('GET /projects/:id/automation-playbooks/estimate', () => {
    it('returns estimate for missing_seo_title playbook', async () => {
      const { token } = await signupAndLogin(
        server,
        'playbook-estimate@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Playbook Test Project',
        'playbook-test.com',
      );

      // Create products: 2 without SEO title, 1 with SEO title
      await createProduct(projectId, {
        title: 'Product 1',
        externalId: 'ext-1',
        seoTitle: null,
        seoDescription: 'Has description',
      });
      await createProduct(projectId, {
        title: 'Product 2',
        externalId: 'ext-2',
        seoTitle: '',
        seoDescription: 'Has description',
      });
      await createProduct(projectId, {
        title: 'Product 3',
        externalId: 'ext-3',
        seoTitle: 'Has SEO Title',
        seoDescription: 'Has description',
      });

      const res = await request(server)
        .get(`/projects/${projectId}/automation-playbooks/estimate`)
        .query({ playbookId: 'missing_seo_title' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('projectId', projectId);
      expect(res.body).toHaveProperty('playbookId', 'missing_seo_title');
      expect(res.body).toHaveProperty('totalAffectedProducts', 2);
      expect(res.body).toHaveProperty('estimatedTokens');
      expect(res.body).toHaveProperty('planId');
      expect(res.body).toHaveProperty('eligible');
      expect(res.body).toHaveProperty('canProceed');
      expect(res.body).toHaveProperty('reasons');
      expect(res.body).toHaveProperty('aiDailyLimit');
      // AUTO-PB-1.3: scopeId must be returned for binding preview → apply
      expect(res.body).toHaveProperty('scopeId');
      expect(typeof res.body.scopeId).toBe('string');
      expect(res.body.scopeId.length).toBeGreaterThan(0);
    });

    it('returns estimate for missing_seo_description playbook', async () => {
      const { token } = await signupAndLogin(
        server,
        'playbook-estimate-desc@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Description Test Project',
        'desc-test.com',
      );

      // Create products: 1 without SEO description, 2 with SEO description
      await createProduct(projectId, {
        title: 'Product 1',
        externalId: 'ext-1',
        seoTitle: 'Has title',
        seoDescription: null,
      });
      await createProduct(projectId, {
        title: 'Product 2',
        externalId: 'ext-2',
        seoTitle: 'Has title',
        seoDescription: 'Has description',
      });
      await createProduct(projectId, {
        title: 'Product 3',
        externalId: 'ext-3',
        seoTitle: 'Has title',
        seoDescription: 'Has description',
      });

      const res = await request(server)
        .get(`/projects/${projectId}/automation-playbooks/estimate`)
        .query({ playbookId: 'missing_seo_description' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalAffectedProducts', 1);
      expect(res.body).toHaveProperty('playbookId', 'missing_seo_description');
    });

    it('returns 0 affected products when all products have required field', async () => {
      const { token } = await signupAndLogin(
        server,
        'playbook-no-affected@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'All Complete Project',
        'all-complete.com',
      );

      // Create products with all SEO fields filled
      await createProduct(projectId, {
        title: 'Product 1',
        externalId: 'ext-1',
        seoTitle: 'Has SEO Title',
        seoDescription: 'Has description',
      });

      const res = await request(server)
        .get(`/projects/${projectId}/automation-playbooks/estimate`)
        .query({ playbookId: 'missing_seo_title' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalAffectedProducts', 0);
      expect(res.body.reasons).toContain('no_affected_products');
    });

    it('returns 400 when playbookId is missing', async () => {
      const { token } = await signupAndLogin(
        server,
        'playbook-missing-id@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Missing ID Project',
        'missing-id.com',
      );

      const res = await request(server)
        .get(`/projects/${projectId}/automation-playbooks/estimate`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });

    it('returns 403 when accessing another user project', async () => {
      const user1 = await signupAndLogin(
        server,
        'playbook-owner@example.com',
        'testpassword123',
      );
      const user2 = await signupAndLogin(
        server,
        'playbook-other@example.com',
        'testpassword123',
      );

      const projectId = await createProject(
        server,
        user1.token,
        'Owner Project',
        'owner.com',
      );

      const res = await request(server)
        .get(`/projects/${projectId}/automation-playbooks/estimate`)
        .query({ playbookId: 'missing_seo_title' })
        .set('Authorization', `Bearer ${user2.token}`);

      expect(res.status).toBe(403);
    });

    it('indicates plan_not_eligible for free plan users', async () => {
      const { token } = await signupAndLogin(
        server,
        'playbook-free-plan@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Free Plan Project',
        'free-plan.com',
      );

      await createProduct(projectId, {
        title: 'Product 1',
        externalId: 'ext-1',
        seoTitle: null,
        seoDescription: 'Has description',
      });

      const res = await request(server)
        .get(`/projects/${projectId}/automation-playbooks/estimate`)
        .query({ playbookId: 'missing_seo_title' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      // Free plan users should not be eligible for bulk automations
      expect(res.body).toHaveProperty('planId', 'free');
      expect(res.body.reasons).toContain('plan_not_eligible');
      expect(res.body).toHaveProperty('eligible', false);
    });
  });

  describe('POST /projects/:id/automation-playbooks/apply', () => {
    it('returns 403 for free plan users attempting to apply', async () => {
      const { token } = await signupAndLogin(
        server,
        'playbook-apply-free@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Apply Free Project',
        'apply-free.com',
      );

      await createProduct(projectId, {
        title: 'Product 1',
        externalId: 'ext-1',
        seoTitle: null,
        seoDescription: 'Has description',
      });

      const res = await request(server)
        .post(`/projects/${projectId}/automation-playbooks/apply`)
        .set('Authorization', `Bearer ${token}`)
        .send({ playbookId: 'missing_seo_title' });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('code', 'ENTITLEMENTS_LIMIT_REACHED');
    });

    it('returns 400 when playbookId is missing', async () => {
      const { token } = await signupAndLogin(
        server,
        'playbook-apply-missing@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Apply Missing ID Project',
        'apply-missing.com',
      );

      const res = await request(server)
        .post(`/projects/${projectId}/automation-playbooks/apply`)
        .set('Authorization', `Bearer ${token}`)
        .send({ scopeId: 'some-scope-id' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when scopeId is missing', async () => {
      const { token } = await signupAndLogin(
        server,
        'playbook-apply-missing-scope@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Apply Missing Scope Project',
        'apply-missing-scope.com',
      );

      const res = await request(server)
        .post(`/projects/${projectId}/automation-playbooks/apply`)
        .set('Authorization', `Bearer ${token}`)
        .send({ playbookId: 'missing_seo_title' });

      expect(res.status).toBe(400);
    });

    it('returns 403 when accessing another user project', async () => {
      const user1 = await signupAndLogin(
        server,
        'playbook-apply-owner@example.com',
        'testpassword123',
      );
      const user2 = await signupAndLogin(
        server,
        'playbook-apply-other@example.com',
        'testpassword123',
      );

      const projectId = await createProject(
        server,
        user1.token,
        'Apply Owner Project',
        'apply-owner.com',
      );

      const res = await request(server)
        .post(`/projects/${projectId}/automation-playbooks/apply`)
        .set('Authorization', `Bearer ${user2.token}`)
        .send({ playbookId: 'missing_seo_title' });

      expect(res.status).toBe(403);
    });

    it('returns empty result when no products match playbook criteria', async () => {
      const { token, userId } = await signupAndLogin(
        server,
        'playbook-apply-empty@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Apply Empty Project',
        'apply-empty.com',
      );

      // Upgrade user to pro plan for this test
      await testPrisma.subscription.create({
        data: {
          userId,
          stripeCustomerId: 'cus_test_apply_empty',
          stripeSubscriptionId: 'sub_test_apply_empty',
          status: 'active',
          plan: 'pro',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Create product with SEO title already filled
      await createProduct(projectId, {
        title: 'Product 1',
        externalId: 'ext-1',
        seoTitle: 'Already has title',
        seoDescription: 'Has description',
      });

      // First get estimate to obtain scopeId
      const estimateRes = await request(server)
        .get(`/projects/${projectId}/automation-playbooks/estimate`)
        .query({ playbookId: 'missing_seo_title' })
        .set('Authorization', `Bearer ${token}`);
      const { scopeId } = estimateRes.body;

      const res = await request(server)
        .post(`/projects/${projectId}/automation-playbooks/apply`)
        .set('Authorization', `Bearer ${token}`)
        .send({ playbookId: 'missing_seo_title', scopeId });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalAffectedProducts', 0);
      expect(res.body).toHaveProperty('attemptedCount', 0);
      expect(res.body).toHaveProperty('updatedCount', 0);
      expect(res.body).toHaveProperty('skippedCount', 0);
      expect(res.body).toHaveProperty('limitReached', false);
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results).toHaveLength(0);
    });

    it('returns per-item results with statuses for successful apply', async () => {
      const { token, userId } = await signupAndLogin(
        server,
        'playbook-apply-success@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Apply Success Project',
        'apply-success.com',
      );

      await testPrisma.subscription.create({
        data: {
          userId,
          stripeCustomerId: 'cus_test_apply_success',
          stripeSubscriptionId: 'sub_test_apply_success',
          status: 'active',
          plan: 'pro',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      await createProduct(projectId, {
        title: 'Product 1',
        externalId: 'ext-1',
        seoTitle: null,
        seoDescription: 'Has description',
      });
      await createProduct(projectId, {
        title: 'Product 2',
        externalId: 'ext-2',
        seoTitle: null,
        seoDescription: 'Has description',
      });

      productIssueFixServiceStub.mode = 'success';

      // First get estimate to obtain scopeId
      const estimateRes = await request(server)
        .get(`/projects/${projectId}/automation-playbooks/estimate`)
        .query({ playbookId: 'missing_seo_title' })
        .set('Authorization', `Bearer ${token}`);
      const { scopeId } = estimateRes.body;

      const res = await request(server)
        .post(`/projects/${projectId}/automation-playbooks/apply`)
        .set('Authorization', `Bearer ${token}`)
        .send({ playbookId: 'missing_seo_title', scopeId });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalAffectedProducts', 2);
      expect(res.body).toHaveProperty('attemptedCount', 2);
      expect(res.body).toHaveProperty('updatedCount', 2);
      expect(res.body).toHaveProperty('skippedCount', 0);
      expect(res.body).toHaveProperty('limitReached', false);
      expect(res.body).toHaveProperty('stopped', false);
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results).toHaveLength(2);

      const statuses = (res.body.results as Array<{ status: string }>).map(
        (r) => r.status,
      );
      expect(statuses).toEqual(
        expect.arrayContaining(['UPDATED', 'UPDATED']),
      );
    });

    it('stops on first non-retryable failure and returns FAILED status', async () => {
      const { token, userId } = await signupAndLogin(
        server,
        'playbook-apply-fail@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Apply Fail Project',
        'apply-fail.com',
      );

      await testPrisma.subscription.create({
        data: {
          userId,
          stripeCustomerId: 'cus_test_apply_fail',
          stripeSubscriptionId: 'sub_test_apply_fail',
          status: 'active',
          plan: 'pro',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      await createProduct(projectId, {
        title: 'Product 1',
        externalId: 'ext-1',
        seoTitle: null,
        seoDescription: 'Has description',
      });
      await createProduct(projectId, {
        title: 'Product 2',
        externalId: 'ext-2',
        seoTitle: null,
        seoDescription: 'Has description',
      });
      await createProduct(projectId, {
        title: 'Product 3',
        externalId: 'ext-3',
        seoTitle: null,
        seoDescription: 'Has description',
      });

      productIssueFixServiceStub.mode = 'failOnSecond';

      // First get estimate to obtain scopeId
      const estimateRes = await request(server)
        .get(`/projects/${projectId}/automation-playbooks/estimate`)
        .query({ playbookId: 'missing_seo_title' })
        .set('Authorization', `Bearer ${token}`);
      const { scopeId } = estimateRes.body;

      const res = await request(server)
        .post(`/projects/${projectId}/automation-playbooks/apply`)
        .set('Authorization', `Bearer ${token}`)
        .send({ playbookId: 'missing_seo_title', scopeId });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('attemptedCount', 2);
      expect(res.body).toHaveProperty('updatedCount', 1);
      expect(res.body).toHaveProperty('skippedCount', 0);
      expect(res.body).toHaveProperty('stopped', true);
      expect(res.body).toHaveProperty('failureReason', 'ERROR');
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results).toHaveLength(2);

      const lastResult = res.body.results[res.body.results.length - 1];
      expect(lastResult.status).toBe('FAILED');
      expect(res.body.stoppedAtProductId).toBe(lastResult.productId);
    });

    it('stops with RATE_LIMIT failure after bounded retries', async () => {
      const { token, userId } = await signupAndLogin(
        server,
        'playbook-apply-rate-limit@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Apply Rate Limit Project',
        'apply-rate-limit.com',
      );

      await testPrisma.subscription.create({
        data: {
          userId,
          stripeCustomerId: 'cus_test_apply_rate_limit',
          stripeSubscriptionId: 'sub_test_apply_rate_limit',
          status: 'active',
          plan: 'pro',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      await createProduct(projectId, {
        title: 'Product 1',
        externalId: 'ext-1',
        seoTitle: null,
        seoDescription: 'Has description',
      });
      await createProduct(projectId, {
        title: 'Product 2',
        externalId: 'ext-2',
        seoTitle: null,
        seoDescription: 'Has description',
      });

      productIssueFixServiceStub.mode = 'rateLimitOnSecond';

      // First get estimate to obtain scopeId
      const estimateRes = await request(server)
        .get(`/projects/${projectId}/automation-playbooks/estimate`)
        .query({ playbookId: 'missing_seo_title' })
        .set('Authorization', `Bearer ${token}`);
      const { scopeId } = estimateRes.body;

      const res = await request(server)
        .post(`/projects/${projectId}/automation-playbooks/apply`)
        .set('Authorization', `Bearer ${token}`)
        .send({ playbookId: 'missing_seo_title', scopeId });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('stopped', true);
      expect(res.body).toHaveProperty('failureReason', 'RATE_LIMIT');
      expect(res.body).toHaveProperty('limitReached', false);

      const lastResult = res.body.results[res.body.results.length - 1];
      expect(lastResult.status).toBe('FAILED');
    });

    it('stops with LIMIT_REACHED when daily AI limit is hit mid-run', async () => {
      const { token, userId } = await signupAndLogin(
        server,
        'playbook-apply-daily-limit@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Apply Daily Limit Project',
        'apply-daily-limit.com',
      );

      await testPrisma.subscription.create({
        data: {
          userId,
          stripeCustomerId: 'cus_test_apply_daily_limit',
          stripeSubscriptionId: 'sub_test_apply_daily_limit',
          status: 'active',
          plan: 'pro',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      await createProduct(projectId, {
        title: 'Product 1',
        externalId: 'ext-1',
        seoTitle: null,
        seoDescription: 'Has description',
      });
      await createProduct(projectId, {
        title: 'Product 2',
        externalId: 'ext-2',
        seoTitle: null,
        seoDescription: 'Has description',
      });

      productIssueFixServiceStub.mode = 'dailyLimitOnSecond';

      // First get estimate to obtain scopeId
      const estimateRes = await request(server)
        .get(`/projects/${projectId}/automation-playbooks/estimate`)
        .query({ playbookId: 'missing_seo_title' })
        .set('Authorization', `Bearer ${token}`);
      const { scopeId } = estimateRes.body;

      const res = await request(server)
        .post(`/projects/${projectId}/automation-playbooks/apply`)
        .set('Authorization', `Bearer ${token}`)
        .send({ playbookId: 'missing_seo_title', scopeId });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('stopped', true);
      expect(res.body).toHaveProperty('limitReached', true);
      expect(res.body).toHaveProperty('failureReason', 'LIMIT_REACHED');

      const lastResult = res.body.results[res.body.results.length - 1];
      expect(lastResult.status).toBe('LIMIT_REACHED');
    });

    it('returns 409 when scopeId does not match current scope (scope changed)', async () => {
      const { token, userId } = await signupAndLogin(
        server,
        'playbook-apply-scope-mismatch@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Apply Scope Mismatch Project',
        'apply-scope-mismatch.com',
      );

      await testPrisma.subscription.create({
        data: {
          userId,
          stripeCustomerId: 'cus_test_apply_scope_mismatch',
          stripeSubscriptionId: 'sub_test_apply_scope_mismatch',
          status: 'active',
          plan: 'pro',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Create initial product
      await createProduct(projectId, {
        title: 'Product 1',
        externalId: 'ext-1',
        seoTitle: null,
        seoDescription: 'Has description',
      });

      // Get estimate to obtain scopeId
      const estimateRes = await request(server)
        .get(`/projects/${projectId}/automation-playbooks/estimate`)
        .query({ playbookId: 'missing_seo_title' })
        .set('Authorization', `Bearer ${token}`);
      const { scopeId } = estimateRes.body;

      // Add another product (this changes the scope)
      await createProduct(projectId, {
        title: 'Product 2',
        externalId: 'ext-2',
        seoTitle: null,
        seoDescription: 'Has description',
      });

      // Try to apply with the old scopeId - should fail with 409
      const res = await request(server)
        .post(`/projects/${projectId}/automation-playbooks/apply`)
        .set('Authorization', `Bearer ${token}`)
        .send({ playbookId: 'missing_seo_title', scopeId });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('code', 'PLAYBOOK_SCOPE_INVALID');
      expect(res.body).toHaveProperty('expectedScopeId');
      expect(res.body).toHaveProperty('providedScopeId', scopeId);
      expect(res.body.expectedScopeId).not.toBe(scopeId);
    });
  });

  describe('Playbook ownership and authorization', () => {
    it('estimate endpoint requires authentication', async () => {
      const { token } = await signupAndLogin(
        server,
        'playbook-auth-test@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Auth Test Project',
        'auth-test.com',
      );

      const res = await request(server)
        .get(`/projects/${projectId}/automation-playbooks/estimate`)
        .query({ playbookId: 'missing_seo_title' });

      expect(res.status).toBe(401);
    });

    it('apply endpoint requires authentication', async () => {
      const { token } = await signupAndLogin(
        server,
        'playbook-apply-auth@example.com',
        'testpassword123',
      );
      const projectId = await createProject(
        server,
        token,
        'Apply Auth Project',
        'apply-auth.com',
      );

      const res = await request(server)
        .post(`/projects/${projectId}/automation-playbooks/apply`)
        .send({ playbookId: 'missing_seo_title' });

      expect(res.status).toBe(401);
    });
  });
});
