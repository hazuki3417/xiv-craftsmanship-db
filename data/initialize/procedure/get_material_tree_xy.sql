-- DROP FUNCTION public.get_material_tree(uuid);

CREATE OR REPLACE FUNCTION public.get_material_tree(arg_parent_id uuid)
 RETURNS TABLE(parent_item_id uuid, parent_name text, child_item_id uuid, child_name text, unit integer, total integer, x integer, y integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH RECURSIVE item_tree AS (
    -- 初期の親アイテムとその直接の子アイテムを取得
    SELECT
      r.parent_item_id,
      ip.name AS parent_name,
      r.child_item_id,
      ic.name AS child_name,
      r.quantity AS unit,
      r.quantity * 1 AS total,
      ARRAY[r.parent_item_id::text, r.child_item_id::text] AS path,
      1 AS x,
      (ROW_NUMBER() OVER ())::integer AS y
    FROM
      recipe r
      JOIN items ip ON r.parent_item_id = ip.id
      JOIN items ic ON r.child_item_id = ic.id
    WHERE
      r.parent_item_id = arg_parent_id

    UNION ALL

    -- 再帰的にツリーをたどり、全ての子アイテムを取得
    SELECT
      r.parent_item_id,
      ip.name AS parent_name,
      r.child_item_id,
      ic.name AS child_name,
      r.quantity AS unit,
      r.quantity * it.total AS total,
      it.path || r.child_item_id::text,
      it.x + 1 AS x,
      (it.y + ROW_NUMBER() OVER (PARTITION BY it.parent_item_id ORDER BY r.child_item_id))::integer AS y
    FROM
      recipe r
      JOIN items ic ON r.child_item_id = ic.id
      JOIN items ip ON r.parent_item_id = ip.id
      JOIN item_tree it ON r.parent_item_id = it.child_item_id
  )
  SELECT
    it.parent_item_id,
    it.parent_name,
    it.child_item_id,
    it.child_name,
    it.unit,
    it.total,
    it.x,
    it.y
  FROM
    item_tree it
  ORDER BY
    it.path;
END;
$function$
;
