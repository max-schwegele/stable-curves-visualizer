import math

import bmesh
import bpy
import mathutils


def generate_genus3_base():
    """Generate the planar low-poly starting mesh for the genus-3 surface."""

    object_name = 'Genus3_2D_Base'

    # The three handles are copies of the same concentric-ring mesh, positioned
    # symmetrically around the origin at 120-degree intervals.
    radius = 1.0
    distance_factor = 1.7
    center_distance = distance_factor * radius
    segments = 24

    # Each outer ring receives a flat inward extension. These extensions are
    # connected manually in Blender to produce the final central region.
    extrude_distance = 0.0
    extension_edges_left = 4
    extension_edges_right = 4

    flat_edge_y = center_distance - radius - extrude_distance
    bottom_index = int(segments * 0.75)
    start_index = bottom_index - extension_edges_left

    mesh = bpy.data.meshes.new(object_name)
    obj = bpy.data.objects.new(object_name, mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    bm = bmesh.new()

    for handle_index in range(3):
        angle_offset = math.radians(handle_index * 120)
        # Build one handle in a local upward orientation, then rotate the whole
        # construction into its final position.
        rotation = mathutils.Matrix.Rotation(angle_offset, 4, 'Z')

        outer_vertices = []
        middle_vertices = []
        inner_vertices = []

        for index in range(segments):
            angle = math.pi * 2 * index / segments
            direction = mathutils.Vector(
                (math.cos(angle), math.sin(angle), 0),
            )
            center = mathutils.Vector((0, center_distance, 0))

            outer_vertices.append(
                bm.verts.new(rotation @ (direction * radius + center)),
            )
            middle_vertices.append(
                bm.verts.new(
                    rotation @ (direction * (radius * 0.75) + center),
                ),
            )
            inner_vertices.append(
                bm.verts.new(
                    rotation @ (direction * (radius * 0.5) + center),
                ),
            )

        for index in range(segments):
            next_index = (index + 1) % segments
            bm.faces.new(
                (
                    outer_vertices[index],
                    outer_vertices[next_index],
                    middle_vertices[next_index],
                    middle_vertices[index],
                ),
            )
            bm.faces.new(
                (
                    middle_vertices[index],
                    middle_vertices[next_index],
                    inner_vertices[next_index],
                    inner_vertices[index],
                ),
            )

        # Flatten the vertices nearest the origin so the three extensions have
        # compatible boundaries for the subsequent manual fill operation.
        flat_vertices = {}
        extension_length = extension_edges_left + extension_edges_right

        for step in range(extension_length + 1):
            index = (start_index + step) % segments
            angle = math.pi * 2 * index / segments
            flat_position = mathutils.Vector(
                (math.cos(angle) * radius, flat_edge_y, 0),
            )
            flat_vertices[index] = bm.verts.new(rotation @ flat_position)

        for step in range(extension_length):
            index = (start_index + step) % segments
            next_index = (index + 1) % segments
            bm.faces.new(
                (
                    outer_vertices[index],
                    outer_vertices[next_index],
                    flat_vertices[next_index],
                    flat_vertices[index],
                ),
            )

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()


if __name__ == '__main__':
    generate_genus3_base()
