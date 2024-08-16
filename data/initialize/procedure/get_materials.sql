-- DROP FUNCTION public.get_materials(text);

CREATE OR REPLACE FUNCTION public.get_materials(arg_parent_id text)
 RETURNS TABLE(parent_item_id text, parent_item_name text, child_item_id text, child_item_name text, unit integer, total integer, child_item_type text)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH RECURSIVE material_tree AS (
    -- 初期の親アイテムとその直接の子アイテムを取得
    SELECT
      r.parent_item_id,
      ip.name AS parent_item_name,
      r.child_item_id,
      ic.name AS child_item_name,
      r.quantity AS unit,
      r.quantity * 1 AS total,
      r.type AS child_item_type
    FROM
      item_tree r
      JOIN items ip ON r.parent_item_id = ip.id
      JOIN items ic ON r.child_item_id = ic.id
    WHERE
      r.parent_item_id = arg_parent_id

    UNION ALL

    -- 再帰的にツリーをたどり、全ての子アイテムを取得
    SELECT
      r.parent_item_id,
      ip.name AS parent_item_name,
      r.child_item_id,
      ic.name AS child_item_name,
      r.quantity AS unit,
      r.quantity * it.total AS total,
      r.type AS child_item_type
    FROM
      item_tree r
      JOIN items ic ON r.child_item_id = ic.id
      JOIN items ip ON r.parent_item_id = ip.id
      JOIN material_tree it ON r.parent_item_id = it.child_item_id
  )
  SELECT
    it.parent_item_id,
    it.parent_item_name,
    it.child_item_id,
    it.child_item_name,
    it.unit,
    it.total,
    it.child_item_type
  FROM
    material_tree it
  ORDER BY
    it.parent_item_id, it.child_item_id;
END;
$function$
;
