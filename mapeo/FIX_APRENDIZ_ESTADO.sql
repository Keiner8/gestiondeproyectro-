-- Agregar columna 'estado' a la tabla 'aprendiz'
ALTER TABLE aprendiz ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO';

-- Verificar que la columna se agregó correctamente
DESCRIBE aprendiz;
