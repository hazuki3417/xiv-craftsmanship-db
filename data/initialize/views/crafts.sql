-- public.crafts source
CREATE MATERIALIZED VIEW public.crafts TABLESPACE pg_default AS
SELECT
    r.id AS recipe_id,
    i.id AS item_id,
    i.name,
    i.level AS item_level,
    r.pieces,
    r.job,
    r.level AS recipe_level
FROM
    recipes r
    JOIN items i ON r.item_id = i.id
WITH
    DATA;

-- View indexes:
CREATE INDEX crafts_name_idx ON public.crafts USING btree (name);
