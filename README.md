
## 前提

コンテナ運用のためコンテナを削除したらテーブルやデータはすべて削除されます。ボリュームを永続化をする方法もありますが、マイグレーションが必要になる可能性が高いためやりません。構築しているサービスはクライアントからのデータインプットがなく、データセットを構築し、そのデータを利用したサービスを提供するシステムです。そのため手間をかけてマイグレーションをする必要性がありません。

### スキーマ構成のみexport

基本的にDB Clientを利用してDB設計をします。設計した内容をコミットするためにスキーマ情報をファイル出力し、そのファイルをコミットするように運用します。


起動していないとき
```sh
docker compose run --rm xiv-craftsmanship-db pg_dump -U example -d example --schema-only > data/initialize/schema.sql
```

起動中のとき
```sh
docker compose exec xiv-craftsmanship-db pg_dump -U example -d example --schema-only > data/initialize/schema.sql
```

**補足**
ビューやプロシージャもスキーマに含むため、一緒にexportされます。

### データのみexport

データセットを提供するシステムのため、データセットもファイル出力し、コミットするように運用します。
データセットは行数が多くなることが想定されるため、テーブル単位で出力します。

```sh
docker compose run --rm xiv-craftsmanship-db pg_dump -U example -d example -t {table-name} --data-only > {table-name}.sql
```
