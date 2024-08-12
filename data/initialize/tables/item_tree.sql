-- public.item_tree definition
-- Drop table
-- DROP TABLE public.item_tree;
CREATE TABLE
    public.item_tree (
        parent_item_id text NOT NULL,
        child_item_id text NOT NULL,
        quantity int4 DEFAULT 1 NOT NULL,
        "type" text NOT NULL,
        CONSTRAINT check_positive_number CHECK ((quantity > 0)),
        CONSTRAINT recipe_unique UNIQUE (parent_item_id, child_item_id),
        CONSTRAINT recipe_child_item_id_fk FOREIGN KEY (child_item_id) REFERENCES public.items (id),
        CONSTRAINT recipe_parent_item_id_fk FOREIGN KEY (parent_item_id) REFERENCES public.items (id)
    );
