# ELEVANTE — Database Design

> **Engine:** Supabase PostgreSQL (15+)  
> **Primary Reference:** [ProjectBrief.md](./ProjectBrief.md) §7 & §8  
> **Companion Docs:** [ARCHITECTURE.md](./ARCHITECTURE.md) | [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)

---

## 1. Design Principles

1. **Relational Integrity First:** Use UUID primary keys (`gen_random_uuid()`), explicit foreign keys, `CHECK` constraints, and PostgreSQL enums for fixed workflow states.
2. **Auditability & History Immutability:** Historical records (`project_requests`, `project_form_responses`, `quotations`, `project_status_history`, `audit_logs`) snapshot critical display fields or prevent destructive deletion via `ON DELETE RESTRICT` / soft deletes (`deleted_at`).
3. **Monetary Precision:** Store all prices and quotation line items in integer minor units (`bigint` — e.g., paise/cents) alongside ISO 4217 currency code (`text`, e.g., `INR`, `USD`) to prevent floating-point rounding bugs.
4. **Files Metadata Only in DB:** Store actual binaries in Supabase Storage (`public-media`, `project-attachments`, `project-deliverables`) and persist bucket, object path, size, MIME type, and ownership in PostgreSQL.
5. **Defense-in-Depth via RLS:** Every application table enables Row Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).

---

## 2. Entity-Relationship Overview

```text
auth.users (Supabase Auth)
   │ 1:1
   ▼
profiles ───────────────────► roles ◄──► role_permissions ◄──► permissions
   │ 1:N                         
   ├──► enquiries (optional assigned_to)
   ├──► team_members (optional 1:1 link for agency staff/founders)
   ├──► notifications
   ├──► audit_logs (actor_id)
   └──► project_requests (customer_id / assigned_to)
           │
           ├──► services ◄── service_categories
           │       └──► service_form_fields
           ├──► project_form_responses (snapshots field_key/label/type)
           ├──► project_status_history
           ├──► project_messages ──► project_files
           ├──► quotations ──► quotation_items
           ├──► deliverables
           └──► payment_records (schema ready for future gateway integration)

Public CMS & Showcase:
- media_assets
- portfolio_projects (links services & media_assets)
- testimonials (links portfolio_projects & media_assets)
- faqs (optional service_id)
- site_sections (page_key + section_key + jsonb content/seo)
- platform_settings (key/value agency & workflow config)
```

---

## 3. PostgreSQL Enums

- `project_status`: `'submitted'`, `'under_review'`, `'clarification_needed'`, `'quoted'`, `'quote_accepted'`, `'in_progress'`, `'review_ready'`, `'revision_requested'`, `'completed'`, `'cancelled'`
- `project_priority`: `'low'`, `'normal'`, `'high'`, `'urgent'`
- `quotation_status`: `'draft'`, `'sent'`, `'viewed'`, `'accepted'`, `'revision_requested'`, `'declined'`, `'expired'`
- `pricing_mode`: `'quote_only'`, `'starting_from'`, `'fixed_estimate'`
- `form_field_type`: `'text'`, `'textarea'`, `'number'`, `'email'`, `'url'`, `'date'`, `'select'`, `'multiselect'`, `'radio'`, `'checkbox'`, `'file'`
- `message_type`: `'message'`, `'clarification_request'`, `'clarification_response'`, `'system'`
- `enquiry_status`: `'new'`, `'contacted'`, `'converted'`, `'archived'`
- `media_type`: `'image'`, `'video'`, `'document'`
- `payment_status`: `'pending'`, `'authorized'`, `'paid'`, `'failed'`, `'refunded'`

---

## 4. Table Specifications

### 4.1 Identity, Roles & Team

#### `roles`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `slug` | `text` | UNIQUE, NOT NULL (`customer`, `staff`, `admin`, `super_admin`) |
| `name` | `text` | NOT NULL |
| `description` | `text` | |
| `is_system` | `boolean` | NOT NULL, default `true` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

#### `permissions`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `code` | `text` | UNIQUE, NOT NULL (e.g., `services.manage`, `quotations.send`, `audit.read`, `team.manage`) |
| `module` | `text` | NOT NULL |
| `description` | `text` | |

#### `role_permissions`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `role_id` | `uuid` | PK (composite), FK -> `roles(id)` ON DELETE CASCADE |
| `permission_id` | `uuid` | PK (composite), FK -> `permissions(id)` ON DELETE CASCADE |

