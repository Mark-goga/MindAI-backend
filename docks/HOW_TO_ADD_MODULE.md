# How to Add a New Module

Step-by-step reference for creating a feature module with DB access from scratch.
Use the `releases` module as the reference implementation.

---

## 1. Add enums (if needed)

If the table needs enum columns, add them to `src/common/database/schema/enums.schema.ts` **first**.
Always export a `as const` array, a TS type, and the Drizzle `pgEnum` — all three together:

```typescript
// enums.schema.ts
export const STATUS_VALUES = ['draft', 'published', 'archived'] as const;
export type Status = (typeof STATUS_VALUES)[number];
export const statusEnum = pgEnum('status', STATUS_VALUES);
```

Then export from `src/common/database/schema/index.ts`:

```typescript
export { statusEnum, STATUS_VALUES } from './enums.schema';
export type { Status } from './enums.schema';
```

---

## 2. Create the DB schema

`src/common/database/schema/<table>.schema.ts`:

```typescript
import { pgTable, uuid, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { createUuid } from '@common/utils/uuid.util';
import { statusEnum } from './enums.schema';

export const articles = pgTable('articles', {
  id: uuid('id').$defaultFn(createUuid).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  status: statusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, table => [index('articles_status_idx').on(table.status)],);
```

Export from `src/common/database/schema/index.ts`:

```typescript
export { articles } from './articles.schema';
```

Then generate the migration:

```bash
yarn db:generate
```

---

## 3. Create folder structure

```
src/modules/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── <feature>.repository.ts
└── dto/
    └── index.ts
```

---

## 4. Add endpoint constants

`src/common/constants/endpoints.constants.ts`:

```typescript
export const ENDPOINTS = {
  // ... existing

  ARTICLES: {
    BASE: 'articles', LIST: {
      ENDPOINT: '', DOCKS: { summary: 'List articles', description: 'Returns all published articles' },
    }, CREATE: {
      ENDPOINT: '', DOCKS: { summary: 'Create article', description: 'Creates a new article (admin only)' },
    }, DELETE: {
      ENDPOINT: ':id', DOCKS: { summary: 'Delete article', description: 'Deletes an article by id (admin only)' },
    },
  },
} as const;
```

---

## 5. Add error messages

`src/common/constants/error-messages.constants.ts`:

```typescript
export const ERROR_MESSAGES = {
  // ... existing

  ARTICLES: {
    NOT_FOUND: 'Article was not found.', TITLE_CONFLICT: 'An article with this title already exists.',
  },
} as const;
```

---

## 6. Create DTOs

`src/modules/<feature>/dto/create-<entity>.dto.ts`:

```typescript
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { STATUS_VALUES } from '@common/database/schema';

const createArticleSchema = z.object({
  title: z.string().trim().min(1).max(255), status: z.enum(STATUS_VALUES).default('draft'),
});

export class CreateArticleDto extends createZodDto(createArticleSchema) {
}
```

`src/modules/<feature>/dto/index.ts`:

```typescript
export { CreateArticleDto } from './create-article.dto';
```

---

## 7. Create the repository

`src/modules/<feature>/<feature>.repository.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '@common/database/database.service';
import { articles } from '@common/database/schema';

@Injectable()
export class ArticlesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(input: typeof articles.$inferInsert) {
    const [article] = await this.databaseService.db
      .insert(articles)
      .values(input)
      .returning();
    return article;
  }

  async findAll() {
    return this.databaseService.db.select().from(articles);
  }

  async deleteById(id: string) {
    const [deleted] = await this.databaseService.db
      .delete(articles)
      .where(eq(articles.id, id))
      .returning();
    return deleted ?? null;
  }
}
```

---

## 8. Create the service

`src/modules/<feature>/<feature>.service.ts`:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { ERROR_MESSAGES } from '@common/constants';
import { ArticlesRepository } from './articles.repository';
import { CreateArticleDto } from './dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly articlesRepository: ArticlesRepository) {}

  async create(dto: CreateArticleDto) {
    return this.articlesRepository.create(dto);
  }

  async findAll() {
    return this.articlesRepository.findAll();
  }

  async delete(id: string) {
    const deleted = await this.articlesRepository.deleteById(id);
    if (!deleted) throw new NotFoundException(ERROR_MESSAGES.ARTICLES.NOT_FOUND);
    return { deleted: true };
  }
}
```

---

## 9. Create the controller

`src/modules/<feature>/<feature>.controller.ts`:

```typescript
import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ENDPOINTS } from '@common/constants';
import { AccessTokenGuard, AdminGuard } from '@common/guards';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto';

