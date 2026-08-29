# TGMS-84 Deployment, Database Backup and Recovery Runbook

## 1. Deployment decision status

A repository-wide review found **no committed or documented team-approved hosting platform**. There is no Render, Railway, Vercel, Netlify, AWS, Azure, GCP, Docker/Compose, Kubernetes or other hosting manifest/decision in the project. TGMS-84 therefore does not invent a cloud vendor and does not claim that a public production deployment occurred.

This runbook defines the portable production contract that the selected platform must satisfy. Once the team records the target platform, the final platform-specific deployment step can be completed without changing application business contracts.

## 2. Supported production topology

The frontend API client uses relative `/api` URLs. Production should therefore expose **one HTTPS origin**:

```
Browser -> https://tgms.example.com
              |-- /          -> static frontend/dist assets
              `-- /api/*     -> Spring Boot service on PORT (default 3000)
                                    `-> MySQL 8+
```

Use a platform/reverse proxy that supports TLS termination, static SPA fallback to `index.html`, and `/api` reverse proxying. Do not expose MySQL publicly.

## 3. Build artifacts

Prerequisites: Node >=20.19, npm compatible with the lockfile, Java 17.

```
npm ci
npm run verify
npm run build
```

Expected artifacts:

- frontend: `frontend/dist/`
- backend: `backend/target/tgms-backend-0.1.0-SNAPSHOT.jar`

Do not deploy when the verification gate is failing for an application reason.

## 4. Production environment and secrets

Use `docs/deployment/production.env.example` as the **name/shape reference only**. Real values belong in the chosen platform's encrypted secret/environment manager and must never be committed.

Minimum required sensitive values:

- `DB_PASSWORD`
- `JWT_SECRET` (>= 32 random bytes)
- SMTP credentials when `SMTP_ENABLED=true`

Production security requirements:

- `CLIENT_ORIGIN` is the exact public HTTPS origin.
- `COOKIE_SECURE=true` (the `prod` profile also enforces secure cookies).
- `DB_ALLOW_ROLLBACK=false`.
- MySQL is private/restricted to the application and administrative backup path.
- Use a least-privilege application DB user.
- Keep TLS enabled between public clients and the edge/reverse proxy.

Before deployment, load production environment variables into the shell or platform task and run:

```
./scripts/deployment/check-production-env.sh
./scripts/security-check.sh
```

## 5. Safe migration order

Liquibase is the migration source of truth. Never create/alter application tables manually.

For an existing production database:

1. Stop writes or place the application in a maintenance window when a migration can affect live writes.
2. Take a fresh database backup using `mysql-backup.sh`.
3. Record the backup path/checksum and current release commit/tag.
4. Run the migration status command against the production DB.
5. Apply pending Liquibase changesets once.
6. Start the new backend with `SPRING_PROFILES_ACTIVE=prod` (or equivalent platform profile activation).
7. Run the smoke test.
8. Reopen traffic only after smoke checks pass.

The existing commands load `backend/.env`, which is appropriate locally but production platforms commonly inject environment variables directly. In that case run Liquibase/Maven using the same injected variables, or use a temporary protected environment file that is deleted immediately after the release job. Never commit the production file.

The Spring application also applies pending Liquibase changesets at startup. A deployment pipeline should avoid two application instances racing the first migration: run migrations as a single release/pre-deploy task, then start/scale application instances.

## 6. Starting the backend

After building:

```
java -jar backend/target/tgms-backend-0.1.0-SNAPSHOT.jar --spring.profiles.active=prod
```

The platform may supply `PORT`; default backend port is 3000.

## 7. MySQL backup

Prerequisites on the administrative/backup host: `mysqldump`, `gzip`, network access to MySQL, and `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` injected securely.

```
./scripts/deployment/mysql-backup.sh /secure/backups/tgms
```

The script uses `--single-transaction` for a consistent InnoDB logical snapshot, includes triggers/routines/events, writes UTC-dated `.sql.gz`, and avoids putting the password in the command arguments.

After backup:

- verify the file exists and is non-empty;
- store it in access-controlled encrypted storage outside the application host;
- retain copies according to the team's approved retention policy;
- periodically test restore into a non-production database. A backup that has never been restored is not proven recoverable.

TGMS-84 does **not** invent retention/RPO/RTO numbers because the approved documents do not specify them.

## 8. Restore / recovery procedure

A restore is destructive to the target database and must be an approved incident/recovery action.

1. Identify the correct backup and application release/migration version.
2. Prevent application writes to the target database.
3. If the current database is readable, take a final pre-restore backup.
4. Provision/choose the recovery MySQL database.
5. Set production/recovery `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
6. Enable the explicit restore guard only for the restore command:

```
DB_ALLOW_RESTORE=true ./scripts/deployment/mysql-restore.sh /secure/backups/tgms/tgms-....sql.gz --confirm
```

7. Check Liquibase status and apply only migrations newer than the restored backup's schema state.
8. Start one backend instance with the production profile.
9. Run the smoke test.
10. Perform role/ownership/UAT spot checks before reopening traffic.
11. Disable/remove `DB_ALLOW_RESTORE` immediately.

Do not use application migration rollback as a substitute for restoring business data. Liquibase rollback changes schema; database backup/restore recovers persisted records.

## 9. Post-deployment smoke test

Set the real HTTPS origin:

```
TGMS_BASE_URL=https://tgms.example.com ./scripts/deployment/smoke-test.sh
```

The automated smoke test verifies:

1. frontend `/` returns 200;
2. `/api/health` returns 200 and `status=ok`;
3. public `/api/products` returns 200;
4. protected `/api/profile` returns 401 without a session.

After this automated smoke test, manually perform a minimal authenticated check with one non-admin test account and one permitted staff role. Do not perform destructive production mutations merely to smoke-test deployment unless the team has dedicated production test records.

## 10. Roll-forward / rollback approach

Preferred release recovery is **roll forward** with a corrective migration/application release. Before any schema-affecting release, retain a verified backup. The repository's guarded Liquibase rollback command is development-oriented (`DB_ALLOW_ROLLBACK`) and must not be casually enabled in production.

If a release must be reverted:

- revert application binaries/static assets to the previous known-good release only when database compatibility is understood;
- if schema/data recovery is required, follow the approved backup restore procedure;
- rerun migration status and smoke tests before reopening traffic.

## 11. Platform-decision gate (current blocker)

TGMS-84 cannot truthfully satisfy "deployed system starts successfully" on a public deployment until the team records the hosting target and supplies deployment credentials/domain/database service. The final platform decision should record at minimum:

- platform/provider and project/service names;
- public HTTPS domain;
- where the Vite static assets are served;
- how `/api` proxies to Spring Boot;
- managed/self-hosted MySQL location and private-network rules;
- secret manager/environment-variable mechanism;
- pre-deploy migration job mechanism;
- persistent backup destination and retention policy.

Once those facts are approved, run the build/migration/start/smoke sequence above and attach the deployment URL + smoke-test output as TGMS-84 evidence.
