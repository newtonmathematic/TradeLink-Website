import { Client } from "pg";

const sql = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposer_id text NOT NULL,
  proposer_name text NOT NULL,
  recipient_id text NOT NULL,
  recipient_name text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  partner_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft','awaiting_recipient','awaiting_proposer','under_negotiation','accepted','declined','cancelled','expired')),
  awaiting_party text CHECK (awaiting_party IN ('proposer','recipient')),
  current_version_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  unread_for_proposer boolean NOT NULL DEFAULT false,
  unread_for_recipient boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS proposal_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  created_by text NOT NULL,
  created_by_role text NOT NULL CHECK (created_by_role IN ('proposer','recipient')),
  created_at timestamptz NOT NULL DEFAULT now(),
  step_data jsonb NOT NULL,
  changes_summary text,
  updated_steps text[],
  UNIQUE (proposal_id, version_number)
);

ALTER TABLE proposals
  ADD CONSTRAINT proposals_current_version_fk
  FOREIGN KEY (current_version_id) REFERENCES proposal_versions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS proposal_versions_proposal_idx ON proposal_versions(proposal_id);

CREATE TABLE IF NOT EXISTS proposal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  sender_id text NOT NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('proposer','recipient')),
  sender_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('message','status_change','system','negotiation_request','negotiation_response')),
  content text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS proposal_messages_proposal_idx ON proposal_messages(proposal_id);
CREATE INDEX IF NOT EXISTS proposal_messages_created_idx ON proposal_messages(created_at DESC);

CREATE TABLE IF NOT EXISTS proposal_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('new_proposal','status_change','negotiation_update','message')),
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb,
  action_url text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS proposal_notifications_user_idx ON proposal_notifications(user_id);
CREATE INDEX IF NOT EXISTS proposal_notifications_user_read_idx ON proposal_notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS proposal_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  reported_by text NOT NULL,
  reporter_role text NOT NULL CHECK (reporter_role IN ('proposer','recipient')),
  reason text NOT NULL,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS proposal_reports_proposal_idx ON proposal_reports(proposal_id);

CREATE TABLE IF NOT EXISTS business_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id text NOT NULL,
  blocked_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);
`;

async function migrate() {
  const connectionString =
    process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL/SUPABASE_DB_URL is not configured");
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("Proposals migration completed");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Proposals migration failed", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

migrate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