#### `profiles`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK, FK -> `auth.users(id)` ON DELETE CASCADE |
| `role_id` | `uuid` | NOT NULL, FK -> `roles(id)` ON DELETE RESTRICT |
| `full_name` | `text` | NOT NULL |
| `email` | `text` | UNIQUE, NOT NULL |
| `phone` | `text` | |
| `company_name` | `text` | |
| `job_title` | `text` | |
| `avatar_path` | `text` | Path in `public-media` or private avatar path |
| `is_active` | `boolean` | NOT NULL, default `true` |
| `last_seen_at` | `timestamptz` | |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` |

#### `team_members`
*(Manages public founder/team presentation and internal roster metadata)*
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `profile_id` | `uuid` | UNIQUE nullable FK -> `profiles(id)` ON DELETE SET NULL |
| `full_name` | `text` | NOT NULL |
| `role_title` | `text` | NOT NULL (e.g., `Founder`, `Co-Founder`) |
| `is_founder` | `boolean` | NOT NULL, default `false` |
| `bio` | `text` | |
| `avatar_media_id` | `uuid` | Nullable FK -> `media_assets(id)` ON DELETE SET NULL |
| `social_links` | `jsonb` | NOT NULL, default `'{}'::jsonb` |
| `display_order` | `integer` | NOT NULL, default `0` |
| `is_public` | `boolean` | NOT NULL, default `true` |
| `is_active` | `boolean` | NOT NULL, default `true` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` |

---

### 4.2 Dynamic Services & Form Builder

#### `service_categories`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL |
| `slug` | `text` | UNIQUE, NOT NULL |
| `description` | `text` | |
| `icon_name` | `text` | Lucide / custom icon identifier |
| `display_order` | `integer` | NOT NULL, default `0` |
| `is_published` | `boolean` | NOT NULL, default `false` |
| `seo_title` | `text` | |
| `seo_description` | `text` | |
| `deleted_at` | `timestamptz` | Soft delete safety |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` |

#### `services`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `category_id` | `uuid` | NOT NULL, FK -> `service_categories(id)` ON DELETE RESTRICT |
| `title` | `text` | NOT NULL |
| `slug` | `text` | UNIQUE, NOT NULL |
| `short_description` | `text` | NOT NULL |
| `full_description` | `text` | NOT NULL |
| `deliverables` | `jsonb` | Array of structured deliverables (`string[]`), default `'[]'` |
| `features` | `jsonb` | Array of capabilities/features (`string[]`), default `'[]'` |
| `tech_stack` | `text[]` | Default `'{}'` |
| `estimated_timeline` | `text` | e.g., `"2–4 weeks"` |
| `pricing_mode` | `pricing_mode` | NOT NULL, default `'quote_only'` |
| `starting_price_minor` | `bigint` | Nullable, `CHECK (starting_price_minor IS NULL OR starting_price_minor >= 0)` |
| `currency` | `text` | NOT NULL, default `'INR'` |
| `thumbnail_media_id` | `uuid` | Nullable FK -> `media_assets(id)` ON DELETE SET NULL |
| `display_order` | `integer` | NOT NULL, default `0` |
| `is_featured` | `boolean` | NOT NULL, default `false` |
| `is_published` | `boolean` | NOT NULL, default `false` |
| `seo_title` | `text` | |
| `seo_description` | `text` | |
| `deleted_at` | `timestamptz` | Soft delete safety |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` |

