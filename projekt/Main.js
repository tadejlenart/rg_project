import { GUI } from '../../lib/dat.gui.module.js';

import { Application } from '../../common/engine/Application.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';
import { Physics } from './Physics.js';
import { quat } from '../../lib/gl-matrix-module.js';

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

        //add arrow node to perspectiveCamera object
        this.arrow = await this.loader.loadNode('Arrow');
        this.arrow.collidable = false;
        this.arrow.aabb.min = [-0.1, -0.1, -0.1];
        this.arrow.aabb.max = [0.1, 0.1, 0.1];
        //this.camera.camera.arrow = arrow;
        
        this.camera.camera.clicked = false;

        //arrow node and perspective camera have same "parent"
        //camera node has a perspectiveCamera reference
        //and a child node that is the arrow node


        //updated this is actually the way to move arrow node into PerspectiveCamera object
        this.scene.traverse(node => {
            if(node.name === "Camera"){
                if(node.children[0].name === "Arrow"){
                    node.camera.parent = node.cloneThis();
                    node.camera.parent.name = "arrow container";
                    node.camera.parent.addChild(this.arrow);
                    node.camera.parent.collidable = false;
                    node.camera.parent.aabb.min = [-0.1, -0.1, -0.1];
                    node.camera.parent.aabb.max = [0.1, 0.1, 0.1];
                }
                // const siblings = node.parent.children;
                // console.log(siblings);
                // for(const sibling of siblings){
                //     //change this to name of character model later
                //     if(sibling.name === "Cube.001"){
                //         node.addChild(sibling);
                //         node.parent.removeChild(sibling);
                //     }
                // }
            }else if(node.name == "Arrow"){ //change this to something that makes more sense when we import the actual level
                node.collidable = false;
            }
        });
        //remember to set arrow nodes aabbs to stop arrow from colliding bad
        this.scene.traverse(node => {
            if(node.name === "Cube.002"){
                node.aabb.min = [-0.2, -0.2, -0.2];
                node.aabb.max = [0.2, 0.2, 0.2];
            }
            if(node.name === "Cube"){
                node.aabb.min = [-10, -0.0001, -10];
                node.aabb.max = [10, 0.0001, 10];
            }
            if(node.name === "pickup"){
                node.aabb.min = [-0.5, -0.5, -0.5];
                node.aabb.max = [0.5, 0.5, 0.5];
            }
        });

        console.log(this.scene);

        this.camera.camera.ammo = 5;
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
            if(this.camera.camera.clicked){
                this.camera.camera.addArrow(this.scene);
            }
        }

        if(this.physics){
            this.physics.update(dt);
        }

    }

}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('glCanvas');
    const app = new App(canvas);
    const gui = new GUI();
    gui.add(app, "enableCamera");
});
