/// <reference path="../.astro/types.d.ts" />

import type { SessionPayload } from './lib/auth/jwt';

declare namespace App {
  interface Locals {
    session: SessionPayload | null;
  }
}

interface ImportMetaEnv {
  readonly MONGODB_URI: string;
  readonly JWT_SECRET: string;
  readonly S3_BUCKET: string;
  readonly S3_REGION: string;
  readonly S3_ACCESS_KEY: string;
  readonly S3_SECRET_KEY: string;
  readonly CLOUDFRONT_URL: string;
  readonly VERCEL_BUILD_HOOK: string;
  readonly BOOTSTRAP_ADMIN_EMAIL?: string;
  readonly BOOTSTRAP_ADMIN_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
