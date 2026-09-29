import math

import bmesh
import bpy
import mathutils


def generate_genus2_base():
    """Generate the planar low-poly starting mesh for the genus-2 surface."""

    object_name = 'Genus2_2D_Base'

    # Three concentric rings provide two quad strips across each handle. Their
    # outer boundaries are joined below to form the central bridge.
    radius = 1.0
    segments = 24
    ring_spacing = 0.0
    bridge_width_edges = 3

    x_offset = radius + ring_spacing / 2.0
    ring_centers = [
        mathutils.Vector((-x_offset, 0, 0)),
        mathutils.Vector((x_offset, 0, 0)),
    ]

    mesh = bpy.data.meshes.new(object_name)
    obj = bpy.data.objects.new(object_name, mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    bm = bmesh.new()
    # Retain the outer rings because selected arcs on them become the bridge.
    outer_ring_vertices = []

    for center in ring_centers:
        outer_vertices = []
        middle_vertices = []
        inner_vertices = []

        for index in range(segments):
            angle = math.pi * 2 * index / segments
            direction = mathutils.Vector(
                (math.cos(angle), math.sin(angle), 0),
            )

            outer_vertices.append(
                bm.verts.new(direction * radius + center),
            )
            middle_vertices.append(
                bm.verts.new(direction * (radius * 0.75) + center),
            )
            inner_vertices.append(
                bm.verts.new(direction * (radius * 0.5) + center),
            )

        outer_ring_vertices.append(outer_vertices)

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

    # bridge_edge_loops acts on the current mesh selection, so clear every
    # element before selecting the two opposing boundary arcs.
    for vertex in bm.verts:
        vertex.select = False
    for edge in bm.edges:
        edge.select = False
    for face in bm.faces:
        face.select = False

    bm.edges.ensure_lookup_table()

    # On the left handle, the arc around angle 0 points toward the center.
    for index in range(-bridge_width_edges, bridge_width_edges):
        ring_index = index % segments
        next_index = (index + 1) % segments
        edge = bm.edges.get(
            (
                outer_ring_vertices[0][ring_index],
                outer_ring_vertices[0][next_index],
            ),
        )
        if edge:
            edge.select = True

    # On the right handle, the opposing arc lies around angle pi.
    half_segments = segments // 2
    for index in range(
        half_segments - bridge_width_edges,
        half_segments + bridge_width_edges,
    ):
        ring_index = index % segments
        next_index = (index + 1) % segments
        edge = bm.edges.get(
            (
                outer_ring_vertices[1][ring_index],
                outer_ring_vertices[1][next_index],
            ),
        )
        if edge:
            edge.select = True

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()

    # The selected arcs survive the BMesh conversion and provide the two loops
    # consumed by Blender's bridge operator.
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.bridge_edge_loops(
        number_cuts=1,
        interpolation='LINEAR',
    )
    bpy.ops.object.mode_set(mode='OBJECT')


if __name__ == '__main__':
    generate_genus2_base()
