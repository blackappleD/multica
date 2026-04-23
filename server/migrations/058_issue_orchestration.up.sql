ALTER TABLE issue
ADD COLUMN orchestration TEXT
CHECK (orchestration IN (
    'consensus',
    'specification',
    'development',
    'value',
    'metrics',
    'alignment',
    'operations'
));
