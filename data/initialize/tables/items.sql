-- public.items definition
-- Drop table
-- DROP TABLE public.items;
CREATE TABLE
    public.items (
        id uuid DEFAULT uuid_generate_v4 () NOT NULL,
        "name" text NOT NULL,
        CONSTRAINT "items.name_unique" UNIQUE (name),
        CONSTRAINT items_pkey PRIMARY KEY (id)
    );
