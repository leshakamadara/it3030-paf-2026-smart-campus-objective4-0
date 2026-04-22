DO $$
DECLARE
    bookings_table_exists BOOLEAN;
    resource_column_type TEXT;
    bookings_has_rows BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'bookings'
    ) INTO bookings_table_exists;

    IF NOT bookings_table_exists THEN
        RETURN;
    END IF;

    SELECT c.data_type
    INTO resource_column_type
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'bookings'
      AND c.column_name = 'resource_id';

    IF resource_column_type = 'uuid' THEN
        EXECUTE 'SELECT EXISTS (SELECT 1 FROM bookings LIMIT 1)' INTO bookings_has_rows;

        IF bookings_has_rows THEN
            RAISE EXCEPTION 'Cannot convert bookings.resource_id from UUID to BIGINT while rows exist. Clear bookings data first, then re-run migration.';
        END IF;

        ALTER TABLE bookings DROP CONSTRAINT IF EXISTS fk_bookings_resource;
        ALTER TABLE bookings ALTER COLUMN resource_id DROP NOT NULL;
        ALTER TABLE bookings ALTER COLUMN resource_id TYPE BIGINT USING NULL;
        ALTER TABLE bookings ALTER COLUMN resource_id SET NOT NULL;
    END IF;
END $$;
