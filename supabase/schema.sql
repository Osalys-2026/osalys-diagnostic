-- ============================================================
-- Osalys Diagnostic — Schema Supabase (PostgreSQL)
-- Version 1.0
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Thématiques ───────────────────────────────────────────
CREATE TABLE thematiques (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL,
  titre       TEXT NOT NULL,
  subtitle    TEXT,
  accroche    TEXT,
  icone       TEXT,
  couleur     TEXT,
  ordre       INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Diagnostics ───────────────────────────────────────────
CREATE TABLE diagnostics (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thematique_id   UUID REFERENCES thematiques(id) ON DELETE CASCADE,
  titre           TEXT NOT NULL,
  description     TEXT,
  duree_estimee   INTEGER DEFAULT 5, -- minutes
  is_published    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Questions ─────────────────────────────────────────────
CREATE TABLE questions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagnostic_id   UUID REFERENCES diagnostics(id) ON DELETE CASCADE,
  texte           TEXT NOT NULL,
  type_reponse    TEXT CHECK (type_reponse IN ('likert', 'choice', 'slider')) NOT NULL,
  poids           NUMERIC(4,2) DEFAULT 1.0,
  ordre           INTEGER NOT NULL,
  slider_min_label TEXT,
  slider_max_label TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Options de réponse ────────────────────────────────────
CREATE TABLE options_reponse (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id   UUID REFERENCES questions(id) ON DELETE CASCADE,
  texte         TEXT NOT NULL,
  valeur_score  NUMERIC(5,2) NOT NULL,
  ordre         INTEGER NOT NULL
);

-- ─── Profils résultat ──────────────────────────────────────
CREATE TABLE profils_resultat (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagnostic_id   UUID REFERENCES diagnostics(id) ON DELETE CASCADE,
  score_min       INTEGER NOT NULL,
  score_max       INTEGER NOT NULL,
  label           TEXT NOT NULL,
  analyse         TEXT,
  points_force    TEXT[] DEFAULT '{}',
  axes_dev        TEXT[] DEFAULT '{}',
  cta_message     TEXT,
  CHECK (score_min >= 0 AND score_max <= 100 AND score_min <= score_max)
);

-- ─── Leads ─────────────────────────────────────────────────
CREATE TABLE leads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- ─── Passations ────────────────────────────────────────────
CREATE TABLE passations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id         UUID REFERENCES leads(id) ON DELETE SET NULL,
  diagnostic_id   UUID REFERENCES diagnostics(id) ON DELETE SET NULL,
  profil_id       UUID REFERENCES profils_resultat(id) ON DELETE SET NULL,
  score           INTEGER,
  reponses        JSONB DEFAULT '{}',   -- { question_id: valeur_score }
  action_post     TEXT CHECK (action_post IN ('rdv', 'site', 'partage', null)),
  completed_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_passations_lead_id      ON passations(lead_id);
CREATE INDEX idx_passations_diagnostic_id ON passations(diagnostic_id);
CREATE INDEX idx_passations_completed_at  ON passations(completed_at DESC);

-- ─── Config globale ────────────────────────────────────────
CREATE TABLE config (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calendrier_url    TEXT,
  site_url          TEXT DEFAULT 'https://osalys.fr',
  email_expediteur  TEXT DEFAULT 'diagnostic@osalys.fr',
  email_template    TEXT,
  retention_mois    INTEGER DEFAULT 24,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO config (calendrier_url, site_url) VALUES
  ('https://calendly.com/osalys', 'https://osalys.fr');

-- ─── Row Level Security ────────────────────────────────────

-- Leads : lecture admin uniquement
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_only_leads" ON leads
  USING (auth.role() = 'authenticated');

-- Passations : écriture publique (insert via Edge Function), lecture admin
ALTER TABLE passations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert_passations" ON passations
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read_passations" ON passations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Thématiques, diagnostics, questions : lecture publique
ALTER TABLE thematiques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_thematiques" ON thematiques
  FOR SELECT USING (is_active = true);

ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_diagnostics" ON diagnostics
  FOR SELECT USING (is_published = true);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_questions" ON questions
  FOR SELECT USING (true);

ALTER TABLE options_reponse ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_options" ON options_reponse
  FOR SELECT USING (true);

ALTER TABLE profils_resultat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_profils" ON profils_resultat
  FOR SELECT USING (true);

-- ─── Vue analytics (agrégées, sans PII) ───────────────────
CREATE VIEW analytics_diagnostics AS
SELECT
  d.titre                             AS diagnostic,
  t.titre                             AS thematique,
  COUNT(p.id)                         AS nb_passations,
  ROUND(AVG(p.score))                 AS score_moyen,
  ROUND(AVG(p.score) FILTER (WHERE p.action_post = 'rdv') * 100.0 / NULLIF(COUNT(p.id), 0)) AS taux_rdv_pct,
  DATE_TRUNC('week', p.completed_at)  AS semaine
FROM passations p
JOIN diagnostics d ON d.id = p.diagnostic_id
JOIN thematiques t ON t.id = d.thematique_id
GROUP BY d.titre, t.titre, DATE_TRUNC('week', p.completed_at)
ORDER BY semaine DESC;

-- ─── Fonction updated_at automatique ──────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_diagnostics_updated_at
  BEFORE UPDATE ON diagnostics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
