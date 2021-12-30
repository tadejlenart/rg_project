import { GUI } from '../../lib/dat.gui.module.js';

import { Application } from '../../common/engine/Application.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';
import { Physics } from './Physics.js';

class App extends Application {

    async start() {

        this.loader = new GLTFLoader();
        await this.loader.load('./models/tilted/tilted.gltf');

        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        this.camera = await this.loader.loadNode('Camera');

        this.physics = new Physics(this.scene);

        if (!this.scene || !this.camera) {
            throw new Error('Scene or Camera not present in glTF');
        }

        if (!this.camera.camera) {
            throw new Error('Camera node does not contain a camera reference');
        }

        this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();

        //parenting in blender doesent add the node in the right place so we have to do it here
        //in blender it adds it as a sibling of the root camera node instead of the child
        //of the acual camera node
        this.scene.traverse(node => {
            if(node.name === "Camera"){
                console.log(node);
                // const siblings = node.parent.children;
                // console.log(siblings);
                // for(const sibling of siblings){
                //     //change this to name of character model later
                //     if(sibling.name === "Cube.001"){
                //         node.addChild(sibling);
                //         node.parent.removeChild(sibling);
                //     }
                // }
            }
        });
        //this way a model of a node is attached to the camera and can be used for collision detection
        console.log(this.scene);
    }

    enableCamera() {
        this.canvas.requestPointerLock();
    }

    pointerlockchangeHandler() {
        if (!this.camera) {
            return;
        }

        if (document.pointerLockElement === this.canvas) {
            this.camera.camera.enable();
        } else {
            this.camera.camera.disable();
        }
    }

    render() {
        if (this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        const aspectRatio = w / h;

        if (this.camera) {
            this.camera.camera.aspect = aspectRatio;
            this.camera.camera.updateMatrix();
        }

    }

    update() {
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if (this.camera) {
            this.camera.camera.update(dt);
        }

        if(this.physics){
            this.physics.update(dt);
        }

    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
    const gui = new GUI();
    gui.add(app, "enableCamera");
});
