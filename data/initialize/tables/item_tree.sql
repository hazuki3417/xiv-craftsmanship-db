-- public.item_tree definition
-- Drop table
-- DROP TABLE public.item_tree;
CREATE TABLE
    public.item_tree (
        id text DEFAULT uuid_generate_v4 () NOT NULL,
        recipe_id text NOT NULL,
        parent_item_id text NOT NULL,
        child_item_id text NOT NULL,
        quantity int4 DEFAULT 1 NOT NULL,
        "type" text NOT NULL,
        CONSTRAINT item_tree_unique UNIQUE (id),
        CONSTRAINT item_tree_recipes_fk FOREIGN KEY (recipe_id) REFERENCES public.recipes (id),
        CONSTRAINT recipe_child_item_id_fk FOREIGN KEY (child_item_id) REFERENCES public.items (id),
        CONSTRAINT recipe_parent_item_id_fk FOREIGN KEY (parent_item_id) REFERENCES public.items (id),
        CONSTRAINT check_positive_number CHECK ((quantity > 0))
    );
