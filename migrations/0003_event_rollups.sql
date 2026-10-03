-- Triggers keep append-only event ingestion and rollups atomic and retry-safe.
-- No baseline columns or tables are removed or renamed.
CREATE TRIGGER IF NOT EXISTS event_product_rollup AFTER INSERT ON events
WHEN NEW.product_id IS NOT NULL
BEGIN
  INSERT INTO session_product_summary(session_id,product_id,first_seen_at,last_seen_at,first_exposure_order)
  VALUES(NEW.session_id,NEW.product_id,NEW.occurred_at,NEW.occurred_at,
    (SELECT COUNT(*)+1 FROM session_product_summary WHERE session_id=NEW.session_id))
  ON CONFLICT(session_id,product_id) DO UPDATE SET last_seen_at=MAX(last_seen_at,excluded.last_seen_at);

  INSERT INTO product_exposures(exposure_id,session_id,product_id,experiment_id,variant_id,exposure_order,source_page,first_visible_at,last_visible_at)
  SELECT NEW.session_id||'_'||NEW.product_id,NEW.session_id,NEW.product_id,NEW.experiment_id,NEW.variant_id,first_exposure_order,NEW.page_path,NEW.occurred_at,NEW.occurred_at
  FROM session_product_summary WHERE session_id=NEW.session_id AND product_id=NEW.product_id
  ON CONFLICT(exposure_id) DO UPDATE SET last_visible_at=MAX(last_visible_at,excluded.last_visible_at);

  UPDATE session_product_summary SET
    product_active_ms=product_active_ms+CASE WHEN NEW.event_name='session_summary' THEN COALESCE(NEW.elapsed_ms,0) ELSE 0 END,
    hero_active_ms=hero_active_ms+CASE WHEN NEW.event_name='section_engagement' AND NEW.section_id='hero' THEN COALESCE(NEW.elapsed_ms,0) ELSE 0 END,
    silhouette_active_ms=silhouette_active_ms+CASE WHEN NEW.event_name='section_engagement' AND NEW.section_id='form' THEN COALESCE(NEW.elapsed_ms,0) ELSE 0 END,
    engineering_active_ms=engineering_active_ms+CASE WHEN NEW.event_name='section_engagement' AND NEW.section_id='engineering' THEN COALESCE(NEW.elapsed_ms,0) ELSE 0 END,
    views_board_active_ms=views_board_active_ms+CASE WHEN NEW.event_name='section_engagement' AND NEW.section_id='views-board' THEN COALESCE(NEW.elapsed_ms,0) ELSE 0 END,
    details_active_ms=details_active_ms+CASE WHEN NEW.event_name='section_engagement' AND NEW.section_id='details' THEN COALESCE(NEW.elapsed_ms,0) ELSE 0 END,
    poster_active_ms=poster_active_ms+CASE WHEN NEW.event_name='section_engagement' AND NEW.section_id='poster' THEN COALESCE(NEW.elapsed_ms,0) ELSE 0 END,
    max_scroll_pct=MAX(max_scroll_pct,CASE WHEN NEW.event_name='scroll_summary' THEN COALESCE(NEW.value_num,0) ELSE 0 END),
    asset_opens=asset_opens+(NEW.event_name='asset_open'),
    asset_zooms=asset_zooms+(NEW.event_name='asset_zoom'),
    technical_interactions=technical_interactions+(NEW.event_name='technical_hotspot_open'),
    spec_expands=spec_expands+(NEW.event_name='spec_expand'),
    share_clicks=share_clicks+(NEW.event_name='share_click'),
    cta_clicks=cta_clicks+(NEW.event_name='cta_click'),
    lead_form_started=MAX(lead_form_started,NEW.event_name='lead_form_start'),
    switches_away=switches_away+(NEW.event_name='variant_switch'),
    switches_to=switches_to+CASE WHEN NEW.event_name='product_view' AND (SELECT last_product_id FROM sessions WHERE session_id=NEW.session_id) IS NOT NULL AND (SELECT last_product_id FROM sessions WHERE session_id=NEW.session_id)!=NEW.product_id THEN 1 ELSE 0 END,
    returned_after_switch=MAX(returned_after_switch,CASE WHEN NEW.event_name='product_view' AND (SELECT last_product_id FROM sessions WHERE session_id=NEW.session_id)!=NEW.product_id AND EXISTS(SELECT 1 FROM events WHERE session_id=NEW.session_id AND product_id=NEW.product_id AND event_name='product_view' AND event_id!=NEW.event_id) THEN 1 ELSE 0 END),
    updated_at=CURRENT_TIMESTAMP
  WHERE session_id=NEW.session_id AND product_id=NEW.product_id;

  UPDATE product_exposures SET active_ms=(SELECT product_active_ms FROM session_product_summary WHERE session_id=NEW.session_id AND product_id=NEW.product_id),max_scroll_pct=(SELECT max_scroll_pct FROM session_product_summary WHERE session_id=NEW.session_id AND product_id=NEW.product_id) WHERE exposure_id=NEW.session_id||'_'||NEW.product_id;
  UPDATE sessions SET first_product_id=COALESCE(first_product_id,NEW.product_id),
    last_product_id=CASE WHEN NEW.event_name='product_view' THEN NEW.product_id ELSE last_product_id END,
    exposure_order_json=(SELECT json_group_array(product_id) FROM (SELECT product_id FROM session_product_summary WHERE session_id=NEW.session_id ORDER BY first_exposure_order))
  WHERE session_id=NEW.session_id;
END;

CREATE TRIGGER IF NOT EXISTS conversion_product_rollup AFTER INSERT ON conversions
WHEN NEW.product_id IS NOT NULL
BEGIN
  INSERT INTO session_product_summary(session_id,product_id,first_seen_at,last_seen_at,lead_submitted)
  VALUES(NEW.session_id,NEW.product_id,NEW.occurred_at,NEW.occurred_at,1)
  ON CONFLICT(session_id,product_id) DO UPDATE SET lead_submitted=1,last_seen_at=MAX(last_seen_at,excluded.last_seen_at),updated_at=CURRENT_TIMESTAMP;
END;
