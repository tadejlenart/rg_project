import { mat4 } from '../../lib/gl-matrix-module.js';

import { Camera } from './Camera.js';

export class PerspectiveCamera extends Camera {

    constructor(options = {}) {
        super(options);

        this.aspect = options.aspect || 1.5;
        this.fov = options.fov || 1.5;
        this.near = options.near || 0.01;
        this.far = options.far || 100;

        this.updateMatrix();

    }


    //perspective camera matrix is projection matrix
    updateMatrix() {
        mat4.perspective(this.matrix,
            this.fov, this.aspect,
            this.near, this.far);
    }

    //node.matrix would be the model matrix?
    //so both camera and perspective camera have this.matrix
    //camera.matrix is position in space (cameras this.matrix) (viewMatrix)
    //camera.camera.matrix is projection matrix (perspectivecameras this.matrix) (projectionMatrix)

}
