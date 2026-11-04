import {
  pgTable,
  serial,
  varchar,
  text,
  date,
  timestamp,
  integer,
  boolean,
  bigint,
  pgEnum,
  index,
  uniqueIndex,
  AnyPgColumn,
} from "drizzle-orm/pg-core";

export const administrationStatusEnum = pgEnum(
  "administration_status",
  ["upcoming", "current", "past"]
);

export const executiveStatusEnum = pgEnum(
  "executive_status",
  ["active", "inactive"]
);

export const adminRoleEnum = pgEnum("admin_role", [
  "super_admin",
  "admin",
  "media_team",
]);

export const adminStatusEnum = pgEnum("admin_status", [
  "active",
  "inactive",
]);

export const programmeCategoryEnum = pgEnum("programme_category", [
  "worship",
  "prayer",
  "bible_study",
  "conference",
  "seminar",
  "outreach",
  "fellowship",
  "other",
]);

export const programmeStatusEnum = pgEnum("programme_status", [
  "draft",
  "published",
  "cancelled",
  "completed",
]);

export const mediaCategoryEnum = pgEnum("media_category", [
  "flyer",
  "image",
  "video",
  "document",
  "audio",
  "logo",
  "other",
]);

export const mediaVisibilityEnum = pgEnum("media_visibility", [
  "private",
  "pending",
  "published",
  "archived",
]);

export const announcementStatusEnum = pgEnum("announcement_status", [
  "draft",
  "published",
  "archived",
]);

export const birthdayVisibilityEnum = pgEnum("birthday_visibility", [
  "public",
  "executive",
  "private",
]);

export const mediaAssetStatusEnum = pgEnum("media_asset_status", [
  "draft",
  "approved",
  "archived",
]);

export const mediaRequestStatusEnum = pgEnum("media_request_status", [
  "pending",
  "in_review",
  "assigned",
  "approved",
  "rejected",
  "completed",
]);

export const mediaTaskStatusEnum = pgEnum("media_task_status", [
  "pending",
  "in_progress",
  "submitted",
  "approved",
  "rejected",
  "archived",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "publish",
  "archive",
  "approve",
  "reject",
  "login",
  "logout",
]);

export const administrations = pgTable(
  "administrations",
  {
    id: serial("id").primaryKey(),

    name: varchar("name", { length: 150 }).notNull(),

    slug: varchar("slug", { length: 180 }).notNull().unique(),

    description: text("description"),

    startDate: date("start_date"),

    endDate: date("end_date"),

    status: administrationStatusEnum("status")
      .notNull()
      .default("upcoming"),

    isFeatured: boolean("is_featured").notNull().default(false),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("administrations_status_idx").on(table.status),
  ]
);

