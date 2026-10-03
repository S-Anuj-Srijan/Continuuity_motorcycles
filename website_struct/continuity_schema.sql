-- Continuity Motors experimental website
-- Cloudflare D1 / SQLite schema
-- v1

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  product_id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  public_name TEXT NOT NULL,
  family_name TEXT NOT NULL,
  internal_label TEXT,
  status TEXT NOT NULL DEFAULT 'concept',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
  asset_id TEXT PRIMARY KEY,
  product_id TEXT,
  asset_type TEXT NOT NULL,
  path TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE IF NOT EXISTS experiments (
  experiment_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  hypothesis TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  started_at TEXT,
  ended_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experiment_variants (
  variant_id TEXT PRIMARY KEY,
  experiment_id TEXT NOT NULL,
  product_id TEXT,
  label TEXT NOT NULL,
  allocation_weight REAL NOT NULL DEFAULT 0.5,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE IF NOT EXISTS visitors (
  visitor_id TEXT PRIMARY KEY,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  first_utm_source TEXT,
  first_utm_medium TEXT,
  first_utm_campaign TEXT,
  first_referrer_domain TEXT,
  analytics_consent TEXT,
  consent_updated_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  visitor_id TEXT,
  experiment_id TEXT,
  assigned_variant_id TEXT,
  assignment_method TEXT,
  experiment_version TEXT,

  started_at TEXT NOT NULL,
  last_activity_at TEXT NOT NULL,
  ended_at TEXT,

  landing_path TEXT NOT NULL,
  entry_product_id TEXT,
  first_product_id TEXT,
  last_product_id TEXT,
  exposure_order_json TEXT,

  referrer_domain TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,

  device_type TEXT,
  browser_family TEXT,
  os_family TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,

  country_code TEXT,
  region_code TEXT,

  analytics_consent TEXT,
  is_test_traffic INTEGER NOT NULL DEFAULT 0,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id),
  FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id),
  FOREIGN KEY (assigned_variant_id) REFERENCES experiment_variants(variant_id),
  FOREIGN KEY (entry_product_id) REFERENCES products(product_id),
  FOREIGN KEY (first_product_id) REFERENCES products(product_id),
  FOREIGN KEY (last_product_id) REFERENCES products(product_id)
);

CREATE TABLE IF NOT EXISTS product_exposures (
  exposure_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  experiment_id TEXT,
  variant_id TEXT,
  exposure_order INTEGER,
  source_page TEXT,
  first_visible_at TEXT NOT NULL,
  last_visible_at TEXT,
  active_ms INTEGER NOT NULL DEFAULT 0,
  max_scroll_pct REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id),
  FOREIGN KEY (variant_id) REFERENCES experiment_variants(variant_id)
);

CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  visitor_id TEXT,

  event_name TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  server_received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  client_seq INTEGER,

  experiment_id TEXT,
  variant_id TEXT,
  experiment_version TEXT,

  product_id TEXT,
  page_path TEXT NOT NULL,
  section_id TEXT,
  element_id TEXT,
  asset_id TEXT,

  elapsed_ms INTEGER,
  value_num REAL,
  value_text TEXT,
  metadata_json TEXT,

  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id),
  FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id),
  FOREIGN KEY (variant_id) REFERENCES experiment_variants(variant_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
);

CREATE TABLE IF NOT EXISTS session_product_summary (
  session_id TEXT NOT NULL,
  product_id TEXT NOT NULL,

  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  first_exposure_order INTEGER,

  product_active_ms INTEGER NOT NULL DEFAULT 0,
  hero_active_ms INTEGER NOT NULL DEFAULT 0,
  silhouette_active_ms INTEGER NOT NULL DEFAULT 0,
  engineering_active_ms INTEGER NOT NULL DEFAULT 0,
  views_board_active_ms INTEGER NOT NULL DEFAULT 0,
  details_active_ms INTEGER NOT NULL DEFAULT 0,
  poster_active_ms INTEGER NOT NULL DEFAULT 0,

  max_scroll_pct REAL NOT NULL DEFAULT 0,

  asset_opens INTEGER NOT NULL DEFAULT 0,
  asset_zooms INTEGER NOT NULL DEFAULT 0,
  technical_interactions INTEGER NOT NULL DEFAULT 0,
  spec_expands INTEGER NOT NULL DEFAULT 0,
  share_clicks INTEGER NOT NULL DEFAULT 0,
  cta_clicks INTEGER NOT NULL DEFAULT 0,

  lead_form_started INTEGER NOT NULL DEFAULT 0,
  lead_submitted INTEGER NOT NULL DEFAULT 0,

  switches_away INTEGER NOT NULL DEFAULT 0,
  switches_to INTEGER NOT NULL DEFAULT 0,
  returned_after_switch INTEGER NOT NULL DEFAULT 0,

  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (session_id, product_id),
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE IF NOT EXISTS leads (
  lead_id TEXT PRIMARY KEY,
  session_id TEXT,
  product_id TEXT,
  experiment_id TEXT,
  variant_id TEXT,

  email TEXT NOT NULL,
  email_normalized TEXT NOT NULL,
  email_hash TEXT,

  marketing_consent INTEGER NOT NULL DEFAULT 0,
  analytics_consent TEXT,
  source TEXT NOT NULL DEFAULT 'early_access',

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id),
  FOREIGN KEY (variant_id) REFERENCES experiment_variants(variant_id)
);

