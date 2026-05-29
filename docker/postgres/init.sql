-- Extensiones necesarias para el proyecto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rol de aplicación (menor privilegio que superuser)
-- La app se conecta con este rol; RLS aplica sobre él
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'emr_app') THEN
    CREATE ROLE emr_app LOGIN PASSWORD 'emr_app_password' NOINHERIT;
  END IF;
END
$$;

GRANT CONNECT ON DATABASE emr_veterinaria TO emr_app;

-- El rol de migraciones sí necesita BYPASSRLS para correr prisma migrate
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'emr_migrator') THEN
    CREATE ROLE emr_migrator LOGIN PASSWORD 'emr_migrator_password' BYPASSRLS;
  END IF;
END
$$;

GRANT ALL ON DATABASE emr_veterinaria TO emr_migrator;
