import { Node } from './Node.js';

export class Light extends Node {

    constructor(Node) {
        //initialize default bounding box
        this.matrix = Node.matrix;
        this.translation = Node.translation;
        this.rotation = Node.rotation;
        this.scale = Node.scale;

        Object.assign(this, {

            position         : [2, 5, 3],
            ambient          : 0.2,
            diffuse          : 0.8,
            specular         : 1,
            shininess        : 10,
            color            : [255, 255, 255],
            attenuatuion     : [1.0, 0, 0.02]
        });
    }

}