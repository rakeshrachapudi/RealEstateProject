ALTER TABLE property
ADD COLUMN balconies INT;

-- Verify these columns exist in property table
-- If not, run these ALTER statements:

-- Check if columns exist
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'property' 
AND COLUMN_NAME IN ('is_verified', 'owner_type', 'is_ready_to_move');

-- If is_verified doesn't exist, add it:
ALTER TABLE property 
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

-- If owner_type doesn't exist, add it:
ALTER TABLE property 
ADD COLUMN owner_type VARCHAR(20) DEFAULT 'owner';

-- If is_ready_to_move doesn't exist, add it:
ALTER TABLE property 
ADD COLUMN is_ready_to_move BOOLEAN DEFAULT FALSE;

-- Update existing properties to have default values
UPDATE property 
SET is_verified = FALSE 
WHERE is_verified IS NULL;

UPDATE property 
SET owner_type = 'owner' 
WHERE owner_type IS NULL;

UPDATE property 
SET is_ready_to_move = FALSE 
WHERE is_ready_to_move IS NULL;

-- Verify the changes
SELECT id, title, is_verified, owner_type, is_ready_to_move 
FROM property 
LIMIT 5;
