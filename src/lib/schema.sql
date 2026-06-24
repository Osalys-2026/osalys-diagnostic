-- Osalys Diagnostic — Schema Neon (PostgreSQL)

CREATE TABLE IF NOT EXISTS leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom        TEXT NOT NULL,
  nom           TEXT,
  email         TEXT NOT NULL,
  metier        TEXT,
  entreprise    TEXT,
  rgpd_consent  BOOLEAN NOT NULL DEFAULT FALSE,
  status        TEXT DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'contacté', 'client', 'archivé')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_email      ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

CREATE TABLE IF NOT EXISTS passations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       UUID REFERENCES leads(id) ON DELETE SET NULL,
  thematique    TEXT NOT NULL,
  diagnostic    TEXT NOT NULL,
  score         INTEGER NOT NULL,
  profil        TEXT NOT NULL,
  action_post   TEXT CHECK (action_post IN ('rdv', 'site', 'partage')),
  completed_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_passations_lead_id     ON passations(lead_id);
CREATE INDEX IF NOT EXISTS idx_passations_thematique  ON passations(thematique);
CREATE INDEX IF NOT EXISTS idx_passations_completed_at ON passations(completed_at DESC);

CREATE TABLE IF NOT EXISTS diagnostics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thematique    TEXT NOT NULL,
  titre         TEXT NOT NULL,
  description   TEXT,
  duree_estimee INTEGER NOT NULL DEFAULT 10,
  questions     JSONB NOT NULL DEFAULT '[]',
  profils       JSONB NOT NULL DEFAULT '[]',
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hidden_mock_diagnostics (
  diagnostic_id TEXT PRIMARY KEY,
  hidden_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hidden_thematiques (
  thematique_id TEXT PRIMARY KEY,
  hidden_at     TIMESTAMPTZ DEFAULT NOW()
);
