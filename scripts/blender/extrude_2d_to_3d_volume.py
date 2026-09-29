import bmesh
import bpy


def automate_2d_to_3d():
    """Turn the selected planar mesh into a rounded three-dimensional volume."""

    obj = bpy.context.active_object

    if not obj or obj.type != 'MESH':
        print('Error: Please select a 2D mesh object first!')
        return

    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(obj.data)

    # The later bisect operation creates additional boundary-like vertices. Keep
    # the original XY positions so only the genuine outer and inner rims move.
    # Rounding avoids mismatches caused by small floating-point differences.
    boundary_xy = set()
    for edge in bm.edges:
        if edge.is_boundary:
            for vertex in edge.verts:
                boundary_xy.add(
                    (round(vertex.co.x, 4), round(vertex.co.y, 4)),
                )

    faces = bm.faces[:]
    if not faces:
        print('Error: The mesh has no faces!')
        bpy.ops.object.mode_set(mode='OBJECT')
        return

    # An extrusion height of 0.5 gives the final tube a radius of 0.25.
    extrusion_result = bmesh.ops.extrude_face_region(bm, geom=faces)
    top_faces = [
        item
        for item in extrusion_result['geom']
        if isinstance(item, bmesh.types.BMFace)
    ]
    top_vertices = list(
        {vertex for face in top_faces for vertex in face.verts},
    )
    bmesh.ops.translate(
        bm,
        vec=(0, 0, 0.5),
        verts=top_vertices,
    )

    z_coordinates = [vertex.co.z for vertex in bm.verts]
    z_min = min(z_coordinates)
    z_max = max(z_coordinates)
    z_mid = (z_max + z_min) / 2.0

    # Bisecting halfway through the extrusion creates the equatorial control
    # ring required for a nearly circular subdivided cross-section.
    geometry = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(
        bm,
        geom=geometry,
        dist=0.0001,
        plane_co=(0, 0, z_mid),
        plane_no=(0, 0, 1),
        clear_inner=False,
        clear_outer=False,
    )

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    boundary_vertices = []
    for vertex in bm.verts:
        is_top_or_bottom = (
            abs(vertex.co.z - z_min) < 0.001
            or abs(vertex.co.z - z_max) < 0.001
        )
        vertex_xy = (
            round(vertex.co.x, 4),
            round(vertex.co.y, 4),
        )

        if is_top_or_bottom and vertex_xy in boundary_xy:
            boundary_vertices.append(vertex)

    # For radius r = 0.25, r * (sqrt(2) - 1) is approximately 0.10355.
    # Moving the top and bottom rims inward by this amount produces the control
    # vertices of a regular octagonal cross-section before subdivision.
    boundary_offset = -0.10355
    for vertex in boundary_vertices:
        vertex.co += vertex.normal * boundary_offset

    bmesh.update_edit_mesh(obj.data)
    bpy.ops.object.mode_set(mode='OBJECT')

    for polygon in obj.data.polygons:
        polygon.use_smooth = True

    # Keep the modifier unapplied so the resulting topology can be inspected
    # before the dense mesh is created for shape-key editing.
    modifier_name = 'Subdivision'
    if modifier_name not in obj.modifiers:
        modifier = obj.modifiers.new(
            name=modifier_name,
            type='SUBSURF',
        )
    else:
        modifier = obj.modifiers[modifier_name]

    modifier.levels = 3
    modifier.render_levels = 3


if __name__ == '__main__':
    automate_2d_to_3d()
