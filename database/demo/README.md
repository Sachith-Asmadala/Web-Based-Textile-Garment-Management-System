# TGMS Demo Data

`reset-and-seed.sql` is **presentation-only data**, not a Liquibase migration and not production seed data. It writes into the real TGMS source-of-truth tables so the demo exercises the same contracts as normal users.

Run it only through `npm run demo:reset`, which requires an explicit disposable-database opt-in and confirmation. The reset removes only records identified by reserved `demo.*@tgms.example`, `DEMO-*`, and `[DEMO_SEED]` markers, then recreates the deterministic presentation state.

All six authenticated roles use the runtime password supplied as `DEMO_USER_PASSWORD`. The reset wrapper validates the application password limits and generates a bcrypt hash without storing the plaintext or hash in the repository. The `.example` email domain is reserved for documentation and will not route real email. Never reuse demo credentials in production.

## Sri Lankan demo identities

| Role | Name | Email |
| --- | --- | --- |
| Administrator | Nadeesha Perera | `demo.admin@tgms.example` |
| Supplier | Chathura Bandara | `demo.supplier@tgms.example` |
| Inventory manager | Tharushi Senanayake | `demo.inventory@tgms.example` |
| Production manager | Kasun Jayawardena | `demo.production@tgms.example` |
| Sales officer | Dinithi Fernando | `demo.sales@tgms.example` |
| Customer | Kavindu Dissanayake | `demo.customer@tgms.example` |

The seed also creates six supplies, six linked inventory materials, four photographed products with variants, four orders across lifecycle states, quotations, invoices and payments, production work and material usage, deliveries, and notifications.

## Run the seed without hard-coding a password

From the repository root:

```bash
export DEMO_DATA_ALLOWED=true
read -s "DEMO_USER_PASSWORD?Demo login password: "
export DEMO_USER_PASSWORD
npm run demo:reset
npm run demo:verify
unset DEMO_USER_PASSWORD DEMO_DATA_ALLOWED
```

Use the password entered at the hidden prompt for all six accounts. Product image paths are stored in `garment_products.image_url`; the matching local catalog assets live under `frontend/public/products/demo/`. Product managers can set or remove an HTTPS URL or managed `/products/` path from the Add/Edit Product forms.
