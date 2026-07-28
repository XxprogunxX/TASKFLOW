-- ============================================================
-- Ejecuta TODO en Supabase → SQL Editor → Run
-- Corrige recursión infinita en políticas RLS
-- ============================================================

-- ------------------------------------------------------------
-- Helpers SECURITY DEFINER (evitan recursión entre tablas)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_current_usuario_id()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id_usuario
  FROM public.usuarios
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_usuario_profile()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios WHERE auth_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_member_of_equipo(p_id_equipo bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios_equipos ue
    WHERE ue.id_equipo = p_id_equipo
      AND ue.id_usuario = public.get_current_usuario_id()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_member_of_proyecto(p_id_proyecto bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.proyectos p
    WHERE p.id_proyecto = p_id_proyecto
      AND public.is_member_of_equipo(p.id_equipo)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_current_usuario_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_usuario_profile() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_member_of_equipo(bigint) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_member_of_proyecto(bigint) TO authenticated, anon;

DROP FUNCTION IF EXISTS public.rol_equipo_para_creador();

-- ------------------------------------------------------------
-- RPC: crear equipo + proyecto + membresía (rol pm para el creador)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.crear_proyecto_con_equipo(
  p_nombre text,
  p_descripcion text DEFAULT NULL
)
RETURNS SETOF public.proyectos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id_usuario bigint;
  v_id_equipo bigint;
  v_id_proyecto bigint;
BEGIN
  v_id_usuario := public.get_current_usuario_id();

  IF v_id_usuario IS NULL THEN
    RAISE EXCEPTION 'No se encontró el perfil del usuario autenticado';
  END IF;

  INSERT INTO public.equipos (nombre, descripcion)
  VALUES (p_nombre, p_descripcion)
  RETURNING id_equipo INTO v_id_equipo;

  INSERT INTO public.proyectos (id_equipo, nombre, descripcion, estado)
  VALUES (v_id_equipo, p_nombre, p_descripcion, 'planeado')
  RETURNING id_proyecto INTO v_id_proyecto;

  -- Creador del equipo = Project Manager (enum rol_equipo: pm, po, qa, developer, business_analyst)
  INSERT INTO public.usuarios_equipos (id_usuario, id_equipo, rol)
  VALUES (v_id_usuario, v_id_equipo, 'pm'::rol_equipo);

  RETURN QUERY
  SELECT *
  FROM public.proyectos
  WHERE id_proyecto = v_id_proyecto;
END;
$$;

GRANT EXECUTE ON FUNCTION public.crear_proyecto_con_equipo(text, text) TO authenticated, anon;

-- ------------------------------------------------------------
-- USUARIOS: políticas simples SIN joins (rompe la recursión)
-- ------------------------------------------------------------

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'usuarios'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.usuarios', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY usuarios_select_own ON public.usuarios
  FOR SELECT TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY usuarios_insert_own ON public.usuarios
  FOR INSERT TO authenticated
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY usuarios_update_own ON public.usuarios
  FOR UPDATE TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- ------------------------------------------------------------
-- EQUIPOS
-- ------------------------------------------------------------

ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS equipos_select_miembros ON public.equipos;
DROP POLICY IF EXISTS equipos_insert_authenticated ON public.equipos;

CREATE POLICY equipos_select_miembros ON public.equipos
  FOR SELECT TO authenticated
  USING (public.is_member_of_equipo(id_equipo));

CREATE POLICY equipos_insert_authenticated ON public.equipos
  FOR INSERT TO authenticated
  WITH CHECK (public.has_usuario_profile());

-- ------------------------------------------------------------
-- PROYECTOS
-- ------------------------------------------------------------

ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS proyectos_select_miembros ON public.proyectos;
DROP POLICY IF EXISTS proyectos_insert_authenticated ON public.proyectos;

CREATE POLICY proyectos_select_miembros ON public.proyectos
  FOR SELECT TO authenticated
  USING (public.is_member_of_equipo(id_equipo));

CREATE POLICY proyectos_insert_authenticated ON public.proyectos
  FOR INSERT TO authenticated
  WITH CHECK (public.has_usuario_profile());

-- ------------------------------------------------------------
-- USUARIOS_EQUIPOS (sin subconsultas a la misma tabla)
-- ------------------------------------------------------------

ALTER TABLE public.usuarios_equipos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS usuarios_equipos_select_propios ON public.usuarios_equipos;
DROP POLICY IF EXISTS usuarios_equipos_insert_propio ON public.usuarios_equipos;

CREATE POLICY usuarios_equipos_select_miembros ON public.usuarios_equipos
  FOR SELECT TO authenticated
  USING (public.is_member_of_equipo(id_equipo));

CREATE POLICY usuarios_equipos_insert_propio ON public.usuarios_equipos
  FOR INSERT TO authenticated
  WITH CHECK (id_usuario = public.get_current_usuario_id());

-- ------------------------------------------------------------
-- ACTIVIDADES
-- ------------------------------------------------------------

ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS actividades_select_miembros ON public.actividades;
DROP POLICY IF EXISTS actividades_insert_miembros ON public.actividades;

CREATE POLICY actividades_select_miembros ON public.actividades
  FOR SELECT TO authenticated
  USING (public.is_member_of_proyecto(id_proyecto));

CREATE POLICY actividades_insert_miembros ON public.actividades
  FOR INSERT TO authenticated
  WITH CHECK (public.is_member_of_proyecto(id_proyecto));

-- Verificación opcional:
-- SELECT proname FROM pg_proc WHERE proname IN ('crear_proyecto_con_equipo', 'get_current_usuario_id');
