import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import GUI from "lil-gui";
import particlesVertexShader from "./shaders/particles/vertex.glsl";
import particlesFragmentShader from "./shaders/particles/fragment.glsl";

export default class Experience {
  constructor() {
    this.scene = new THREE.Scene();

    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    };
    this.gltfLoader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
    this.canvas = document.querySelector("canvas.webgl");
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(this.sizes.pixelRatio);

    this.clock = new THREE.Clock();
    this.previousTime = 0;
    this.setResize();
    this.setCamera();
    this.raf();

    this.setupObjects();
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      70,
      this.sizes.aspectRatio,
      0.01,
      1000
    );
    this.scene.add(this.camera);
    this.camera.position.set(0, 0, 1);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
  }

  setupObjects() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 20, 20);
    this.material = new THREE.ShaderMaterial({
      vertexShader: particlesVertexShader,
      fragmentShader: particlesFragmentShader,
      uniforms: {
        uSize: new THREE.Uniform(0.02),
        uResolution: new THREE.Uniform(
          new THREE.Vector2(
            this.sizes.width * this.sizes.pixelRatio,
            this.sizes.height * this.sizes.pixelRatio
          )
        ),
      },
    });
    const material = new THREE.MeshBasicMaterial({ color: "red" });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.position.z = -3;

    this.scene.add(this.points);
  }

  setResize() {
    window.addEventListener("resize", () => {
      // Update sizes
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;
      this.sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

      // Update camera
      this.sizes.aspectRatio = this.sizes.width / this.sizes.height;
      this.camera.aspect = this.sizes.aspectRatio;
      this.camera.updateProjectionMatrix();

      // Update renderer
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(this.sizes.pixelRatio);
    });
  }

  raf() {
    this.elapsedTime = this.clock.getElapsedTime();
    const deltaTime = this.elapsedTime - this.previousTime;
    this.previousTime = this.elapsedTime;

    if (this.controls) {
      this.controls.update();
    }
    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.raf.bind(this));
  }
}

const experience = new Experience();
