-- public.recipe definition
-- Drop table
-- DROP TABLE public.recipe;
CREATE TABLE
    public.recipe (
        parent_item_id text NOT NULL,
        child_item_id text NOT NULL,
        quantity int4 DEFAULT 1 NULL,
        CONSTRAINT check_positive_number CHECK ((quantity > 0)),
        CONSTRAINT recipe_unique UNIQUE (parent_item_id, child_item_id),
        CONSTRAINT recipe_child_item_id_fk FOREIGN KEY (child_item_id) REFERENCES public.items (id),
        CONSTRAINT recipe_parent_item_id_fk FOREIGN KEY (parent_item_id) REFERENCES public.items (id)
    );