@Controller(ENDPOINTS.ARTICLES.BASE)
@ApiTags(ENDPOINTS.ARTICLES.BASE)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get(ENDPOINTS.ARTICLES.LIST.ENDPOINT) @ApiOperation(ENDPOINTS.ARTICLES.LIST.DOCKS) findAll() {
    return this.articlesService.findAll();
  }

  @Post(ENDPOINTS.ARTICLES.CREATE.ENDPOINT) @ApiBearerAuth() @ApiOperation(ENDPOINTS.ARTICLES.CREATE.DOCKS) @UseGuards(AccessTokenGuard, AdminGuard) create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @Delete(ENDPOINTS.ARTICLES.DELETE.ENDPOINT) @HttpCode(200) @ApiBearerAuth() @ApiOperation(ENDPOINTS.ARTICLES.DELETE.DOCKS) @UseGuards(AccessTokenGuard, AdminGuard) delete(@Param('id') id: string) {
    return this.articlesService.delete(id);
  }
}
```

---

## 10. Create the module

`src/modules/<feature>/<feature>.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ArticlesRepository } from './articles.repository';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService, ArticlesRepository], // exports: [ArticlesService],  ← add only if other modules need it
})
export class ArticlesModule {
}
```

---

## 11. Register in AppModule

`src/app.module.ts`:

```typescript
import { ArticlesModule } from '@modules/articles/articles.module';

@Module({
  imports: [DatabaseModule, HealthModule, AuthModule, ReleasesModule, ArticlesModule,   // ← add here
  ],
})
export class AppModule {
}
```

---

## 12. Create a seed script

**Every new table must have a seed script.** No exceptions.

`src/common/database/seed-data/seed-<table>.ts`:

```typescript
import { articles } from '@common/database/schema';
import type { SeedContext } from './seed-shared';

const SEED_ARTICLES = [{ title: 'Getting started', status: 'published' as const }, {
  title: 'Advanced usage',
  status: 'published' as const
}, { title: 'Upcoming features', status: 'draft' as const },];

export async function seedArticles(context: SeedContext): Promise<number> {
  console.log(`Seeding ${SEED_ARTICLES.length} articles...`);
  await context.db.insert(articles).values(SEED_ARTICLES).onConflictDoNothing();
  return SEED_ARTICLES.length;
}
```

Register in **`seed.ts`** (runs everything):

```typescript
import { seedArticles } from './seed-articles';

// inside main():
await seedArticles(context);
```

Register in **`seed-runner.ts`** (CLI targets):

```typescript
import { seedArticles } from './seed-articles';

const seeders = {
  // ...existing targets...
  articles: async () => {
    const context = createSeedContext();
    try {
      await seedArticles(context);
    } finally {
      await context.close();
    }
  }, all: async () => {
    const context = createSeedContext();
    try {
      const users = await seedUsers(context);
      await seedSessions(context, users);
      await seedReleases(context);
      await seedArticles(context);   // ← add here
    } finally {
      await context.close();
    }
  },
};
```

---

## 13. Write tests

`<feature>.service.spec.ts` — test business logic with mocked repository.
`<feature>.controller.spec.ts` — test HTTP layer with mocked service.

---

## Checklist

- [ ] Enums added to `enums.schema.ts` (if needed), exported from schema `index.ts`
- [ ] Table schema created in `common/database/schema/<table>.schema.ts`
- [ ] Schema exported from `common/database/schema/index.ts`
- [ ] Migration generated with `yarn db:generate`
- [ ] Folder created under `src/modules/<feature>/`
- [ ] `ENDPOINTS.<FEATURE>` added to `endpoints.constants.ts`
- [ ] `ERROR_MESSAGES.<FEATURE>` added to `error-messages.constants.ts`
- [ ] DTOs created with Zod + `createZodDto`, using `STATUS_VALUES` not hardcoded strings
- [ ] `dto/index.ts` exports all DTOs
- [ ] Repository created — all Drizzle queries live here, nowhere else
- [ ] Service has only business logic (no HTTP concerns, no direct DB calls)
- [ ] Controller uses `ENDPOINTS` constants (no inline strings)
- [ ] Module file registers controller + providers
- [ ] Module imported in `app.module.ts`
- [ ] **Seed script created** in `common/database/seed-data/seed-<table>.ts`
- [ ] **Seed registered** in both `seed.ts` and `seed-runner.ts`
- [ ] Unit tests for service and controller
- [ ] No types/utils duplicated from `common/`
