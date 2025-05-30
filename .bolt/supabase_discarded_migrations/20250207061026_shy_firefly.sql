-- Create function to get org chart with proper recursion
CREATE OR REPLACE FUNCTION get_org_chart(root_id uuid)
RETURNS jsonb AS $$
WITH RECURSIVE org_tree AS (
  -- Base case: get the root node
  SELECT 
    p.id,
    p.name,
    p.role,
    p.avatar_url,
    p.attendance->>'reports_to' as reports_to,
    ARRAY[p.id] as path,
    0 as depth
  FROM profiles p
  WHERE p.id = root_id

  UNION

  -- Get reports recursively
  SELECT 
    p.id,
    p.name,
    p.role,
    p.avatar_url,
    p.attendance->>'reports_to' as reports_to,
    t.path || p.id,
    t.depth + 1
  FROM profiles p, org_tree t
  WHERE p.attendance->>'reports_to' = t.id::text
    AND t.depth < 2  -- Limit depth to 2 levels
    AND NOT p.id = ANY(t.path)  -- Prevent cycles
)
SELECT jsonb_build_object(
  'id', root.id,
  'name', root.name,
  'role', root.role,
  'avatar', root.avatar_url,
  'children', COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', child.id,
          'name', child.name,
          'role', child.role,
          'avatar', child.avatar_url,
          'children', COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'id', grandchild.id,
                  'name', grandchild.name,
                  'role', grandchild.role,
                  'avatar', grandchild.avatar_url
                )
                ORDER BY grandchild.role DESC, grandchild.name
              )
              FROM org_tree grandchild
              WHERE grandchild.reports_to = child.id::text
                AND grandchild.depth = 2
            ),
            '[]'::jsonb
          )
        )
        ORDER BY child.role DESC, child.name
      )
      FROM org_tree child
      WHERE child.reports_to = root.id::text
        AND child.depth = 1
    ),
    '[]'::jsonb
  )
)
FROM org_tree root
WHERE root.id = root_id
  AND root.depth = 0;
$$ LANGUAGE sql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_org_chart TO authenticated;