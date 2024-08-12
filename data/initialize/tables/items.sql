-- public.items definition
-- Drop table
-- DROP TABLE public.items;
CREATE TABLE
    public.items (
        id text NOT NULL,
        "name" text NOT NULL,
        "level" int4 NULL,
        CONSTRAINT "items.name_unique" UNIQUE (name),
        CONSTRAINT items_pkey PRIMARY KEY (id)
    );
