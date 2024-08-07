-- public.material_tree source
CREATE
OR REPLACE VIEW public.material_tree AS
WITH RECURSIVE
    item_tree AS (
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
            r.parent_item_id,
            ip.name AS parent_name,
            r.child_item_id,
            ic.name AS child_name,
            r.quantity AS unit,
            r.quantity * it_1.total AS total,
            it_1.depth + 1 AS depth
        FROM
            recipe r
            JOIN items ic ON r.child_item_id = ic.id
            JOIN items ip ON r.parent_item_id = ip.id
            JOIN item_tree it_1 ON r.parent_item_id = it_1.child_item_id
    )
SELECT
    parent_item_id,
    parent_name,
    child_item_id,
    child_name,
    unit,
    total,
    depth
FROM
    item_tree it
ORDER BY
    depth,
    parent_name,
    child_name;
