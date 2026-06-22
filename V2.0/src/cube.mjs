import {Vertice, Object} from "./basics.mjs"

export const Cube = {
    init: function(size, offset, rotation)
    {
        const obj = new Object(Cube.vertices, Cube.faces, offset, rotation)

        for (var v of obj.vertice) {
            v.x *= size
            v.y *= size
            v.z *= size
        }

        return obj
    },

    vertices: [
        {x:  1, y:  1, z:  1},
        {x: -1, y:  1, z:  1},
        {x: -1, y: -1, z:  1},
        {x:  1, y: -1, z:  1},

        {x:  1, y:  1, z: -1},
        {x: -1, y:  1, z: -1},
        {x: -1, y: -1, z: -1},
        {x:  1, y: -1, z: -1},
    ],

    faces: [
        [0,1,2,3],
        [4,5,6,7],

        [4,0,1,5],
        [7,3],
        [6,2],
    ]
}