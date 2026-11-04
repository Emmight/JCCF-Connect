# API local setup

1. Configure `apps/api/.env` with a local PostgreSQL `DATABASE_URL`, a random `JWT_SECRET` of at least 32 characters, and the web origin in `CLIENT_URL`. Set `MEDIA_STORAGE_PATH` to a private writable directory.
2. From the workspace root, apply migrations with `pnpm --dir apps/api db:migrate`.
3. Create a local administrator with `pnpm --dir apps/api db:seed-admin` after setting `ADMIN_NAME`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD`.
4. To populate a local demo database, explicitly run `SEED_SAMPLE_DATA=true pnpm --dir apps/api db:seed:sample`. Sample programmes, announcements, birthday records, and media stay unpublished; sample executives stay inactive; sample administrations stay upcoming. Review and replace all sample information before publishing it.
5. Start the API with `pnpm --dir apps/api dev`.

The sample seeder refuses to run unless `SEED_SAMPLE_DATA=true` is set. Re-running it also returns its known sample records to non-public states. Confirm the database target before running migrations or seed commands. Local filesystem media storage is suitable for development only; deployments should use private persistent object storage and a backup/retention policy.