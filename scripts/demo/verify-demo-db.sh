#!/usr/bin/env bash
set -euo pipefail
command -v mysql >/dev/null || { echo "Missing required command: mysql (MySQL client)." >&2; exit 1; }
: "${DB_URL:?DB_URL is required}"
: "${DB_USERNAME:?DB_USERNAME is required}"
: "${DB_PASSWORD:?DB_PASSWORD is required}"
url=${DB_URL#jdbc:mysql://}; authority=${url%%/*}; rest=${url#*/}; database=${rest%%\?*}; host=${authority%%:*}
if [[ "$authority" == *:* ]]; then port=${authority##*:}; else port=3306; fi
export MYSQL_PWD="$DB_PASSWORD"; trap 'unset MYSQL_PWD' EXIT
query="SELECT
 (SELECT COUNT(*) FROM users WHERE email LIKE 'demo.%@tgms.example' AND is_active = TRUE) AS demo_users,
 (SELECT COUNT(DISTINCT role) FROM users WHERE email LIKE 'demo.%@tgms.example') AS demo_roles,
 (SELECT COUNT(*) FROM material_supplies WHERE material_code LIKE 'DEMO-%') AS supplies,
 (SELECT COUNT(*) FROM inventory_materials WHERE material_code LIKE 'DEMO-INV-%') AS inventory,
 (SELECT COUNT(*) FROM garment_products WHERE image_url LIKE '/products/demo/%') AS products,
 (SELECT COUNT(*) FROM orders WHERE order_number LIKE 'DEMO-ORD-%') AS orders,
 (SELECT COUNT(*) FROM quotations WHERE quotation_number LIKE 'DEMO-QUO-%') AS quotations,
 (SELECT COUNT(*) FROM production_tasks WHERE task_number LIKE 'DEMO-PRD-%') AS production_tasks,
 (SELECT COUNT(*) FROM deliveries WHERE delivery_number LIKE 'DEMO-DEL-%') AS deliveries,
 (SELECT COUNT(*) FROM order_invoices WHERE invoice_number LIKE 'DEMO-INV-%') AS invoices,
 (SELECT COUNT(*) FROM notifications WHERE recipient_user_id IN (
     SELECT id FROM users WHERE email LIKE 'demo.%@tgms.example'
 )) AS notifications;"
row=$(mysql --batch --skip-column-names --host="$host" --port="$port" --user="$DB_USERNAME" --database="$database" -e "$query")
read -r users roles supplies inventory products orders quotations production_tasks deliveries invoices notifications <<<"$row"
[[ "$users" == 6 && "$roles" == 6 && "$supplies" == 6 && "$inventory" == 6 \
   && "$products" == 4 && "$orders" == 4 && "$quotations" == 1 \
   && "$production_tasks" == 3 && "$deliveries" == 2 && "$invoices" == 4 \
   && "$notifications" == 4 ]] || {
  echo "[demo] verification FAILED: users=$users roles=$roles supplies=$supplies inventory=$inventory products=$products orders=$orders quotations=$quotations production=$production_tasks deliveries=$deliveries invoices=$invoices notifications=$notifications" >&2
  exit 1
}
echo "[demo] verification PASS: Sri Lankan users and linked catalog, supply, inventory, quotation, order, billing, production, delivery, and notification records are ready."
