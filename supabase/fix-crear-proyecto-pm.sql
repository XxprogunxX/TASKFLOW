-- ============================================================
-- PARCHE RÁPIDO: ejecuta SOLO esto en Supabase → SQL Editor → Run
-- Corrige: invalid input value for enum rol_equipo: "lider"
-- ============================================================

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
  SELECT id_usuario INTO v_id_usuario
  FROM public.usuarios
  WHERE auth_id = auth.uid();

  IF v_id_usuario IS NULL THEN
    RAISE EXCEPTION 'No se encontró el perfil del usuario autenticado';
  END IF;

  INSERT INTO public.equipos (nombre, descripcion)
  VALUES (p_nombre, p_descripcion)
  RETURNING id_equipo INTO v_id_equipo;

  INSERT INTO public.proyectos (id_equipo, nombre, descripcion, estado)
  VALUES (v_id_equipo, p_nombre, p_descripcion, 'planeado')
  RETURNING id_proyecto INTO v_id_proyecto;

  INSERT INTO public.usuarios_equipos (id_usuario, id_equipo, rol)
  VALUES (v_id_usuario, v_id_equipo, 'pm'::rol_equipo);

  RETURN QUERY
  SELECT *
  FROM public.proyectos
  WHERE id_proyecto = v_id_proyecto;
END;
$$;

GRANT EXECUTE ON FUNCTION public.crear_proyecto_con_equipo(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crear_proyecto_con_equipo(text, text) TO anon;

-- Comprueba que ya no diga "lider":
SELECT
  CASE
    WHEN prosrc LIKE '%lider%' THEN 'ERROR: aún contiene lider — contacta soporte'
    WHEN prosrc LIKE '%pm%' THEN 'OK: función actualizada con rol pm'
    ELSE 'Revisa manualmente la función'
  END AS estado
FROM pg_proc
WHERE proname = 'crear_proyecto_con_equipo';
