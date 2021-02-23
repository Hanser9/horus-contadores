-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2020-07-22 15:37:21.277

-- tables
-- Table: comentario_incidente
CREATE TABLE comentario_incidente (
    id_comentario int  NOT NULL IDENTITY,
    id_user int  NOT NULL,
    id_incidente int  NOT NULL,
    comentario varchar(250)  NOT NULL,
    fecha datetime  NOT NULL,
    CONSTRAINT comentario_incidente_pk PRIMARY KEY  (id_comentario)
);

-- Table: comentario_interno_incidente
CREATE TABLE comentario_interno_incidente (
    id_comentario_interno int  NOT NULL IDENTITY,
    id_user int  NOT NULL,
    id_incidente int  NOT NULL,
    comentario varchar(250)  NOT NULL,
    fecha datetime  NOT NULL,
    CONSTRAINT comentario_interno_incidente_pk PRIMARY KEY  (id_comentario_interno)
);

-- Table: ct_aplicaciones
CREATE TABLE ct_aplicaciones (
    id_aplicacion int  NOT NULL IDENTITY,
    nombre varchar(50)  NOT NULL,
    activo smallint  NOT NULL,
    CONSTRAINT ct_aplicaciones_pk PRIMARY KEY  (id_aplicacion)
);

-- Table: ct_prioridad_incidente
CREATE TABLE ct_prioridad_incidente (
    id_prioridad_incidente int  NOT NULL IDENTITY,
    nombre varchar(50)  NOT NULL,
    activo smallint  NOT NULL,
    CONSTRAINT ct_prioridad_incidente_pk PRIMARY KEY  (id_prioridad_incidente)
);

-- Table: ct_status_incidente
CREATE TABLE ct_status_incidente (
    id_estatus_incidente int  NOT NULL IDENTITY,
    nombre varchar(50)  NOT NULL,
    activo smallint  NOT NULL,
    CONSTRAINT ct_status_incidente_pk PRIMARY KEY  (id_estatus_incidente)
);

-- Table: ct_tipo_incidente
CREATE TABLE ct_tipo_incidente (
    id_tipo_incidente int  NOT NULL IDENTITY,
    nombre varchar(50)  NOT NULL,
    activo smallint  NOT NULL,
    CONSTRAINT ct_tipo_incidente_pk PRIMARY KEY  (id_tipo_incidente)
);

-- Table: ct_tipo_user
CREATE TABLE ct_tipo_user (
    id_tipo_user int  NOT NULL IDENTITY,
    nombre varchar(25)  NOT NULL,
    activo smallint  NOT NULL,
    CONSTRAINT ct_tipo_user_pk PRIMARY KEY  (id_tipo_user)
);

-- Table: evidencia
CREATE TABLE evidencia (
    id_evidencia int  NOT NULL IDENTITY,
    id_user int  NOT NULL,
    id_incidente int  NOT NULL,
    ruta_evidencia varchar(100)  NOT NULL,
    fecha datetime  NOT NULL,
    CONSTRAINT evidencia_pk PRIMARY KEY  (id_evidencia)
);

-- Table: incidentes
CREATE TABLE incidentes (
    id_incidente int  NOT NULL IDENTITY,
    id_user int  NOT NULL,
    id_tipo_incidente int  NOT NULL,
    id_prioridad_incidente int  NOT NULL,
    id_estatus_incidente int  NOT NULL,
    id_aplicacion int  NOT NULL,
    fecha_alta datetime  NOT NULL,
    fecha_cierre datetime  NOT NULL,
    descripcion varchar(100)  NOT NULL,
    detalle varchar(250)  NOT NULL,
    CONSTRAINT incidentes_pk PRIMARY KEY  (id_incidente)
);

-- Table: users
CREATE TABLE users (
    id_user int  NOT NULL IDENTITY,
    id_tipo_user int  NOT NULL,
    usuario varchar(25)  NOT NULL,
    pass varchar(100)  NOT NULL,
    activo smallint  NOT NULL,
    CONSTRAINT users_pk PRIMARY KEY  (id_user)
);

-- foreign keys
-- Reference: comentario_incidente_incidentes (table: comentario_incidente)
ALTER TABLE comentario_incidente ADD CONSTRAINT comentario_incidente_incidentes
    FOREIGN KEY (id_incidente)
    REFERENCES incidentes (id_incidente);

-- Reference: comentario_incidente_users (table: comentario_incidente)
ALTER TABLE comentario_incidente ADD CONSTRAINT comentario_incidente_users
    FOREIGN KEY (id_user)
    REFERENCES users (id_user);

-- Reference: comentario_interno_incidente_incidentes (table: comentario_interno_incidente)
ALTER TABLE comentario_interno_incidente ADD CONSTRAINT comentario_interno_incidente_incidentes
    FOREIGN KEY (id_incidente)
    REFERENCES incidentes (id_incidente);

-- Reference: comentario_interno_incidente_users (table: comentario_interno_incidente)
ALTER TABLE comentario_interno_incidente ADD CONSTRAINT comentario_interno_incidente_users
    FOREIGN KEY (id_user)
    REFERENCES users (id_user);

-- Reference: evidencia_incidentes (table: evidencia)
ALTER TABLE evidencia ADD CONSTRAINT evidencia_incidentes
    FOREIGN KEY (id_incidente)
    REFERENCES incidentes (id_incidente);

-- Reference: evidencia_users (table: evidencia)
ALTER TABLE evidencia ADD CONSTRAINT evidencia_users
    FOREIGN KEY (id_user)
    REFERENCES users (id_user);

-- Reference: incidentes_ct_aplicaciones (table: incidentes)
ALTER TABLE incidentes ADD CONSTRAINT incidentes_ct_aplicaciones
    FOREIGN KEY (id_aplicacion)
    REFERENCES ct_aplicaciones (id_aplicacion);

-- Reference: incidentes_ct_prioridad_incidente (table: incidentes)
ALTER TABLE incidentes ADD CONSTRAINT incidentes_ct_prioridad_incidente
    FOREIGN KEY (id_prioridad_incidente)
    REFERENCES ct_prioridad_incidente (id_prioridad_incidente);

-- Reference: incidentes_ct_status_incidente (table: incidentes)
ALTER TABLE incidentes ADD CONSTRAINT incidentes_ct_status_incidente
    FOREIGN KEY (id_estatus_incidente)
    REFERENCES ct_status_incidente (id_estatus_incidente);

-- Reference: incidentes_ct_tipo_incidente (table: incidentes)
ALTER TABLE incidentes ADD CONSTRAINT incidentes_ct_tipo_incidente
    FOREIGN KEY (id_tipo_incidente)
    REFERENCES ct_tipo_incidente (id_tipo_incidente);

-- Reference: incidentes_users (table: incidentes)
ALTER TABLE incidentes ADD CONSTRAINT incidentes_users
    FOREIGN KEY (id_user)
    REFERENCES users (id_user);

-- Reference: users_ct_tipo_user (table: users)
ALTER TABLE users ADD CONSTRAINT users_ct_tipo_user
    FOREIGN KEY (id_tipo_user)
    REFERENCES ct_tipo_user (id_tipo_user);

-- End of file.

