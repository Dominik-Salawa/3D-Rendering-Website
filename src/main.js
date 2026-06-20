// ESSENTIALS
var color = "#10ffA0";
var FPS = 60;

import { Penger } from "./penger.mjs";
import { Cube } from "./cube.mjs";

class Object {
    constructor(vertices, faces, offset, rotation)
    {
        this.vertices = vertices;
        this.faces = faces;
        this.offset = offset;
        this.rotation = rotation;
    }
}


function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var Objects = [
    new Object(Cube.vertices, Cube.faces,     {x:randint(-2,2),y:randint(-1.5,1.5),z:randint(0.8,5)}, {x:randint(0,6),y:randint(0,6),z:randint(0,6)}),
    new Object(Penger.vertices, Penger.faces, {x:randint(-2,2),y:randint(-1.5,1.5),z:randint(0.8,5)}, {x:randint(0,6),y:randint(0,6),z:randint(0,6)}),
];

// WEBSITE ITSELF

const fpsslider = document.getElementById("fpsslider");
const fpsinfo = document.getElementById("fpsinfo");

fpsinfo.textContent = FPS; // just incase
fpsslider.value = FPS;

fpsslider.oninput = function()
{
    FPS = this.value;
    fpsinfo.textContent = FPS;
}

const colorpicker = document.getElementById("colorpicker");
colorpicker.value = color;

colorpicker.onchange = function()
{
    color = colorpicker.value;
}



// ITEMS
const linuxpeng_btn = document.getElementById("linuxpeng_btn");
const cube_btn = document.getElementById("cube_btn");
const clear_btn = document.getElementById("clear_btn");

linuxpeng_btn.onclick = function()
{
    Objects.push(new Object(Penger.vertices, Penger.faces, {x:randint(-2,2),y:randint(-2,2),z:randint(0.8,5)}, {x:randint(0,6),y:randint(0,6),z:randint(0,6)}));
}
cube_btn.onclick = function()
{
    Objects.push(new Object(Cube.vertices, Cube.faces, {x:randint(-2,2),y:randint(-2,2),z:randint(0.8,5)}, {x:randint(0,6),y:randint(0,6),z:randint(0,6)}));
}
clear_btn.onclick = function()
{
    Objects = [];
}












// MATH STUFF

const game = document.getElementById("game");
game.width  = 800;
game.height = 800;

const vertice_size = 15;
const ctx = game.getContext("2d")


function scale_to_pixel(coord)
{
    return {
        x: (coord.x + 1)/2*game.width,
        y: (1-(coord.y + 1)/2)*game.height,
    };
}


function draw_line(p1,p2)
{
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}


function draw_vertice(coord)
{
    ctx.fillStyle = "#4bb13e";
    ctx.fillRect(
        coord.x - vertice_size/2,
        coord.y - vertice_size/2,
        vertice_size,
        vertice_size
    );
}

function rotate_xz({x,y,z}, angle)
{
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
        x: x*c-z*s,
        y: y,
        z: x*s+z*c,
    };
}

function rotate_xy({x,y,z}, angle)
{
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
        x: x*c-y*s,
        y: x*s+y*c,
        z: z,
    };
}

function clear_canvas()
{
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0,0,game.width,game.height);
}

function project({x,y,z})
{
    return {
        x: x/z,
        y: y/z,
    };
}

function offset({x,y,z}, offset)
{
    return {x:x+offset.x, y:y+offset.y, z: z+offset.z};
}

function paint_canvas()
{
    const dt = 1/FPS;
    clear_canvas();

    /*
    for (const obj of Objects) {
        for (const v of obj.vertices) {
            draw_vertice(
                scale_to_pixel(
                    project(offset(rotate_xy(rotate_xz(v, obj.rotation.z), obj.rotation.y), obj.offset))
                )
            );
        }
    }
    */

    for (const obj of Objects) {
        obj.rotation.z += Math.PI*dt;
        obj.rotation.y += 0.01;
        for (const face of obj.faces) {
            for (var i = 0; i < face.length; ++i) {
                const point_a = obj.vertices[face[i]];
                const point_b = obj.vertices[face[(i+1)%face.length]];
                draw_line(
                    scale_to_pixel(
                        project(offset(rotate_xy(rotate_xz(point_a, obj.rotation.z), obj.rotation.y), obj.offset))
                    ),
                    scale_to_pixel(
                        project(offset(rotate_xy(rotate_xz(point_b, obj.rotation.z), obj.rotation.y), obj.offset))
                    )
                );
            }
        }
    }
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// rendering shi
clear_canvas();
paint_canvas();
while (true) {
    await wait(1000/FPS)
    paint_canvas();
}