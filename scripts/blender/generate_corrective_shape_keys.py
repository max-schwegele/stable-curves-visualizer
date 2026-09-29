import bpy
from mathutils import Vector


def generate_corrective_keys():
    """Create corrective keys for compatible pinches with overlapping falloff."""

    obj = bpy.context.active_object
    shape_keys = obj.data.shape_keys.key_blocks

    # These pairs and triples are topologically compatible, but their
    # proportional-editing domains overlap in the genus-3 mesh.
    combinations = [
        ['E1', 'E2'],
        ['E1', 'E3'],
        ['E2', 'E3'],
        ['B12', 'B13'],
        ['B12', 'B23'],
        ['B13', 'B23'],
        ['H1*', 'E2'],
        ['H1*', 'E3'],
        ['H1*', 'B12'],
        ['H1*', 'B13'],
        ['E1', 'E2', 'E3'],
        ['B12', 'B13', 'B23'],
        ['H1*', 'E2', 'E3'],
        ['H1*', 'E2', 'B13'],
        ['H1*', 'B12', 'E3'],
        ['H1*', 'B12', 'B13'],
    ]

    # Squared deformation lengths favor the locally dominant base key. The
    # bulge term softens areas in which several keys contribute similarly.
    weight_exponent = 2.0
    bulge_factor = 0.15
    epsilon = 1e-6

    for shape_names in combinations:
        # Replace '*' with 's' in corrective-key names so they match the
        # identifiers expected by the application.
        correction_name = 'C_' + '_'.join(shape_names).replace('*', 's')

        if correction_name in shape_keys:
            obj.shape_key_remove(shape_keys[correction_name])

        corrective_key = obj.shape_key_add(
            name=correction_name,
            from_mix=False,
        )

        basis_vertices = shape_keys['Basis'].data
        target_vertices = [shape_keys[name].data for name in shape_names]
        correction_vertices = corrective_key.data
        shape_count = len(shape_names)
        equal_weight = 1.0 / shape_count

        for index in range(len(basis_vertices)):
            basis_position = basis_vertices[index].co
            deltas = [
                target[index].co - basis_position
                for target in target_vertices
            ]
            lengths = [delta.length for delta in deltas]
            total_weight = sum(
                length**weight_exponent for length in lengths
            )

            if total_weight < epsilon:
                correction_vertices[index].co = basis_position
                continue

            weights = [
                length**weight_exponent / total_weight
                for length in lengths
            ]

            # Blender already adds every base-key delta. The corrective key must
            # therefore contribute the desired weighted deformation minus that
            # additive result.
            weighted_delta = Vector((0, 0, 0))
            for weight, delta in zip(weights, deltas):
                weighted_delta += weight * delta

            summed_delta = Vector((0, 0, 0))
            for delta in deltas:
                summed_delta += delta

            correction_delta = weighted_delta - summed_delta

            if bulge_factor > 0.0:
                maximum_weight = max(weights)
                if maximum_weight < 1.0:
                    overlap = (1.0 - maximum_weight) / (
                        1.0 - equal_weight
                    )
                    # Smoothstep prevents abrupt changes near the edge of an
                    # overlapping proportional-editing domain.
                    overlap = overlap**2 * (3.0 - 2.0 * overlap)
                else:
                    overlap = 0.0

                correction_delta -= weighted_delta * (
                    bulge_factor * overlap
                )

            correction_vertices[index].co = (
                basis_position + correction_delta
            )

        print(f'Generated corrective key: {correction_name}')


if __name__ == '__main__':
    generate_corrective_keys()
