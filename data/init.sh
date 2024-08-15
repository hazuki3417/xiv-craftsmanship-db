#!/bin/bash
set -e

INIT_DIR="/docker-entrypoint-initdb.d/initialize"

SQL_FILES=(
  "$INIT_DIR/tables/items.sql"
  "$INIT_DIR/tables/recipes.sql"
  "$INIT_DIR/tables/item_tree.sql"
  "$INIT_DIR/seeder/items.sql"
  "$INIT_DIR/procedure/get_materials.sql"
)

# 各SQLファイルを順番に実行
for sql_file in "${SQL_FILES[@]}"
do
  echo "Executing $sql_file..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$sql_file"
done

echo "Database initialization completed."
