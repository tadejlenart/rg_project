import { Utils } from "./Utils.js";
import { Node } from "./Node.js";

export class Arrow extends Node{
    constructor(options){
        super(options);
        Utils.init(this, this.constructor.defaults, options);
        this.aabb.min = [-0.1, -0.1, -0.1];
        this.aabb.max = [0.1, 0.1, 0.1];
    }

    update(dt){
        //we have to update the arrow position to wherever the camera is facing

    }

}
Arrow.defaults = {
    rotation : [0,0,0,1],
    velocity : [0,0,0],
    name : "Arrow",
    collidable : true,
};