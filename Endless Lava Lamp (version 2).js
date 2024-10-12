var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Create an array to store the lava balls
    var lavaBalls = [];

    // Create an array to store the chunks
    var chunks = {};

    // Function to create a new lava ball
    function createLavaBall(x, y, z, radius) {
        var vx = Math.random() * 2 - 1;
        var vy = Math.random() * 2 - 1;
        var vz = Math.random() * 2 - 1;

        var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: radius * 2, segments: 32}, scene);
        sphere.position = new BABYLON.Vector3(x, y, z);
        sphere.material = new BABYLON.StandardMaterial("material", scene);
        sphere.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

        lavaBalls.push({sphere: sphere, vx: vx, vy: vy, vz: vz});
    }

    // Function to generate a chunk
    function generateChunk(x, z) {
        if (chunks[x + "," + z]) return;

        chunks[x + "," + z] = true;

        for (var i = 0; i < 100; i++) {
            var lx = x * 100 + Math.random() * 100;
            var ly = Math.random() * 100; // генерируем координату y случайным образом
            var lz = z * 100 + Math.random() * 100;

            var radius = Math.random() * 2 + 0.5; // генерируем случайный радиус
            createLavaBall(lx, ly, lz, radius);
        }
    }

    // Function to unload a chunk
    function unloadChunk(x, z) {
        if (!chunks[x + "," + z]) return;

        chunks[x + "," + z] = false;

        for (var i = 0; i < lavaBalls.length; i++) {
            var lavaBall = lavaBalls[i];
            if (Math.floor(lavaBall.sphere.position.x / 100) === x && Math.floor(lavaBall.sphere.position.z / 100) === z) {
                scene.removeMesh(lavaBall.sphere);
                lavaBalls.splice(i, 1);
                i--;
            }
        }
    }

    // Animation loop
    scene.registerBeforeRender(function () {
        var chunkX = Math.floor(camera.position.x / 100);
        var chunkZ = Math.floor(camera.position.z / 100);

        for (var x = chunkX - 1; x <= chunkX + 1; x++) {
            for (var z = chunkZ - 1; z <= chunkZ + 1; z++) {
                generateChunk(x, z);
            }
        }

        for (var x = chunkX - 2; x <= chunkX + 2; x++) {
            for (var z = chunkZ - 2; z <= chunkZ + 2; z++) {
                if (x < chunkX - 1 || x > chunkX + 1 || z < chunkZ - 1 || z > chunkZ + 1) {
                    unloadChunk(x, z);
                }
            }
        }

        for (var i = 0; i < lavaBalls.length; i++) {
            var lavaBall = lavaBalls[i];
            lavaBall.sphere.position.x += lavaBall.vx;
            lavaBall.sphere.position.y += lavaBall.vy;
            lavaBall.sphere.position.z += lavaBall.vz;

            if (lavaBall.sphere.position.x < 0 || lavaBall.sphere.position.x > 100) {
                lavaBall.vx *= -1;
            }
            if (lavaBall.sphere.position.y < 0 || lavaBall.sphere.position.y > 10) {
                lavaBall.vy *= -1;
            }
            if (lavaBall.sphere.position.z < 0 || lavaBall.sphere.position.z > 100) {
                lavaBall.vz *= -1;
            }

            // обновляем радиус шара
            var radius = Math.random() * 2 + 0.5;
            lavaBall.sphere.scaling = new BABYLON.Vector3(radius, radius, radius);
        }
    });

    return scene;
};
