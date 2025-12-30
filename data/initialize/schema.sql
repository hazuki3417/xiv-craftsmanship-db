--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: get_materials(text); Type: FUNCTION; Schema: public; Owner: example
--

CREATE FUNCTION public.get_materials(arg_recipe_id text) RETURNS TABLE(parent_item_id text, parent_item_type text, parent_item_name text, child_item_id text, child_item_type text, child_item_name text, quantity integer)
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.get_materials(arg_recipe_id text) OWNER TO example;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: areas; Type: TABLE; Schema: public; Owner: example
--

CREATE TABLE public.areas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    parent_id uuid,
    hierarchy_level integer NOT NULL
);


ALTER TABLE public.areas OWNER TO example;

--
-- Name: TABLE areas; Type: COMMENT; Schema: public; Owner: example
--

COMMENT ON TABLE public.areas IS 'エリアの情報を保持するテーブル。再帰処理できるように設計。';


--
-- Name: COLUMN areas.name; Type: COMMENT; Schema: public; Owner: example
--

COMMENT ON COLUMN public.areas.name IS 'エリア名';


--
-- Name: COLUMN areas.hierarchy_level; Type: COMMENT; Schema: public; Owner: example
--

COMMENT ON COLUMN public.areas.hierarchy_level IS 'エリアのレイヤー番号（数字が大きくなる事にエリアが小さくなる）';


--
-- Name: items; Type: TABLE; Schema: public; Owner: example
--

CREATE TABLE public.items (
    id text NOT NULL,
    name text NOT NULL,
    level integer
);


ALTER TABLE public.items OWNER TO example;

--
-- Name: TABLE items; Type: COMMENT; Schema: public; Owner: example
--

COMMENT ON TABLE public.items IS 'アイテム情報を保持するテーブル';


--
-- Name: COLUMN items.name; Type: COMMENT; Schema: public; Owner: example
--

COMMENT ON COLUMN public.items.name IS 'アイテム名';


--
-- Name: COLUMN items.level; Type: COMMENT; Schema: public; Owner: example
--

COMMENT ON COLUMN public.items.level IS 'アイテムレベル（IL）';


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: example
--

CREATE TABLE public.recipes (
    id text NOT NULL,
    item_id text NOT NULL,
    level integer DEFAULT 1,
    pieces integer DEFAULT 1 NOT NULL,
    job text NOT NULL,
    CONSTRAINT check_positive_level_number CHECK ((level > 0)),
    CONSTRAINT check_positive_pieces_number CHECK ((pieces > 0))
);


ALTER TABLE public.recipes OWNER TO example;

--
-- Name: TABLE recipes; Type: COMMENT; Schema: public; Owner: example
--

COMMENT ON TABLE public.recipes IS '制作アイテムの情報を保持するテーブル。制作アイテムのみの情報を持ち、製作アイテムに必要な情報は持たない。';


--
-- Name: COLUMN recipes.level; Type: COMMENT; Schema: public; Owner: example
--

COMMENT ON COLUMN public.recipes.level IS '制作レベル';


--
-- Name: COLUMN recipes.pieces; Type: COMMENT; Schema: public; Owner: example
--

COMMENT ON COLUMN public.recipes.pieces IS '完成個数';


--
-- Name: COLUMN recipes.job; Type: COMMENT; Schema: public; Owner: example
--

COMMENT ON COLUMN public.recipes.job IS 'ジョブ';


--
-- Name: crafts; Type: MATERIALIZED VIEW; Schema: public; Owner: example
--

CREATE MATERIALIZED VIEW public.crafts AS
 SELECT r.id AS recipe_id,
    i.id AS item_id,
    i.name,
    i.level AS item_level,
    r.pieces,
    r.job,
    r.level AS recipe_level
   FROM (public.recipes r
     JOIN public.items i ON ((r.item_id = i.id)))
  WITH NO DATA;


ALTER MATERIALIZED VIEW public.crafts OWNER TO example;

--
-- Name: MATERIALIZED VIEW crafts; Type: COMMENT; Schema: public; Owner: example
--

