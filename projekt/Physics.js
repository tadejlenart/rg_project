import { vec3, mat4, quat } from '../../lib/gl-matrix-module.js';
import { Arrow } from './Arrow.js';

export class Physics {

    constructor(scene) {
        this.scene = scene;
    }

    update(dt) {
        this.scene.traverse(node => {
            //node is camera so it doesent have aabb properties---it was like this
            //each node now has default aabb properties
            if (node.velocity) {
                if(node.camera){
                    vec3.scaleAndAdd(node.translation, node.translation, node.camera.velocity, dt);
                    node.copyRotation(node.camera.rotation);
                    node.updateMatrixRotation();
                    //when the camera is colliding with something the player postion doesent change
                    //but the camera velocity still gets added to the overall position of the arrow
                    //so the arrow shoots out where the camera would have been if it wasnt colliding
                    //set arrow parent translation to this node translation
                    vec3.set(node.camera.parent.translation, node.translation[0], node.translation[1], node.translation[2]);
                    node.camera.parent.updateMatrixRotation(); 

                }
                this.scene.traverse(other => {
                    if (node !== other) {
                        if(node.collidable && other.collidable){
                            //many ifs to stop player pushing arrows during flight
                            //optionally we could just make the arrows travel faster
                            //but then technically you could shoot them and ride them lol
                            if( (node.name === "Camera" && other.name === "Arrow") || 
                                (node.name === "Camera" && other.name === "arrow_container") ||
                                (other.name === "Camera" && node.name === "Arrow" ) ||
                                (other.name === "Camera" && node.name === "arrow_container")){
                                //no collisions
                            }else{
                                //do collisions
                                //maybe a different method for collisions of pc with nodes
                                //and a seperate method somewhere for arrows with "target" nodes
                                //this is for collisions of camera(player) and the level
                                //a bad idea because two seperate collision loops and methods make it go wonky
                                this.resolveCollision(node, other);
                            }
                        }
                    }
                });
            }
            if(node instanceof Arrow){
                if(node.collidable){ //stops arrows from falling when they hit a target
                    vec3.scaleAndAdd(node.translation, node.translation, node.velocity, dt);
                    const grav = vec3.fromValues(0,-0.4,0); //add drop off (gravity) to arrows
                    vec3.scaleAndAdd(node.velocity, node.velocity, grav, dt);
                    node.updateMatrix();
                }
            }
        });
    }

    intervalIntersection(min1, max1, min2, max2) {
        return !(min1 > max2 || min2 > max1);
    }

    aabbIntersection(aabb1, aabb2) {
        return this.intervalIntersection(aabb1.min[0], aabb1.max[0], aabb2.min[0], aabb2.max[0])
            && this.intervalIntersection(aabb1.min[1], aabb1.max[1], aabb2.min[1], aabb2.max[1])
            && this.intervalIntersection(aabb1.min[2], aabb1.max[2], aabb2.min[2], aabb2.max[2]);
    }

    resolveCollision(a, b) {
        // Update bounding boxes with global translation.

        //technically a is always camera but we will leave this as it is for now
        //may be useful later
        let ta, tb;
        if(a.name !== "Camera" && b.name !== "Camera"){
            ta = a.getGlobalTransform();
            tb = b.getGlobalTransform();
        }else if(a.name === "Camera" && b.name !== "Camera"){
            ta = a.matrix;
            tb = b.getGlobalTransform();
        }else if(a.name !== "Camera" && b.name === "Camera"){
            ta = a.getGlobalTransform();
            tb = b.matrix;
        }

        ta = a.getGlobalTransform();
        tb = b.getGlobalTransform();

        // console.log(ta);
        // console.log(tb);

        const posa = mat4.getTranslation(vec3.create(), ta);
        const posb = mat4.getTranslation(vec3.create(), tb);

        const mina = vec3.add(vec3.create(), posa, a.aabb.min);
        const maxa = vec3.add(vec3.create(), posa, a.aabb.max);
        const minb = vec3.add(vec3.create(), posb, b.aabb.min);
        const maxb = vec3.add(vec3.create(), posb, b.aabb.max);

        // Check if there is collision.
        const isColliding = this.aabbIntersection({
            min: mina,
            max: maxa
        }, {
            min: minb,
            max: maxb
        });

        if (!isColliding) {
            return;
        }
        
        
        if(a.name === "pickup" && b.name === "Camera"){
            if(!a.pickedUp){
                a.visible = false;
                b.camera.ammo = b.camera.ammo + 0.5;
                a.pickedUp = true;
            }
        }else if(b.name === "pickup" && a.name === "Camera"){
            if(!a.pickedUp){
                b.visible = false;
                a.camera.ammo = a.camera.ammo + 0.5;
                a.pickedUp = true;
            }
        }

        //move only if camera(player) runs into the scenery
        if((a.name === "Camera" && (b.name !== "Arrow" || b.name !== "arrow_container" || b.name !== "pickup")) ||
            b.name === "Camera" && (a.name !== "Arrow" || a.name !== "arrow_container" || a.name !== "pickup")){
            // Move node A minimally to avoid collision.
            const diffa = vec3.sub(vec3.create(), maxb, mina);
            const diffb = vec3.sub(vec3.create(), maxa, minb);

            let minDiff = Infinity;
            let minDirection = [0, 0, 0];
            if (diffa[0] >= 0 && diffa[0] < minDiff) {
                minDiff = diffa[0];
                minDirection = [minDiff, 0, 0];
            }
            if (diffa[1] >= 0 && diffa[1] < minDiff) {
                minDiff = diffa[1];
                minDirection = [0, minDiff, 0];
            }
            if (diffa[2] >= 0 && diffa[2] < minDiff) {
                minDiff = diffa[2];
                minDirection = [0, 0, minDiff];
            }
            if (diffb[0] >= 0 && diffb[0] < minDiff) {
                minDiff = diffb[0];
                minDirection = [-minDiff, 0, 0];
            }
            if (diffb[1] >= 0 && diffb[1] < minDiff) {
                minDiff = diffb[1];
                minDirection = [0, -minDiff, 0];
            }
            if (diffb[2] >= 0 && diffb[2] < minDiff) {
                minDiff = diffb[2];
                minDirection = [0, 0, -minDiff];
            }

            vec3.add(a.translation, a.translation, minDirection);
        
            //changed updateTransform function from physics example to
            //update matrix function from example 90 node class

            if(a.name == "Camera"){
                a.updateMatrixRotation();
            }else{
                a.updateMatrix();
            }

        }else{
            if(a.name === "Arrow" && b.name !== "Arrow" && b.name !== "pickup"){
                a.velocity = [0,0,0];
                a.collidable = false;
            }else if(b.name === "Arrow" && b.name !== "Arrow" && b.name !== "pickup"){
                b.velocity = [0,0,0];
                b.collidable = false;
            }
        }

    }

}
