-- DROP FUNCTION public.get_materials(text);

CREATE OR REPLACE FUNCTION public.get_materials(arg_parent_id text)
 RETURNS TABLE(parent_item_id text, parent_name text, child_item_id text, child_name text, unit integer, total integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH RECURSIVE material_tree AS (
    -- 初期の親アイテムとその直接の子アイテムを取得
    SELECT
      r.parent_item_id,
      ip.name AS parent_name,
      r.child_item_id,
      ic.name AS child_name,
      r.quantity AS unit,
      r.quantity * 1 AS total
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
      ip.name AS parent_name,
      r.child_item_id,
      ic.name AS child_name,
      r.quantity AS unit,
      r.quantity * it.total AS total
    FROM
      item_tree r
      JOIN items ic ON r.child_item_id = ic.id
      JOIN items ip ON r.parent_item_id = ip.id
      JOIN material_tree it ON r.parent_item_id = it.child_item_id
  )
  SELECT
    it.parent_item_id,
    it.parent_name,
    it.child_item_id,
    it.child_name,
    it.unit,
    it.total
  FROM
    material_tree it
  ORDER BY
    it.parent_item_id, it.child_item_id;
END;
$function$
;
