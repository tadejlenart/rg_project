import { vec3, mat4, quat } from '../../lib/gl-matrix-module.js';
import { Utils } from './Utils.js';

export class Node {

    constructor(options = {}) {
        //initialize default bounding box
        Utils.init(this, Node.defaults, options);

        //add bounding box from accesor into code for use with physics
        //this.aabb = {};

        //console.log(options);

        if(options.mesh){
            this.aabb.min = options.mesh.primitives[0].attributes.POSITION.min;
            this.aabb.max = options.mesh.primitives[0].attributes.POSITION.max;
        }


        //set node name (camera, cube etc.)
        this.name = options.name;

        //the rest of the node constructor (example 90)
        this.translation = options.translation
            ? vec3.clone(options.translation)
            : vec3.fromValues(0, 0, 0);
        this.rotation = options.rotation
            ? quat.clone(options.rotation)
            : quat.fromValues(0, 0, 0, 1);
        this.scale = options.scale
            ? vec3.clone(options.scale)
            : vec3.fromValues(1, 1, 1);
        this.matrix = options.matrix
            ? mat4.clone(options.matrix)
            : mat4.create();

        if (options.matrix) {
            this.updateTransform();
        } else if (options.translation || options.rotation || options.scale) {
            this.updateMatrix();
        }

        this.camera = options.camera || null;
        this.mesh = options.mesh || null;

        this.children = [...(options.children || [])];
        for (const child of this.children) {
            child.parent = this;
        }
        this.parent = null;
    }


    updateTransform() {
        mat4.getRotation(this.rotation, this.matrix);
        mat4.getTranslation(this.translation, this.matrix);
        mat4.getScaling(this.scale, this.matrix);
    }

    updateMatrix() {
        mat4.fromRotationTranslationScale(
            this.matrix,
            this.rotation,
            this.translation,
            this.scale);
    }

    addChild(node) {
        this.children.push(node);
        node.parent = this;
    }

    removeChild(node) {
        const index = this.children.indexOf(node);
        if (index >= 0) {
            this.children.splice(index, 1);
            node.parent = null;
        }
    }

    clone() {
        return new Node({
            ...this,
            children: this.children.map(child => child.clone()),
        });
    }

    //rotation of camera changes but not rotation of this node
    //having rotation in camera is bascically useless because camera matrix
    //is only projection and changes based on camera properties in PerspectiveCamera class
    copyRotation(rotation){
        this.rotation = quat.clone(rotation);
    }

    //converts rotation vector to angles and updates this matrix
    updateMatrixRotation() {
        const degrees = this.rotation.map(x => x * 180 / Math.PI);
        const q = quat.fromEuler(quat.create, ...degrees);
        mat4.fromRotationTranslationScale(
            this.matrix,
            q,
            this.translation,
            this.scale);
    }

    //returns global transform of this node
    //(this node matrix multiplied by all it's parents matricies)
    getGlobalTransform(){
        if (!this.parent) {
            return mat4.clone(this.matrix);
        } else {
            let transform = this.parent.getGlobalTransform();
            return mat4.mul(transform, transform, this.matrix);
        }
    }

}
Node.defaults = {
    translation: [0, 1, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    aabb: {
        min: [-0.2, -0.2, -0.2],
        max: [0.2, 0.2, 0.2],
    },
};
