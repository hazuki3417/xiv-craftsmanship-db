-- DROP FUNCTION public.get_materials(text);

CREATE OR REPLACE FUNCTION public.get_materials(arg_recipe_id text)
 RETURNS TABLE(parent_item_id text, parent_item_type text, parent_item_name text, child_item_id text, child_item_type text, child_item_name text, quantity integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH RECURSIVE material_tree AS (
    -- 初期の親アイテムとその直接の子アイテムを取得
    SELECT
      r.parent_item_id,
      r.child_item_id,
      r.type AS child_item_type,
      r.quantity
    FROM
      item_tree r
    WHERE
      r.recipe_id = arg_recipe_id

    UNION ALL

    -- 再帰的にツリーをたどり、全ての子アイテムを取得
    SELECT
      r.parent_item_id,
      r.child_item_id,
      r.type AS child_item_type,
      r.quantity
    FROM
      item_tree r
      JOIN material_tree it ON r.parent_item_id = it.child_item_id
  )
  SELECT
    it.parent_item_id,
    'material' AS parent_item_type,
    ip.name as parent_item_name, -- debug 用
    it.child_item_id,
    it.child_item_type,
    ic.name as child_item_name, -- debug 用
    it.quantity
  FROM
    material_tree it
  JOIN items ip ON it.parent_item_id = ip.id -- debug 用
  JOIN items ic ON it.child_item_id = ic.id -- debug 用
  ORDER BY
    it.parent_item_id, it.child_item_id;
END;
$function$
;

