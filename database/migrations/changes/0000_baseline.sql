--liquibase formatted sql

--changeset tgms:0000-baseline
--comment: Establish an auditable migration baseline without creating application tables.
SELECT 1;
--rollback SELECT 1;