#### `service_form_fields`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `service_id` | `uuid` | NOT NULL, FK -> `services(id)` ON DELETE CASCADE |
| `field_key` | `text` | NOT NULL, snake_case identifier, UNIQUE `(service_id, field_key)` |
| `label` | `text` | NOT NULL |
| `field_type` | `form_field_type` | NOT NULL |
| `placeholder` | `text` | |
| `help_text` | `text` | |
| `options` | `jsonb` | For `select`/`multiselect`/`radio` (`[{ label, value }]`), default `'[]'` |
| `validation_rules` | `jsonb` | `{ min, max, pattern, accept, maxFiles }`, default `'{}'` |
| `is_required` | `boolean` | NOT NULL, default `false` |
| `display_order` | `integer` | NOT NULL, default `0` |
| `is_active` | `boolean` | NOT NULL, default `true` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` |

---

### 4.3 Project Requests, Workflow, Quotations & Messaging

#### `project_requests`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `project_code` | `text` | UNIQUE, NOT NULL (generated via DB sequence e.g. `ELV-2026-0001`) |
| `customer_id` | `uuid` | NOT NULL, FK -> `profiles(id)` ON DELETE RESTRICT |
| `service_id` | `uuid` | NOT NULL, FK -> `services(id)` ON DELETE RESTRICT |
| `assigned_to` | `uuid` | Nullable FK -> `profiles(id)` ON DELETE SET NULL |
| `title` | `text` | NOT NULL |
| `summary` | `text` | NOT NULL |
| `status` | `project_status` | NOT NULL, default `'submitted'` |
| `priority` | `project_priority` | NOT NULL, default `'normal'` |
| `desired_deadline` | `date` | Nullable |
| `budget_range` | `text` | Optional customer indication |
| `form_schema_snapshot` | `jsonb` | Immutable snapshot of form fields at submission time |
| `submitted_at` | `timestamptz` | NOT NULL, default `now()` |
| `completed_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` |

#### `project_form_responses`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `project_id` | `uuid` | NOT NULL, FK -> `project_requests(id)` ON DELETE CASCADE |
| `field_id` | `uuid` | Nullable FK -> `service_form_fields(id)` ON DELETE SET NULL |
| `field_key` | `text` | NOT NULL (snapshot) |
| `field_label` | `text` | NOT NULL (snapshot) |
| `field_type` | `form_field_type` | NOT NULL (snapshot) |
| `response_value` | `jsonb` | NOT NULL |
| `display_order` | `integer` | NOT NULL, default `0` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

#### `quotations`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `project_id` | `uuid` | NOT NULL, FK -> `project_requests(id)` ON DELETE CASCADE |
| `quote_number` | `text` | UNIQUE, NOT NULL (e.g. `QT-2026-0001`) |
| `version` | `integer` | NOT NULL, default `1`, UNIQUE `(project_id, version)` |
| `title` | `text` | NOT NULL |
| `scope_summary` | `text` | NOT NULL |
| `subtotal_minor` | `bigint` | NOT NULL, `CHECK (subtotal_minor >= 0)` |
| `discount_minor` | `bigint` | NOT NULL, default `0`, `CHECK (discount_minor >= 0)` |
| `tax_minor` | `bigint` | NOT NULL, default `0`, `CHECK (tax_minor >= 0)` |
| `total_minor` | `bigint` | NOT NULL, `CHECK (total_minor >= 0)` |
| `currency` | `text` | NOT NULL, default `'INR'` |
| `estimated_duration` | `text` | |
| `terms` | `text` | |
| `status` | `quotation_status` | NOT NULL, default `'draft'` |
| `valid_until` | `date` | Nullable |
| `customer_response_note` | `text` | |
| `created_by` | `uuid` | NOT NULL, FK -> `profiles(id)` ON DELETE RESTRICT |
| `sent_at` | `timestamptz` | Nullable |
| `responded_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` |

#### `quotation_items`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `quotation_id` | `uuid` | NOT NULL, FK -> `quotations(id)` ON DELETE CASCADE |
| `title` | `text` | NOT NULL |
| `description` | `text` | |
| `quantity` | `integer` | NOT NULL, default `1`, `CHECK (quantity > 0)` |
| `unit_price_minor` | `bigint` | NOT NULL, `CHECK (unit_price_minor >= 0)` |
| `line_total_minor` | `bigint` | NOT NULL, `CHECK (line_total_minor >= 0)` |
| `display_order` | `integer` | NOT NULL, default `0` |

#### `project_status_history`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `project_id` | `uuid` | NOT NULL, FK -> `project_requests(id)` ON DELETE CASCADE |
| `from_status` | `project_status` | Nullable (null on initial creation) |
| `to_status` | `project_status` | NOT NULL |
| `changed_by` | `uuid` | Nullable FK -> `profiles(id)` ON DELETE SET NULL |
| `note` | `text` | |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

#### `project_messages`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `project_id` | `uuid` | NOT NULL, FK -> `project_requests(id)` ON DELETE CASCADE |
| `sender_id` | `uuid` | NOT NULL, FK -> `profiles(id)` ON DELETE RESTRICT |
| `message_type` | `message_type` | NOT NULL, default `'message'` |
| `body` | `text` | NOT NULL |
| `is_internal_note` | `boolean` | NOT NULL, default `false` (hidden from customers via RLS!) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

---

### 4.4 Files, Deliverables & Media

#### `media_assets`
*(Public CMS & portfolio library stored in `public-media`)*
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `bucket` | `text` | NOT NULL, default `'public-media'` |
| `storage_path` | `text` | UNIQUE, NOT NULL |
| `public_url` | `text` | NOT NULL |
| `file_name` | `text` | NOT NULL |
| `mime_type` | `text` | NOT NULL |
| `file_size` | `bigint` | NOT NULL, `CHECK (file_size > 0)` |
| `media_type` | `media_type` | NOT NULL |
| `alt_text` | `text` | |
| `caption` | `text` | |
| `uploaded_by` | `uuid` | Nullable FK -> `profiles(id)` ON DELETE SET NULL |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

#### `project_files`
*(Private reference files & message attachments in `project-attachments`)*
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `project_id` | `uuid` | NOT NULL, FK -> `project_requests(id)` ON DELETE CASCADE |
| `message_id` | `uuid` | Nullable FK -> `project_messages(id)` ON DELETE SET NULL |
| `uploaded_by` | `uuid` | NOT NULL, FK -> `profiles(id)` ON DELETE RESTRICT |
| `bucket` | `text` | NOT NULL, default `'project-attachments'` |
| `storage_path` | `text` | UNIQUE, NOT NULL |
| `original_filename` | `text` | NOT NULL |
| `mime_type` | `text` | NOT NULL |
| `file_size` | `bigint` | NOT NULL, `CHECK (file_size > 0)` |
| `purpose` | `text` | NOT NULL (`'reference'`, `'message_attachment'`) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

#### `deliverables`
*(Private final client files in `project-deliverables`)*
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `project_id` | `uuid` | NOT NULL, FK -> `project_requests(id)` ON DELETE CASCADE |
| `uploaded_by` | `uuid` | NOT NULL, FK -> `profiles(id)` ON DELETE RESTRICT |
| `title` | `text` | NOT NULL |
| `description` | `text` | |
| `version_label` | `text` | Default `'v1.0'` |
| `bucket` | `text` | NOT NULL, default `'project-deliverables'` |
| `storage_path` | `text` | UNIQUE, NOT NULL |
| `original_filename` | `text` | NOT NULL |
| `mime_type` | `text` | NOT NULL |
| `file_size` | `bigint` | NOT NULL, `CHECK (file_size > 0)` |
| `is_customer_accessible` | `boolean` | NOT NULL, default `true` |
| `download_count` | `integer` | NOT NULL, default `0` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

---

### 4.5 Public Showcase, CMS, Enquiries & Operations

#### `portfolio_projects`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `service_id` | `uuid` | Nullable FK -> `services(id)` ON DELETE SET NULL |
| `title` | `text` | NOT NULL |
| `slug` | `text` | UNIQUE, NOT NULL |
| `client_name` | `text` | |
| `industry` | `text` | |
| `summary` | `text` | NOT NULL |
| `challenge` | `text` | |
| `solution` | `text` | |
| `outcomes` | `jsonb` | Default `'[]'` |
| `tech_stack` | `text[]` | Default `'{}'` |
| `live_url` | `text` | |
| `cover_media_id` | `uuid` | Nullable FK -> `media_assets(id)` ON DELETE SET NULL |
| `gallery_media_ids` | `uuid[]` | Default `'{}'` |
| `display_order` | `integer` | NOT NULL, default `0` |
| `is_featured` | `boolean` | NOT NULL, default `false` |
| `is_published` | `boolean` | NOT NULL, default `false` |
| `seo_title` | `text` | |
| `seo_description` | `text` | |
| `deleted_at` | `timestamptz` | |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` |