CREATE TABLE IF NOT EXISTS conversions (
  conversion_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  lead_id TEXT,
  product_id TEXT,
  experiment_id TEXT,
  variant_id TEXT,

  conversion_type TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  metadata_json TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  FOREIGN KEY (lead_id) REFERENCES leads(lead_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id),
  FOREIGN KEY (variant_id) REFERENCES experiment_variants(variant_id)
);

-- High-value indexes.
CREATE INDEX IF NOT EXISTS idx_sessions_started_at
  ON sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_sessions_experiment_variant
  ON sessions(experiment_id, assigned_variant_id, started_at);

CREATE INDEX IF NOT EXISTS idx_sessions_utm
  ON sessions(utm_source, utm_campaign, started_at);

CREATE INDEX IF NOT EXISTS idx_events_session_time
  ON events(session_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_events_name_product_time
  ON events(event_name, product_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_events_experiment_variant_time
  ON events(experiment_id, variant_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_exposures_session_product
  ON product_exposures(session_id, product_id);

CREATE INDEX IF NOT EXISTS idx_summary_product
  ON session_product_summary(product_id, last_seen_at);

CREATE INDEX IF NOT EXISTS idx_leads_created_at
  ON leads(created_at);

CREATE INDEX IF NOT EXISTS idx_leads_product
  ON leads(product_id, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_email_normalized
  ON leads(email_normalized);

CREATE INDEX IF NOT EXISTS idx_conversions_type_product_time
  ON conversions(conversion_type, product_id, occurred_at);

-- Seed current products.
INSERT OR IGNORE INTO products (
  product_id, slug, public_name, family_name, internal_label, status
) VALUES
  ('c01_camel', 'camel', 'C-01 Camel', 'C-01', 'camel', 'concept'),
  ('c01_messerschmitt', 'messerschmitt', 'C-01 Messerschmitt', 'C-01', 'messerschmitt', 'concept');

-- Seed stable asset IDs.
INSERT OR IGNORE INTO assets (asset_id, product_id, asset_type, path, alt_text, sort_order) VALUES
  ('brand_logo_primary', NULL, 'logo', '/assets/brand/continuity-logo.png', 'Continuity Motors logo.', 0),

  ('camel_hero_side', 'c01_camel', 'hero', '/assets/products/c01/camel/hero-side.png',
   'Side profile of the Continuity C-01 Camel electric motorcycle in racing green.', 10),
  ('camel_views_board', 'c01_camel', 'views_board', '/assets/products/c01/camel/views-board.png',
   'C-01 Camel multi-view design board showing side, front, rear, top and three-quarter views.', 20),
  ('camel_poster_hangar', 'c01_camel', 'poster', '/assets/products/c01/camel/poster-hangar.png',
   'Continuity C-01 Camel electric motorcycle in a wet aircraft hangar setting.', 30),
  ('camel_engineering_board', 'c01_camel', 'engineering_board', '/assets/products/c01/camel/engineering-board.png',
   'C-01 Camel engineering layout showing concept electric powertrain components.', 40),

  ('messerschmitt_hero_side', 'c01_messerschmitt', 'hero', '/assets/products/c01/messerschmitt/hero-side.png',
   'Side profile of the Continuity C-01 Messerschmitt electric motorcycle in racing green.', 10),
  ('messerschmitt_views_board', 'c01_messerschmitt', 'views_board', '/assets/products/c01/messerschmitt/views-board.png',
   'C-01 Messerschmitt multi-view design board showing side, front, rear, top and three-quarter views.', 20),
  ('messerschmitt_poster_hangar', 'c01_messerschmitt', 'poster', '/assets/products/c01/messerschmitt/poster-hangar.png',
   'Continuity C-01 Messerschmitt electric motorcycle beside a vintage aircraft in a wet hangar setting.', 30),
  ('messerschmitt_engineering_board', 'c01_messerschmitt', 'engineering_board', '/assets/products/c01/messerschmitt/engineering-board.png',
   'C-01 Messerschmitt engineering layout showing concept electric powertrain components.', 40);

-- Seed experiment shell.
INSERT OR IGNORE INTO experiments (
  experiment_id, name, version, hypothesis, status
) VALUES (
  'c01_direction_v1',
  'C-01 product direction validation',
  '1',
  'Under equivalent presentation, Camel and Messerschmitt will produce measurably different depth and intent signals.',
  'draft'
);

INSERT OR IGNORE INTO experiment_variants (
  variant_id, experiment_id, product_id, label, allocation_weight
) VALUES
  ('c01_direction_v1_camel', 'c01_direction_v1', 'c01_camel', 'Camel first', 0.5),
  ('c01_direction_v1_messerschmitt', 'c01_direction_v1', 'c01_messerschmitt', 'Messerschmitt first', 0.5);
