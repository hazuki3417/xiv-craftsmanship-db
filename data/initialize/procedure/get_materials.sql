DROP FUNCTION public.get_materials(text);

CREATE OR REPLACE FUNCTION public.get_materials(arg_recipe_id text)
 RETURNS TABLE(node_id text, recipe_id text, parent_item_id text, parent_item_name text, child_item_id text, child_item_name text, child_item_type text, quantity integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH RECURSIVE material_tree AS (
    -- 初期の親アイテムとその直接の子アイテムを取得
    SELECT
      r.id as node_id,
      r.recipe_id,
      r.parent_item_id,
      ip.name AS parent_item_name,
      r.child_item_id,
      ic.name AS child_item_name,
      r.type AS child_item_type,
      r.quantity
    FROM
      item_tree r
      JOIN items ip ON r.parent_item_id = ip.id
      JOIN items ic ON r.child_item_id = ic.id
    WHERE
      r.recipe_id = arg_recipe_id

    UNION ALL

    -- 再帰的にツリーをたどり、全ての子アイテムを取得
    SELECT
      r.id as node_id,
      it.recipe_id,
      r.parent_item_id,
      ip.name AS parent_item_name,
      r.child_item_id,
      ic.name AS child_item_name,
      r.type AS child_item_type,
      r.quantity
    FROM
      item_tree r
      JOIN items ic ON r.child_item_id = ic.id
      JOIN items ip ON r.parent_item_id = ip.id
      JOIN material_tree it ON r.parent_item_id = it.child_item_id
  )
  SELECT
    it.node_id,
    it.recipe_id,
    it.parent_item_id,
    it.parent_item_name,
    it.child_item_id,
    it.child_item_name,
    it.child_item_type,
    it.quantity
  FROM
    material_tree it
  ORDER BY
    it.parent_item_id, it.child_item_id;
END;
$function$
;

