#!/bin/bash
set -e

INIT_DIR="/docker-entrypoint-initdb.d/initialize"

SQL_FILES=(
  "$INIT_DIR/init.sql"
  "$INIT_DIR/tables/items.sql"
  "$INIT_DIR/tables/recipe.sql"
  "$INIT_DIR/seeder/items.sql"
  "$INIT_DIR/seeder/recipe.sql"
  "$INIT_DIR/views/crafts.sql"
  "$INIT_DIR/views/recipe_tree.sql"
)

# 各SQLファイルを順番に実行
for sql_file in "${SQL_FILES[@]}"
do
  echo "Executing $sql_file..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$sql_file"
done

echo "Database initialization completed."
