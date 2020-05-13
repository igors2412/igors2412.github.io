import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import {
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene,
    SphereBufferGeometry,
    TextureLoader,
    Vector3,
    WebGLRenderer,
} from 'three';

// https://github.com/mrdoob/three.js/blob/master/examples/webgl_panorama_equirectangular.html

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit, OnDestroy {
    images = ['/assets/IMG_20200420_173856_00_150.jpg'];

    camera: any;
    scene: Scene;
    renderer: WebGLRenderer;
    container: HTMLElement;

    isUserInteracting = false;
    onMouseDownMouseX = 0;
    onMouseDownMouseY = 0;
    lon = 0;
    onMouseDownLon = 0;
    lat = 0;
    onMouseDownLat = 0;
    phi = 0;
    theta = 0;

    ngAfterViewInit(): void {
        this.container = document.getElementById('container');

        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
        this.camera.target = new Vector3(0, 0, 0);

        const geometry = new SphereBufferGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);

        const texture = new TextureLoader().load('assets/IMG_20200420_173856_00_150.jpg');
        const material = new MeshBasicMaterial({ map: texture });
        const mesh = new Mesh(geometry, material);

        this.scene = new Scene();
        this.scene.add(mesh);

        this.renderer = new WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        this.configureCommonEventListeners();
        // this.configureDragDropEventListeners();

        this.animate();
    }

    private configureCommonEventListeners(): void {
        document.addEventListener('mousedown', (e) => this.onPointerStart(e), false);
        document.addEventListener('mousemove', (e) => this.onPointerMove(e), false);
        document.addEventListener('mouseup', () => this.onPointerUp(), false);

        document.addEventListener('wheel', (e) => this.onDocumentMouseWheel(e), false);

        document.addEventListener('touchstart', (e) => this.onPointerStart(e), false);
        document.addEventListener('touchmove', (e) => this.onPointerMove(e), false);
        document.addEventListener('touchend', () => this.onPointerUp(), false);

        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    ngOnDestroy(): void {
        // TODO: remove DOM event listeners
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onPointerStart(event) {
        this.isUserInteracting = true;

        const clientX = event.clientX || event.touches[0].clientX;
        const clientY = event.clientY || event.touches[0].clientY;

        this.onMouseDownMouseX = clientX;
        this.onMouseDownMouseY = clientY;

        this.onMouseDownLon = this.lon;
        this.onMouseDownLat = this.lat;
    }

    onPointerMove(event) {
        if (this.isUserInteracting === true) {
            const clientX = event.clientX || event.touches[0].clientX;
            const clientY = event.clientY || event.touches[0].clientY;

            this.lon = (this.onMouseDownMouseX - clientX) * 0.1 + this.onMouseDownLon;
            this.lat = (clientY - this.onMouseDownMouseY) * 0.1 + this.onMouseDownLat;
        }
    }

    onPointerUp() {
        this.isUserInteracting = false;
    }

    onDocumentMouseWheel(event) {
        const fov = this.camera.fov + event.deltaY * 0.05;
        this.camera.fov = MathUtils.clamp(fov, 10, 75);
        this.camera.updateProjectionMatrix();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
    }

    update() {
        if (this.isUserInteracting === false) {
            this.lon += 0.1;
        }

        this.lat = Math.max(-85, Math.min(85, this.lat));
        this.phi = MathUtils.degToRad(90 - this.lat);
        this.theta = MathUtils.degToRad(this.lon);

        this.camera.target.x = 500 * Math.sin(this.phi) * Math.cos(this.theta);
        this.camera.target.y = 500 * Math.cos(this.phi);
        this.camera.target.z = 500 * Math.sin(this.phi) * Math.sin(this.theta);

        this.camera.lookAt(this.camera.target);

        // distortion
        // this.camera.position.copy(this.camera.target).negate();

        this.renderer.render(this.scene, this.camera);
    }
}
