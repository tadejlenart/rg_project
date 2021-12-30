import { Utils } from "./Utils.js";
import { Node } from "./Node.js";

export class Arrow extends Node{
    constructor(options){
        super(options);
        Utils.init(this, this.constructor.defaults, options);
    }

    update(dt){

    }

}
Arrow.defaults = {
    velocity : [0,0,0],
    name : "Arrow",
};