#### `testimonials`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `portfolio_project_id` | `uuid` | Nullable FK -> `portfolio_projects(id)` ON DELETE SET NULL |
| `author_name` | `text` | NOT NULL |
| `author_role` | `text` | |
| `company` | `text` | |
| `quote` | `text` | NOT NULL |
| `rating` | `smallint` | Nullable, `CHECK (rating BETWEEN 1 AND 5)` |
| `avatar_media_id` | `uuid` | Nullable FK -> `media_assets(id)` ON DELETE SET NULL |
| `display_order` | `integer` | NOT NULL, default `0` |
| `is_featured` | `boolean` | NOT NULL, default `false` |
| `is_published` | `boolean` | NOT NULL, default `false` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` |

#### `faqs`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `category` | `text` | NOT NULL, default `'general'` |
| `service_id` | `uuid` | Nullable FK -> `services(id)` ON DELETE SET NULL |
| `question` | `text` | NOT NULL |
| `answer` | `text` | NOT NULL |
| `display_order` | `integer` | NOT NULL, default `0` |
| `is_published` | `boolean` | NOT NULL, default `false` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` |

#### `site_sections`
*(Admin-managed headings, descriptions, media references, legal copy, and SEO per page/section)*
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `page_key` | `text` | NOT NULL (`home`, `about`, `services`, `portfolio`, `contact`, `faq`, `privacy`, `terms`) |
| `section_key` | `text` | NOT NULL (`hero`, `intro`, `process`, `why_elevante`, `seo`, etc.) — UNIQUE `(page_key, section_key)` |
| `title` | `text` | |
| `subtitle` | `text` | |
| `content` | `jsonb` | NOT NULL, default `'{}'` |
| `seo_metadata` | `jsonb` | NOT NULL, default `'{}'` |
| `is_published` | `boolean` | NOT NULL, default `true` |
| `updated_by` | `uuid` | Nullable FK -> `profiles(id)` ON DELETE SET NULL |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` |

#### `enquiries`
*(Public contact form submissions)*
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL |
| `email` | `text` | NOT NULL |
| `phone` | `text` | |
| `company` | `text` | |
| `service_interest` | `text` | |
| `subject` | `text` | NOT NULL |
| `message` | `text` | NOT NULL |
| `status` | `enquiry_status` | NOT NULL, default `'new'` |
| `assigned_to` | `uuid` | Nullable FK -> `profiles(id)` ON DELETE SET NULL |
| `converted_project_id` | `uuid` | Nullable FK -> `project_requests(id)` ON DELETE SET NULL |
| `internal_notes` | `text` | |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` |

