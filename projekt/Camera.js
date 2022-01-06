import { vec3, mat4, quat } from '../../lib/gl-matrix-module.js';

import { Utils } from './Utils.js';
import { Node } from './Node.js';
import { Arrow } from './Arrow.js';

export class Camera extends Node {

    constructor(options) {
        super(options);
        Utils.init(this, this.constructor.defaults, options);
        this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);

        //bind event handler to camera object
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);

        this.keys = {};

    }

    update(dt) {
        const c = this;

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));


        // 1: add movement acceleration
        let acc = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction
        if (!this.keys['KeyW'] &&
            !this.keys['KeyS'] &&
            !this.keys['KeyD'] &&
            !this.keys['KeyA'])
        {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
        }

        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }
    }

    enable() {
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);

        //add mouse clik event handler
        document.addEventListener('mousedown', this.mouseDownHandler);
        document.addEventListener('mouseup', this.mouseUpHandler);
    }

    disable() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }

        //remove mouse clik event handler
        document.removeEventListener('mousedown', this.mouseDownHandler);
        document.removeEventListener('mouseup', this.mouseUpHandler);
    }

    mousemoveHandler(e) {
        const dx = e.movementX;
        const dy = e.movementY;
        const c = this;

        c.rotation[0] -= dy * c.mouseSensitivity;
        c.rotation[1] -= dx * c.mouseSensitivity;

        c.prevRotation[0] -= dy * c.mouseSensitivity;
        c.prevRotation[1] -= dx * c.mouseSensitivity;

        if(c.prevRotation[1] >= 6){
            c.prevRotation[1] = c.prevRotation[1]-6;
        }else if(c.prevRotation[1] <= -6){
            c.prevRotation[1] = c.prevRotation[1]+6;
        }

        if(c.prevRotation[0] >= 1.5){
            c.prevRotation[0] = 1.5;
        }else if(c.prevRotation[0] <= -1.5){
            c.prevRotation[0] = -1.5;
        }

        console.log(c.prevRotation);


        const pi = Math.PI;
        const twopi = pi * 2;
        const halfpi = pi / 2;

        if (c.rotation[0] > halfpi) {
            c.rotation[0] = halfpi;
        }
        if (c.rotation[0] < -halfpi) {
            c.rotation[0] = -halfpi;
        }

        c.rotation[1] = ((c.rotation[1] % twopi) + twopi) % twopi;
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        this.keys[e.code] = false;
    }

    mouseDownHandler(e){
        // this.startTime = Date.now();
        // console.log("mousedown");
    }

    mouseUpHandler(e){
        //if(this.ammo >= 1){
        //this.parent.children[0] refers to the node containing the arrow
        //basically a copied camera node
        
        //add strenght of shot based on length of bow pull
        // let strength = Date.now() - this.startTime;
        // strength = strength * 0.01;
        // if(strength > 15) { strength = 15; }
        // if(strength < 2) { strength = 2; }
        const strength = 5;
        //copy node properties
        let arrowNode = this.parent.children[0].cloneThis();
        arrowNode.aabb.min = [-0.1, -0.1, -0.1];
        arrowNode.aabb.max = [0.1, 0.1, 0.1];

        console.log(this.parent.children[0]);

        //set the global position of the arrow
        arrowNode.matrix = this.parent.children[0].getGlobalTransform();

        //create a new Arrow object
        let arrow = new Arrow(arrowNode);
        
        //change the position and velocity of the arrow based on wherever the camera is pointing
        //arrow movement is handled in physics
        //so just set the right velocity based on rotation
        const c = this;
        //put some sort of mouse timer here instead of 5
        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1])*strength, 0, -Math.cos(c.rotation[1])*strength);

        const up = vec3.set(vec3.create(),
            -Math.sin(c.rotation[0])*strength, Math.cos(c.rotation[0]), 0);

        const angle = vec3.create();
        //give movement to the arrow
        vec3.add(angle, forward, up);
        
        arrow.velocity = angle;
        // //make arrow always come out of camera middle
        //and a little forward to stop it sticking into boxes from behind
        //vec3.add(arrow.translation, arrow.translation, vec3.fromValues(0,0,1.4));
        // const rotation = quat.clone(this.parent.children[0].rotation);
        // quat.set(arrow.rotation, rotation[0], rotation[1], rotation[2], rotation[3]);
        // quat.scale(arrow.rotation, arrow.rotation, 100)
        vec3.add(arrow.translation, arrow.translation, vec3.fromValues(0.1,0,1.4));
        const degrees = c.prevRotation.map(x => x * 180 / Math.PI);
        const q = quat.fromEuler(quat.create, ...degrees);
        console.log(q);
        quat.set(arrow.rotation, q[0], q[1], 0, 1);
        console.log(arrow.rotation);
        arrow.updateMatrix();

        this.clicked = true;
        return arrow;
        //}
    }

    addArrow(scene){
        scene.addNode(this.mouseUpHandler());
        this.clicked = false;
        this.ammo--;
    }

}

Camera.defaults = {
    velocity         : [0, 0, 0],
    mouseSensitivity : 0.002,
    maxSpeed         : 3,
    friction         : 0.2,
    acceleration     : 20,
    prevRotation: [0, 0, 0]
};
