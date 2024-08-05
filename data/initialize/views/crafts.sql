-- public.crafts source
CREATE MATERIALIZED VIEW public.crafts TABLESPACE pg_default AS
WITH
    crafts AS (
        SELECT DISTINCT
            recipe.parent_item_id
        FROM
            recipe
    )
SELECT
    crafts.parent_item_id AS item_id,
    items.name AS item_name
FROM
    items
    JOIN crafts ON items.id = crafts.parent_item_id
WITH
    DATA;

-- View indexes:
CREATE UNIQUE INDEX crafts_name_idx ON public.crafts USING btree (item_name);