#### `notifications`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `user_id` | `uuid` | NOT NULL, FK -> `profiles(id)` ON DELETE CASCADE |
| `type` | `text` | NOT NULL (`project_submitted`, `quote_sent`, `message_received`, `deliverable_added`, etc.) |
| `title` | `text` | NOT NULL |
| `body` | `text` | NOT NULL |
| `link_url` | `text` | |
| `is_read` | `boolean` | NOT NULL, default `false` |
| `read_at` | `timestamptz` | Nullable |
| `metadata` | `jsonb` | NOT NULL, default `'{}'` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

#### `audit_logs`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `actor_id` | `uuid` | Nullable FK -> `profiles(id)` ON DELETE SET NULL |
| `actor_email` | `text` | Snapshot for retention |
| `action` | `text` | NOT NULL (e.g., `service.published`, `quotation.sent`, `role.updated`) |
| `entity_type` | `text` | NOT NULL |
| `entity_id` | `uuid` | Nullable |
| `old_values` | `jsonb` | |
| `new_values` | `jsonb` | |
| `ip_address` | `text` | |
| `user_agent` | `text` | |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

#### `platform_settings`
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `key` | `text` | PK (`agency_profile`, `default_currency`, `upload_limits`, `notification_prefs`, etc.) |
| `value` | `jsonb` | NOT NULL |
| `description` | `text` | |
| `is_public` | `boolean` | NOT NULL, default `false` |
| `updated_by` | `uuid` | Nullable FK -> `profiles(id)` ON DELETE SET NULL |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` |

#### `payment_records` *(Future Payment Integration Readiness)*
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `uuid` | PK |
| `project_id` | `uuid` | NOT NULL, FK -> `project_requests(id)` ON DELETE RESTRICT |
| `quotation_id` | `uuid` | Nullable FK -> `quotations(id)` ON DELETE RESTRICT |
| `customer_id` | `uuid` | NOT NULL, FK -> `profiles(id)` ON DELETE RESTRICT |
| `provider` | `text` | NOT NULL (e.g., `razorpay`, `stripe`, `manual`) |
| `provider_payment_id` | `text` | |
| `amount_minor` | `bigint` | NOT NULL, `CHECK (amount_minor > 0)` |
| `currency` | `text` | NOT NULL |
| `status` | `payment_status` | NOT NULL, default `'pending'` |
| `metadata` | `jsonb` | NOT NULL, default `'{}'` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` |

#### `rate_limits` *(Serverless Public Endpoint Protection)*
| Column | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `key` | `text` | PK (`action:ip_or_user`) |
| `window_start` | `timestamptz` | NOT NULL |
| `request_count` | `integer` | NOT NULL, default `1` |

---

## 5. Indexing Strategy

