# Database Plan

## 1. Tables

### `questions`
| Column      | Type           | Constraints                                    |
|-------------|---------------|------------------------------------------------|
| `id`        | `uuid`        | primary key, default `uuid_generate_v4()`      |
| `user_id`   | `uuid`        | not null, references `auth.users(id)`          |
| `content`   | `text`        | not null, check length between 20 and 300 chars|
| `position`  | `smallint`    | not null, check value between 1 and 5          |
| `practiced` | `boolean`     | not null, default `false`                      |
| `created_at`| `timestamptz` | not null, default `now()`                      |

*Seed data will include sample questions linked to a test user.*

## 2. Relationships
- `questions.user_id` → `auth.users.id` (one-to-many)

## 3. Indexes
- primary key on `questions(id)`
- index on `questions(user_id)`

## 4. Row-Level Security Policies for `questions`
1. **Enable RLS** on table.
2. **Select**: allow if `user_id = auth.uid()`.
3. **Insert**: allow if `auth.uid() = user_id`.
4. **Update**: allow if `user_id = auth.uid()`.
5. **Delete**: no policy (deletion disabled).

## 5. Additional Notes
- Job ad text is not stored; API validates length 100–10 000 characters.
- Only the `practiced` flag is updated after insertion; question content is immutable.
- The `auth.users` table comes from **Supabase Auth** and handles all user accounts.
