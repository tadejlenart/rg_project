import { Utils } from "./Utils.js";
import { Node } from "./Node.js";

export class Arrow extends Node{
    constructor(options){
        super(options);
        Utils.init(this, this.constructor.defaults, options);
        this.aabb.min = [-0.1, -0.1, -0.1];
        this.aabb.max = [0.1, 0.1, 0.1];
    }

}
Arrow.defaults = {
    velocity : [0,0,0],
    name : "Arrow",
    collidable : true,
};