- **Foreign Keys & User Lookups:** Index `profiles(role_id)`, `services(category_id)`, `service_form_fields(service_id, display_order)`, `project_requests(customer_id, created_at DESC)`, `project_requests(assigned_to, status)`, `project_requests(status, created_at DESC)`, `quotations(project_id, version DESC)`, `project_messages(project_id, created_at ASC)`, `project_files(project_id)`, `deliverables(project_id)`.
- **Inbox & Feeds:** Partial index on `notifications(user_id, created_at DESC) WHERE is_read = false`.
- **Public Catalog & SEO Slugs:** Partial indexes `WHERE is_published = true AND deleted_at IS NULL` on `service_categories(display_order)`, `services(category_id, display_order)`, `portfolio_projects(display_order)`, `testimonials(display_order)`, `faqs(category, display_order)`.
- **Audit & Enquiries:** `audit_logs(created_at DESC)`, `audit_logs(entity_type, entity_id)`, `enquiries(status, created_at DESC)`.

---

## 6. Row Level Security (RLS) Policy Matrix

SQL helper functions (`SECURITY DEFINER`, `SET search_path = public`):
- `public.current_user_role()` -> returns role slug for `auth.uid()`.
- `public.is_admin_or_staff()` -> `true` if role is `'staff'`, `'admin'`, or `'super_admin'`.
- `public.is_admin()` -> `true` if role is `'admin'` or `'super_admin'`.

| Table | `anon` (Public) | `customer` (Authenticated) | `staff` | `admin` / `super_admin` |
| :--- | :--- | :--- | :--- | :--- |
| `service_categories`, `services`, `portfolio_projects`, `testimonials`, `faqs` | `SELECT` published & non-deleted only | Same as public | `SELECT` all | Full CRUD |
| `service_form_fields` | `SELECT` active fields of published services | Same as public | `SELECT` all | Full CRUD |
| `site_sections`, `media_assets` | `SELECT` published sections / public assets | Same as public | `SELECT` all | Full CRUD |
| `platform_settings` | `SELECT` where `is_public = true` | Same as public | `SELECT` public/non-sensitive | `super_admin` full CRUD (`admin` read/limited update) |
| `team_members` | `SELECT` where `is_public = true` & `is_active = true` | Same | `SELECT` all | Full CRUD |
| `profiles` | None | `SELECT`/`UPDATE` own row (cannot modify `role_id` or `is_active`) | `SELECT` assigned project clients + own | Full read/manage (`super_admin` changes roles) |
| `project_requests`, `project_form_responses`, `project_status_history` | None | `SELECT` own; `INSERT` own (`project_requests` + responses) | `SELECT`/`UPDATE` assigned projects | Full CRUD |
| `quotations`, `quotation_items` | None | `SELECT` for own project (status != `'draft'`); response update via RPC/Server Action | `SELECT` assigned | Full CRUD |
| `project_messages` | None | `SELECT` non-internal for own project; `INSERT` own | `SELECT`/`INSERT` assigned (incl. internal notes) | Full CRUD |
| `project_files` | None | `SELECT`/`INSERT` for own project | `SELECT`/`INSERT` assigned | Full CRUD |
| `deliverables` | None | `SELECT` for own project where `is_customer_accessible = true` | `SELECT`/`INSERT` assigned | Full CRUD |
| `notifications` | None | `SELECT`/`UPDATE` (`is_read`) own | Same (own) | Same + system insert via service role |
| `enquiries` | `INSERT` via server-rate-limited action/API (or no direct anon table access — prefer server-role insert after Zod + rate limit!) | None | `SELECT` assigned | Full CRUD |
| `audit_logs` | None | None | None | `SELECT` only (append-only via server-role / triggers) |
| `payment_records` | None | `SELECT` own | None | `SELECT` (`super_admin`/`admin`) |
| `rate_limits` | None | None | None | None (RPC `SECURITY DEFINER` / service role only) |

> **Security Note on `enquiries`:** Routing public `/contact` submissions through a Next.js Server Action / Route Handler that runs rate limiting + Zod validation and inserts via `service_role` allows keeping direct `anon` writes disabled on `enquiries` in RLS, eliminating unauthenticated PostgREST spam!

---

## 7. Future Database Expansion Considerations

- **Milestone Billing & Invoices:** `payment_records` already links `project_id`, `quotation_id`, and `customer_id`; adding `payment_milestones` and `invoices` later requires zero breaking migrations on existing projects.
- **Client Organizations / Multi-Seat Clients:** Currently `project_requests.customer_id` references `profiles`. Later, an `organizations` + `organization_members` table can be introduced with a nullable `organization_id` on `project_requests`.
- **Supabase Realtime Subscriptions:** `project_messages` and `notifications` schemas already contain cleanly scoped `project_id` and `user_id` keys suitable for RLS-secured Realtime channels later.

