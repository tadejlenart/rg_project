import { vec3, mat4 } from '../../lib/gl-matrix-module.js';

export class Physics {

    constructor(scene) {
        this.scene = scene;
    }

    update(dt) {
        this.scene.traverse(node => {
            //node is camera so it doesent have aabb properties---it was like this
            //each node now has default aabb properties
            if(node.camera){
                //sconsole.log(node.camera.velocity)
                if (node.camera.velocity) {
                    //console.log(node.matrix);
                    //console.log(node.camera.rotation);
                    vec3.scaleAndAdd(node.translation, node.translation, node.camera.velocity, dt);
                    //changes when moving but not when moving mouse
                    //console.log(node.matrix);
                    node.copyRotation(node.camera.rotation);
                    //console.log(node.rotation);
                    node.updateMatrixRotation();
                    //node.updateTransform();
                    this.scene.traverse(other => {
                        if (node !== other) {
                            this.resolveCollision(node, other);
                        }
                    });
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

        console.log(a.translation);
        vec3.add(a.translation, a.translation, minDirection);
        
        //changed updateTransform function from physics example to
        //update matrix function from example 90 node class

        if(a.name == "Camera"){
            a.updateMatrixRotation();
        }else{
            a.updateMatrix();
        }

        //console.log(a);

        console.log("resolving collisions");

    }

}