COMMENT ON MATERIALIZED VIEW public.crafts IS '制作可能なアイテムの一覧を表示するテーブル';


--
-- Name: item_harvest_times; Type: TABLE; Schema: public; Owner: example
--

CREATE TABLE public.item_harvest_times (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    item_id text NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL
);


ALTER TABLE public.item_harvest_times OWNER TO example;

--
-- Name: item_tree; Type: TABLE; Schema: public; Owner: example
--

CREATE TABLE public.item_tree (
    id text DEFAULT public.uuid_generate_v4() NOT NULL,
    recipe_id text NOT NULL,
    parent_item_id text NOT NULL,
    child_item_id text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    type text NOT NULL,
    CONSTRAINT check_positive_number CHECK ((quantity > 0))
);


ALTER TABLE public.item_tree OWNER TO example;

--
-- Name: TABLE item_tree; Type: COMMENT; Schema: public; Owner: example
--

COMMENT ON TABLE public.item_tree IS 'アイテムの関連性を表現するテーブル。再帰処理できるように設計。';


--
-- Name: COLUMN item_tree.quantity; Type: COMMENT; Schema: public; Owner: example
--

COMMENT ON COLUMN public.item_tree.quantity IS '制作に必要な素材の数';


--
-- Name: COLUMN item_tree.type; Type: COMMENT; Schema: public; Owner: example
--

COMMENT ON COLUMN public.item_tree.type IS '素材またはクリスタル';


--
-- Name: areas areas_pk; Type: CONSTRAINT; Schema: public; Owner: example
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pk PRIMARY KEY (id);


--
-- Name: item_harvest_times item_harvest_times_pk; Type: CONSTRAINT; Schema: public; Owner: example
--

ALTER TABLE ONLY public.item_harvest_times
    ADD CONSTRAINT item_harvest_times_pk PRIMARY KEY (id);


--
-- Name: item_tree item_tree_unique; Type: CONSTRAINT; Schema: public; Owner: example
--

ALTER TABLE ONLY public.item_tree
    ADD CONSTRAINT item_tree_unique UNIQUE (id);


--
-- Name: items items.name_unique; Type: CONSTRAINT; Schema: public; Owner: example
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT "items.name_unique" UNIQUE (name);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: example
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pk; Type: CONSTRAINT; Schema: public; Owner: example
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pk PRIMARY KEY (id);


--
-- Name: recipes recipes_unique; Type: CONSTRAINT; Schema: public; Owner: example
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_unique UNIQUE (item_id, job);


--
-- Name: crafts_name_idx; Type: INDEX; Schema: public; Owner: example
--

CREATE INDEX crafts_name_idx ON public.crafts USING btree (name);


--
-- Name: areas areas_areas_fk; Type: FK CONSTRAINT; Schema: public; Owner: example
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_areas_fk FOREIGN KEY (parent_id) REFERENCES public.areas(id);


--
-- Name: item_harvest_times item_harvest_times_items_fk; Type: FK CONSTRAINT; Schema: public; Owner: example
--

ALTER TABLE ONLY public.item_harvest_times
    ADD CONSTRAINT item_harvest_times_items_fk FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: item_tree item_tree_recipes_fk; Type: FK CONSTRAINT; Schema: public; Owner: example
--

ALTER TABLE ONLY public.item_tree
    ADD CONSTRAINT item_tree_recipes_fk FOREIGN KEY (recipe_id) REFERENCES public.recipes(id);


--
-- Name: item_tree recipe_child_item_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: example
--

ALTER TABLE ONLY public.item_tree
    ADD CONSTRAINT recipe_child_item_id_fk FOREIGN KEY (child_item_id) REFERENCES public.items(id);


--
-- Name: item_tree recipe_parent_item_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: example
--

ALTER TABLE ONLY public.item_tree
    ADD CONSTRAINT recipe_parent_item_id_fk FOREIGN KEY (parent_item_id) REFERENCES public.items(id);


--
-- Name: recipes recipes_items_fk; Type: FK CONSTRAINT; Schema: public; Owner: example
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_items_fk FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- PostgreSQL database dump complete
--

