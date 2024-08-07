-- public.material_tree source
CREATE MATERIALIZED VIEW public.material_tree TABLESPACE pg_default AS
WITH RECURSIVE
    material_tree AS (
        SELECT
            r.parent_item_id,
            ip.name AS parent_name,
            r.child_item_id,
            ic.name AS child_name,
            r.quantity AS unit,
            r.quantity * 1 AS total,
            1 AS depth
        FROM
            recipe r
            JOIN items ip ON r.parent_item_id = ip.id
            JOIN items ic ON r.child_item_id = ic.id
        UNION ALL
        SELECT
            rt_1.parent_item_id,
            rt_1.parent_name,
            r.child_item_id,
            ic.name AS child_name,
            r.quantity AS unit,
            r.quantity * rt_1.total AS total,
            rt_1.depth + 1 AS depth
        FROM
            material_tree rt_1
            JOIN recipe r ON rt_1.child_item_id = r.parent_item_id
            JOIN items ic ON r.child_item_id = ic.id
    )
SELECT
    parent_item_id,
    child_item_id,
    parent_name,
    child_name,
    unit,
    total,
    depth
FROM
    material_tree rt
WITH
    DATA;

-- View indexes:
CREATE INDEX material_tree_child_item_id_idx ON public.material_tree USING btree (child_item_id);

CREATE INDEX material_tree_depth_idx ON public.material_tree USING btree (depth);

CREATE INDEX material_tree_parent_item_id_idx ON public.material_tree USING btree (parent_item_id);
