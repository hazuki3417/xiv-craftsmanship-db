DROP FUNCTION public.get_materials(text);

CREATE OR REPLACE FUNCTION public.get_materials(arg_recipe_id text)
 RETURNS TABLE(node_id text, root_recipe_id text, parent_item_id text, parent_item_type text, parent_item_name text, child_item_id text, child_item_type text, child_item_name text, quantity integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH RECURSIVE material_tree AS (
    -- 初期の親アイテムとその直接の子アイテムを取得
    SELECT
      r.id as node_id,
      r.recipe_id as root_recipe_id,
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
      r.id as node_id,
      it.root_recipe_id,
      r.parent_item_id,
      r.child_item_id,
      r.type AS child_item_type,
      r.quantity
    FROM
      item_tree r
      JOIN material_tree it ON r.parent_item_id = it.child_item_id
  )
  SELECT
    it.node_id,
    it.root_recipe_id,
    it.parent_item_id,
    'material' AS parent_item_type,
    ip.name as parent_item_name,
    it.child_item_id,
    it.child_item_type,
    ic.name as child_item_name,
    it.quantity
  FROM
    material_tree it
  JOIN items ip ON it.parent_item_id = ip.id
  JOIN items ic ON it.child_item_id = ic.id
  ORDER BY
    it.parent_item_id, it.child_item_id;
END;
$function$
;

