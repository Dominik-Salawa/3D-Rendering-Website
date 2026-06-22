// SET-UP
document.body.style.color = "#ffffff"
document.body.style.backgroundColor = "#222222"


// VARIABLES
var FPS = 144
const game  = document.getElementById("game")
game.width  = window.innerWidth
game.height = window.innerHeight

const ctx = game.getContext("2d")

// FUNCS
function clear_display()
{
    ctx.fillStyle = "#121215"
    ctx.fillRect(0,0,game.width,game.height)
}

function render_vertice({x,y})
{
    const s = 5
    ctx.fillStyle = "#00A800"
    ctx.fillRect(x - (s/2), y - (s/2), s, s)
}

function draw_line(p1,p2)
{
    if (p1.z < 0)
        return
    if (p2.z < 0)
        return

    //ctx.strokeStyle = "#00A800"
    ctx.strokeStyle = "#8600a8"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
}



// CONVERTING
function coordinates_to_pixel({x,y})
{
    var new_x = ((x+1)/2*game.height) + (game.width - game.height)/2
    var new_y = (1-y)/2*game.height

    return {
        x: new_x,
        y: new_y
    }
}

function rotate_yaw_xz({x,y,z}, angle)
{
    const angle_rad = angle * (Math.PI/180)
    const c = Math.cos(angle_rad);
    const s = Math.sin(angle_rad);
    return {
        x: x*c-z*s,
        y: y,
        z: x*s+z*c,
    };
}

function rotate_pitch_yz({x,y,z}, angle)
{
    const angle_rad = angle * (Math.PI/180)
    const c = Math.cos(angle_rad);
    const s = Math.sin(angle_rad);
    return {
        x,
        y: y*c-z*s,
        z: y*s+z*c,
    };
}

function rotate_roll_xy({x,y,z}, angle)
{
    const angle_rad = angle * (Math.PI/180)
    const c = Math.cos(angle_rad);
    const s = Math.sin(angle_rad);
    return {
        x: x*c-y*s,
        y: x*s+y*c,
        z,
    };
}

function rotate(vertice, angle)
{
    return rotate_yaw_xz(rotate_pitch_yz(rotate_roll_xy(vertice, angle.y), angle.x), angle.z)
}

function apply_offset({x,y,z}, offset)
{
    return {x:x+offset.x, y:y+offset.y, z:z+offset.z}
}

function XYZ_project(vertice)
{
    return {
        x: vertice.x / vertice.z,
        y: vertice.y / vertice.z,
    }
}






import {Vertice, Object} from "./src/basics.mjs"
import {Cube} from "./src/cube.mjs"
import {Penger} from "./src/penger.mjs"

var Objects = [
    Cube.init(1, {x:0,y:0,z:1}, {x:0,y:0,z:0}),
    Penger.init(2, {x:0,y:-0.1,z:1}, {x:0,y:0,z:0})
];






var Camera_spawnpoint = {x:0,y:0,z:-5}
const Camera = new Object(new Vertice(0,0,0), [], Camera_spawnpoint, {x:0,y:0,z:0})
const Camera_velocity = {x:0,y:0,z:0};
const Camera_rotation_velocity = {x:0,y:0,z:0};

function clip_3d_line(p1, p2, zNear = 0.1) {
    // Both points are safely in front of the camera
    if (p1.z >= zNear && p2.z >= zNear) {
        return { 
            p1: { ...p1 }, 
            p2: { ...p2 }, 
            visible: true 
        }
    }
    // Both points are behind or too close to the camera lens
    if (p1.z < zNear && p2.z < zNear) {
        return { visible: false }
    }

    // Clone the points to avoid altering original object geometries
    var out1 = { ...p1 }
    var out2 = { ...p2 }

    // Point 1 is safe, Point 2 crossed behind the camera plane
    if (p1.z >= zNear && p2.z < zNear) {
        var t = (zNear - p1.z) / (p2.z - p1.z)
        out2.x = p1.x + t * (p2.x - p1.x)
        out2.y = p1.y + t * (p2.y - p1.y)
        out2.z = zNear
    } 
    // Point 2 is safe, Point 1 crossed behind the camera plane
    else if (p2.z >= zNear && p1.z < zNear) {
        var t = (zNear - p2.z) / (p1.z - p2.z)
        out1.x = p2.x + t * (p1.x - p2.x)
        out1.y = p2.y + t * (p1.y - p2.y)
        out1.z = zNear
    }

    return { 
        p1: out1, 
        p2: out2, 
        visible: true 
    }
}




