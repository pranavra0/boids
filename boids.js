window.boidsConfig = {
    numBoids: 400,
    visualRange: 100,
    speedLimit: 6,
    separationDist: 25,
    
    // Factors
    cohesionFactor: 0.005,
    separationFactor: 0.15,
    alignmentFactor: 0.05,
    
    // Boundary
    boundarySize: 400, 
    boundaryTurnFactor: 0.5
};

const config = window.boidsConfig;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(0, 400, 600); 
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

let gridHelper = new THREE.GridHelper(config.boundarySize * 2, 20, 0x333333, 0x111111);
scene.add(gridHelper);

const geometryBox = new THREE.BoxGeometry(1, 1, 1); 
const materialBox = new THREE.LineBasicMaterial({ color: 0x333333 });
const boundaryBox = new THREE.LineSegments(new THREE.EdgesGeometry(geometryBox), materialBox);
scene.add(boundaryBox);

// Helper to update the box size when config changes
window.updateWorldBounds = function() {
    const s = config.boundarySize * 2;
    boundaryBox.scale.set(s, s, s);
    
    scene.remove(gridHelper);
    gridHelper = new THREE.GridHelper(s, 20, 0x333333, 0x111111);
    scene.add(gridHelper);
}

window.updateWorldBounds();


const boidGroup = new THREE.Group();
scene.add(boidGroup);

let boids = [];
const boidGeometry = new THREE.ConeGeometry(3, 12, 8); 
boidGeometry.rotateX(Math.PI / 2); 

const boidMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff, 
    wireframe: true 
});

window.initBoids = function() {
    while(boidGroup.children.length > 0){ 
        const child = boidGroup.children[0]; 
        boidGroup.remove(child); 
    }
    
    boids = [];

    for (let i = 0; i < config.numBoids; i++) {
        const x = (Math.random() * 2 - 1) * config.boundarySize;
        const y = (Math.random() * 2 - 1) * config.boundarySize;
        const z = (Math.random() * 2 - 1) * config.boundarySize;

        const mesh = new THREE.Mesh(boidGeometry, boidMaterial);
        boidGroup.add(mesh);

        boids.push({
            mesh: mesh,
            x: x, y: y, z: z,
            dx: Math.random() * 4 - 2,
            dy: Math.random() * 4 - 2,
            dz: Math.random() * 4 - 2
        });
    }
}

function distance(b1, b2) {
    return Math.sqrt(
        (b1.x - b2.x) ** 2 + 
        (b1.y - b2.y) ** 2 +
        (b1.z - b2.z) ** 2
    );
}

function rule1(boid) {
    let cx = 0, cy = 0, cz = 0;
    let count = 0;
    for (let other of boids) {
        if (other !== boid && distance(boid, other) < config.visualRange) {
            cx += other.x; cy += other.y; cz += other.z;
            count++;
        }
    }
    if (count === 0) return { x: 0, y: 0, z: 0 };
    cx /= count; cy /= count; cz /= count;
    return {
        x: (cx - boid.x) * config.cohesionFactor,
        y: (cy - boid.y) * config.cohesionFactor,
        z: (cz - boid.z) * config.cohesionFactor
    };
}

function rule2(boid) {
    let mx = 0, my = 0, mz = 0;
    for (let other of boids) {
        if (other !== boid) {
            let d = distance(boid, other);
            if (d < config.visualRange && d < config.separationDist) {
                mx += (boid.x - other.x);
                my += (boid.y - other.y);
                mz += (boid.z - other.z);
            }
        }
    }
    return { 
        x: mx * config.separationFactor, 
        y: my * config.separationFactor,
        z: mz * config.separationFactor
    };
}

function rule3(boid) {
    let ax = 0, ay = 0, az = 0;
    let count = 0;
    for (let other of boids) {
        if (other !== boid && distance(boid, other) < config.visualRange) {
            ax += other.dx; ay += other.dy; az += other.dz;
            count++;
        }
    }
    if (count === 0) return { x: 0, y: 0, z: 0 };
    ax /= count; ay /= count; az /= count;
    return {
        x: (ax - boid.dx) * config.alignmentFactor,
        y: (ay - boid.dy) * config.alignmentFactor,
        z: (az - boid.dz) * config.alignmentFactor
    };
}

function limitSpeed(boid) {
    const speed = Math.sqrt(boid.dx**2 + boid.dy**2 + boid.dz**2);
    if (speed > config.speedLimit) {
        boid.dx = (boid.dx / speed) * config.speedLimit;
        boid.dy = (boid.dy / speed) * config.speedLimit;
        boid.dz = (boid.dz / speed) * config.speedLimit;
    }
}

function keepWithinBounds(boid) {
    const limit = config.boundarySize;
    const turn = config.boundaryTurnFactor;
    if (boid.x < -limit) boid.dx += turn;
    if (boid.x > limit) boid.dx -= turn;
    if (boid.y < -limit) boid.dy += turn;
    if (boid.y > limit) boid.dy -= turn;
    if (boid.z < -limit) boid.dz += turn;
    if (boid.z > limit) boid.dz -= turn;
}

function animationLoop() {
    for (let boid of boids) {
        let v1 = rule1(boid);
        let v2 = rule2(boid);
        let v3 = rule3(boid);

        boid.dx += v1.x + v2.x + v3.x;
        boid.dy += v1.y + v2.y + v3.y;
        boid.dz += v1.z + v2.z + v3.z;

        keepWithinBounds(boid);
        limitSpeed(boid);

        boid.x += boid.dx;
        boid.y += boid.dy;
        boid.z += boid.dz;

        boid.mesh.position.set(boid.x, boid.y, boid.z);
        boid.mesh.lookAt(boid.x + boid.dx, boid.y + boid.dy, boid.z + boid.dz);
    }
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animationLoop);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Init on load
window.initBoids();
animationLoop();