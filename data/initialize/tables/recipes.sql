-- public.recipes definition
-- Drop table
-- DROP TABLE public.recipes;
CREATE TABLE
    public.recipes (
        id text NOT NULL,
        item_id text NOT NULL,
        "level" int4 DEFAULT 1 NOT NULL,
        pieces int4 DEFAULT 1 NOT NULL,
        job text NOT NULL,
        CONSTRAINT check_positive_level_number CHECK ((level > 0)),
        CONSTRAINT check_positive_pieces_number CHECK ((pieces > 0)),
        CONSTRAINT recipes_pk PRIMARY KEY (id),
        CONSTRAINT recipes_items_fk FOREIGN KEY (id) REFERENCES public.items (id)
    );