var display_vertices = false
var display_faces = true
function main()
{   
    Camera.offset = apply_offset(
        Camera.offset,
        Camera_velocity
    )
    Camera.rotation = apply_offset(Camera.rotation, Camera_rotation_velocity)

    const tmp_Camera_offset = {
        x: -Camera.offset.x,
        y: -Camera.offset.y,
        z: -Camera.offset.z
    }
    const tmp_Camera_rotation = {
        x: -Camera.rotation.x,
        y: -Camera.rotation.y,
        z: -Camera.rotation.z
    }

    var dt = 1/FPS
    clear_display()
    for (const o of Objects) {
        const real_offset = apply_offset(o.offset, tmp_Camera_offset)
        const real_rotation = rotate(o.rotation, Camera.rotation)
        if (display_vertices) {
            for (const v of o.vertice) {
                const coords = apply_offset(rotate(v, real_rotation), real_offset)
                const final_coords = rotate(coords, tmp_Camera_rotation)

                if (final_coords.z < 0)
                    continue

                render_vertice(
                    coordinates_to_pixel(
                        XYZ_project(final_coords)
                    )
                )
            }
        }
        if (!display_faces) continue;

        for (const f of o.faces) {
             for (var i = 0; i < f.length; ++i) {
                const a = o.vertice[f[i]]
                const b = o.vertice[f[(i+1)%f.length]]

                const a_rot = rotate(a, real_rotation)
                const b_rot = rotate(b, real_rotation)

                const a_offset = apply_offset(a_rot, real_offset)
                const b_offset = apply_offset(b_rot, real_offset)

                const a_coords = rotate(a_offset, tmp_Camera_rotation)
                const b_coords = rotate(b_offset, tmp_Camera_rotation)

                const clipped = clip_3d_line(a_coords, b_coords, 0.1)
                if (!clipped.visible) continue

                draw_line(
                    coordinates_to_pixel(XYZ_project(clipped.p1)),
                    coordinates_to_pixel(XYZ_project(clipped.p2))
                )
            }
        }
    }
    setTimeout(main, 1000/FPS)
}
main()







window.addEventListener('resize', () => {
    game.width  = window.innerWidth
    game.height = window.innerHeight
})



const assets = [
    Cube, Penger
];

const CAMERA_OFFSET = 5/FPS
const CAMERA_ROTATION_OFFSET = 180/FPS
var option = 0
document.addEventListener('keydown', function(event) {
    const tagName = event.target.tagName.toLowerCase();

    if (tagName === 'input' || tagName === 'textarea' || event.target.isContentEditable || event.repeat) {
        return; 
    }

    const key = event.key.toLowerCase();

    // reset camera velocity
    if (key === 'z') {
        Camera_velocity.x = 0
        Camera_velocity.y = 0
        Camera_velocity.z = 0
    }

    // teleport back to spawnpoint
    if (key === 't') {
        Camera.offset = Camera_spawnpoint
    }
    // set spawnpoint to where im at
    if (key === 'y') {
        Camera_spawnpoint = Camera.offset
    }
    // delete all objects
    if (key === 'm') {
        Objects = []
    }

    if (key === 'v') {
        display_vertices = !display_vertices
    }
    if (key === 'b') {
        display_faces = !display_faces
    }

    if (key >= '0' && key <= '9') {
        let num = key - '0'
        if (num <= assets.length) {
            option = num-1
        }
    }

    if (key === 'w') {
        Camera_velocity.z += CAMERA_OFFSET
    }
    if (key === 'a') {
        Camera_velocity.x -= CAMERA_OFFSET
    }
    if (key === 's') {
        Camera_velocity.z -= CAMERA_OFFSET
    }
    if (key === 'd') {
        Camera_velocity.x += CAMERA_OFFSET
    }

    if (key === 'q') {
        Camera_velocity.y -= CAMERA_OFFSET
    }
    if (key === 'e') {
        Camera_velocity.y += CAMERA_OFFSET
    }

    if (key === 'arrowup') {
        Camera_rotation_velocity.x += CAMERA_ROTATION_OFFSET
    }
    if (key === 'arrowdown') {
        Camera_rotation_velocity.x -= CAMERA_ROTATION_OFFSET
    }
    if (key === 'arrowleft') {
        Camera_rotation_velocity.z += CAMERA_ROTATION_OFFSET
    }
    if (key === 'arrowright') {
        Camera_rotation_velocity.z -= CAMERA_ROTATION_OFFSET
    }

    if (key === 'enter') {
        Objects.push(assets[option].init(1, Camera.offset, {x:0, y:0, z:0}))
    }
});

document.addEventListener('keyup', function(event) {
    const tagName = event.target.tagName.toLowerCase();

    if (tagName === 'input' || tagName === 'textarea' || event.target.isContentEditable  || event.repeat) {
        return; 
    }

    const key = event.key.toLowerCase();

    if (key === 'w') {
        Camera_velocity.z -= CAMERA_OFFSET
    }
    if (key === 'a') {
        Camera_velocity.x += CAMERA_OFFSET
    }
    if (key === 's') {
        Camera_velocity.z += CAMERA_OFFSET
    }
    if (key === 'd') {
        Camera_velocity.x -= CAMERA_OFFSET
    }

    if (key === 'q') {
        Camera_velocity.y += CAMERA_OFFSET
    }
    if (key === 'e') {
        Camera_velocity.y -= CAMERA_OFFSET
    }

    if (key === 'arrowup') {
        Camera_rotation_velocity.x -= CAMERA_ROTATION_OFFSET
    }
    if (key === 'arrowdown') {
        Camera_rotation_velocity.x += CAMERA_ROTATION_OFFSET
    }
    if (key === 'arrowleft') {
        Camera_rotation_velocity.z -= CAMERA_ROTATION_OFFSET
    }
    if (key === 'arrowright') {
        Camera_rotation_velocity.z += CAMERA_ROTATION_OFFSET
    }
});