-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2020-07-22 15:37:21.277

-- foreign keys
ALTER TABLE comentario_incidente DROP CONSTRAINT comentario_incidente_incidentes;

ALTER TABLE comentario_incidente DROP CONSTRAINT comentario_incidente_users;

ALTER TABLE comentario_interno_incidente DROP CONSTRAINT comentario_interno_incidente_incidentes;

ALTER TABLE comentario_interno_incidente DROP CONSTRAINT comentario_interno_incidente_users;

ALTER TABLE evidencia DROP CONSTRAINT evidencia_incidentes;

ALTER TABLE evidencia DROP CONSTRAINT evidencia_users;

ALTER TABLE incidentes DROP CONSTRAINT incidentes_ct_aplicaciones;

ALTER TABLE incidentes DROP CONSTRAINT incidentes_ct_prioridad_incidente;

ALTER TABLE incidentes DROP CONSTRAINT incidentes_ct_status_incidente;

ALTER TABLE incidentes DROP CONSTRAINT incidentes_ct_tipo_incidente;

ALTER TABLE incidentes DROP CONSTRAINT incidentes_users;

ALTER TABLE users DROP CONSTRAINT users_ct_tipo_user;

-- tables
DROP TABLE comentario_incidente;

DROP TABLE comentario_interno_incidente;

DROP TABLE ct_aplicaciones;

DROP TABLE ct_prioridad_incidente;

DROP TABLE ct_status_incidente;

DROP TABLE ct_tipo_incidente;

DROP TABLE ct_tipo_user;

DROP TABLE evidencia;

DROP TABLE incidentes;

DROP TABLE users;

-- End of file.