export const executives = pgTable(
  "executives",
  {
    id: serial("id").primaryKey(),

    administrationId: integer("administration_id")
      .notNull()
      .references(() => administrations.id, {
        onDelete: "restrict",
      }),

    fullName: varchar("full_name", { length: 150 }).notNull(),

    position: varchar("position", { length: 120 }).notNull(),

    email: varchar("email", { length: 255 }),

    photoUrl: text("photo_url"),

    biography: text("biography"),

    displayOrder: integer("display_order").notNull().default(0),

    status: executiveStatusEnum("status")
      .notNull()
      .default("active"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("executives_administration_idx").on(table.administrationId),
    index("executives_position_idx").on(table.position),
  ]
);

export const adminUsers = pgTable(
  "admin_users",
  {
    id: serial("id").primaryKey(),

    fullName: varchar("full_name", { length: 150 }).notNull(),

    email: varchar("email", { length: 255 }).notNull(),

    passwordHash: text("password_hash").notNull(),

    role: adminRoleEnum("role").notNull().default("admin"),

    status: adminStatusEnum("status").notNull().default("active"),

    lastLoginAt: timestamp("last_login_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("admin_users_email_unique").on(table.email),
    index("admin_users_role_idx").on(table.role),
    index("admin_users_status_idx").on(table.status),
  ]
);

export const programmes = pgTable(
  "programmes",
  {
    id: serial("id").primaryKey(),

    title: varchar("title", { length: 200 }).notNull(),

    slug: varchar("slug", { length: 220 }).notNull().unique(),

    description: text("description"),

    category: programmeCategoryEnum("category")
      .notNull()
      .default("other"),

    startDate: date("start_date").notNull(),

    endDate: date("end_date"),

    startTime: varchar("start_time", { length: 20 }),

    endTime: varchar("end_time", { length: 20 }),

    venue: varchar("venue", { length: 255 }),

    imageUrl: text("image_url"),

    registrationUrl: text("registration_url"),

    status: programmeStatusEnum("status")
      .notNull()
      .default("draft"),

    isFeatured: boolean("is_featured")
      .notNull()
      .default(false),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("programmes_status_idx").on(table.status),
    index("programmes_category_idx").on(table.category),
    index("programmes_start_date_idx").on(table.startDate),
    index("programmes_featured_idx").on(table.isFeatured),
  ]
);

export const mediaFolders = pgTable(
  "media_folders",
  {
    id: serial("id").primaryKey(),

    name: varchar("name", { length: 150 }).notNull(),

    description: text("description"),

    // Supports folders inside other folders.
    parentFolderId: integer("parent_folder_id").references(
      (): AnyPgColumn => mediaFolders.id,
      { onDelete: "set null" }
    ),

    // Optional association with a particular administration.
    administrationId: integer("administration_id").references(
      () => administrations.id,
      { onDelete: "set null" }
    ),

    createdBy: integer("created_by").references(
      () => adminUsers.id,
      { onDelete: "set null" }
    ),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("media_folders_parent_idx").on(table.parentFolderId),
    index("media_folders_administration_idx").on(
      table.administrationId
    ),
  ]
);

export const announcements = pgTable(
  "announcements",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull().unique(),
    summary: text("summary"),
    content: text("content").notNull(),
    category: varchar("category", { length: 80 }).notNull().default("announcement"),
    status: announcementStatusEnum("status").notNull().default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    publishedAt: timestamp("published_at"),
    createdBy: integer("created_by").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("announcements_status_idx").on(table.status),
    index("announcements_category_idx").on(table.category),
    index("announcements_featured_idx").on(table.isFeatured),
  ]
);

export const birthdayRecords = pgTable(
  "birthday_records",
  {
    id: serial("id").primaryKey(),
    fullName: varchar("full_name", { length: 150 }).notNull(),
    month: integer("month").notNull(),
    day: integer("day").notNull(),
    visibility: birthdayVisibilityEnum("visibility").notNull().default("public"),
    isOptedOut: boolean("is_opted_out").notNull().default(false),
    notes: text("notes"),
    createdBy: integer("created_by").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("birthday_records_month_day_idx").on(table.month, table.day),
    index("birthday_records_visibility_idx").on(table.visibility),
  ]
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    category: mediaCategoryEnum("category").notNull().default("image"),
    status: mediaAssetStatusEnum("status").notNull().default("draft"),
    visibility: mediaVisibilityEnum("visibility").notNull().default("private"),
    fileUrl: text("file_url").notNull(),
    storageKey: varchar("storage_key", { length: 100 }).unique(),
    thumbnailUrl: text("thumbnail_url"),
    mimeType: varchar("mime_type", { length: 120 }),
    fileSize: bigint("file_size", { mode: "number" }),
    uploadedBy: integer("uploaded_by").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    folderId: integer("folder_id").references(() => mediaFolders.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("media_assets_status_idx").on(table.status),
    index("media_assets_category_idx").on(table.category),
    index("media_assets_visibility_idx").on(table.visibility),
  ]
);

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedBy: integer("updated_by").references(() => adminUsers.id, {
    onDelete: "set null",
  }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mediaRequests = pgTable(
  "media_requests",
  {
    id: serial("id").primaryKey(),
    requesterName: varchar("requester_name", { length: 150 }).notNull(),
    requesterEmail: varchar("requester_email", { length: 255 }),
    requestType: varchar("request_type", { length: 120 }).notNull(),
    programmeName: varchar("programme_name", { length: 200 }),
    description: text("description").notNull(),
    deadline: date("deadline"),
    status: mediaRequestStatusEnum("status").notNull().default("pending"),
    createdBy: integer("created_by").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("media_requests_status_idx").on(table.status),
    index("media_requests_deadline_idx").on(table.deadline),
  ]
);

export const mediaTasks = pgTable(
  "media_tasks",
  {
    id: serial("id").primaryKey(),
    requestId: integer("request_id").references(() => mediaRequests.id, {
      onDelete: "cascade",
    }),
    title: varchar("title", { length: 200 }).notNull(),
    assigneeName: varchar("assignee_name", { length: 150 }),
    deadline: date("deadline"),
    status: mediaTaskStatusEnum("status").notNull().default("pending"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("media_tasks_status_idx").on(table.status),
    index("media_tasks_request_idx").on(table.requestId),
  ]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    actorId: integer("actor_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    action: auditActionEnum("action").notNull(),
    entityType: varchar("entity_type", { length: 120 }).notNull(),
    entityId: integer("entity_id"),
    details: text("details"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_actor_idx").on(table.actorId),
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  ]
);