export class Vertice {
    constructor(x,y,z) {
        this.x = x
        this.y = y
        this.z = z
    }
}

export class Object {
    constructor(vertice, faces, offset, rotation) {
        this.vertice   = vertice
        this.faces     = faces
        this.offset    = offset
        this.rotation  = rotation
    }
}