var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    var lavaBalls = [];
    var chunks = {};
    var visibleRange = 50; // Диапазон видимости вокруг камеры

    function createLavaBall(x, y, z, radius) {
        var vx = Math.random() * 2 - 1;
        var vy = Math.random() * 2 - 1;
        var vz = Math.random() * 2 - 1;

        var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: radius * 2, segments: 32}, scene);
        sphere.position = new BABYLON.Vector3(x, y, z);
        sphere.material = new BABYLON.StandardMaterial("material", scene);
        sphere.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

        lavaBalls.push({sphere: sphere, vx: vx, vy: vy, vz: vz, radius: radius});
    }

    function generateChunk(x, z) {
        if (chunks[x + "," + z]) return;

        if (Math.abs(x - Math.floor(camera.position.x / 100)) > visibleRange ||
            Math.abs(z - Math.floor(camera.position.z / 100)) > visibleRange) {
            return;
        }

        chunks[x + "," + z] = true;

        for (var i = 0; i < 10; i++) { // Уменьшили количество создаваемых шаров в каждом чанке
            var lx = x * 100 + Math.random() * 100;
            var ly = Math.random() * 100;
            var lz = z * 100 + Math.random() * 100;

            var radius = Math.random() * 2 + 0.5;
            createLavaBall(lx, ly, lz, radius);
        }
    }

    function unloadChunk(x, z) {
        if (!chunks[x + "," + z]) return;

        if (Math.abs(x - Math.floor(camera.position.x / 100)) > visibleRange ||
            Math.abs(z - Math.floor(camera.position.z / 100)) > visibleRange) {
            for (var i = 0; i < lavaBalls.length; i++) {
                var lavaBall = lavaBalls[i];
                if (Math.floor(lavaBall.sphere.position.x / 100) === x && Math.floor(lavaBall.sphere.position.z / 100) === z) {
                    scene.removeMesh(lavaBall.sphere);
                    lavaBalls.splice(i, 1);
                    i--;
                }
            }
            return;
        }

        chunks[x + "," + z] = false;
    }

    function checkCollision(lavaBall1, lavaBall2) {
        var distance = Math.sqrt(Math.pow(lavaBall1.sphere.position.x - lavaBall2.sphere.position.x, 2) +
            Math.pow(lavaBall1.sphere.position.y - lavaBall2.sphere.position.y, 2) +
            Math.pow(lavaBall1.sphere.position.z - lavaBall2.sphere.position.z, 2));

        var sumRadius = lavaBall1.radius + lavaBall2.radius;

        return distance < sumRadius;
    }

    function mergeBalls(lavaBall1, lavaBall2) {
        var newRadius = lavaBall1.radius + lavaBall2.radius;
        var newColor = new BABYLON.Color3(
            (lavaBall1.sphere.material.diffuseColor.r + lavaBall2.sphere.material.diffuseColor.r) / 2,
            (lavaBall1.sphere.material.diffuseColor.g + lavaBall2.sphere.material.diffuseColor.g) / 2,
            (lavaBall1.sphere.material.diffuseColor.b + lavaBall2.sphere.material.diffuseColor.b) / 2
        );

        var newSphere = BABYLON.MeshBuilder.CreateSphere("newSphere", {diameter: newRadius * 2, segments: 32}, scene);
        newSphere.position = new BABYLON.Vector3(
            (lavaBall1.sphere.position.x + lavaBall2.sphere.position.x) / 2,
            (lavaBall1.sphere.position.y + lavaBall2.sphere.position.y) / 2,
            (lavaBall1.sphere.position.z + lavaBall2.sphere.position.z) / 2
        );
        newSphere.material = new BABYLON.StandardMaterial("newMaterial", scene);
        newSphere.material.diffuseColor = newColor;

        scene.removeMesh(lavaBall1.sphere);
        scene.removeMesh(lavaBall2.sphere);

        lavaBalls.push({sphere: newSphere, vx: 0, vy: 0, vz: 0, radius: newRadius});
    }

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

            var vx = Math.random() * 2 - 1;
            var vy = Math.random() * 2 - 1;
            var vz = Math.random() * 2 - 1;

            if (lavaBall.sphere.position.x + vx < 0 || lavaBall.sphere.position.x + vx > 100) {
                vx *= -1;
            }
            if (lavaBall.sphere.position.y + vy < 0 || lavaBall.sphere.position.y + vy > 10) {
                vy *= -1;
            }
            if (lavaBall.sphere.position.z + vz < 0 || lavaBall.sphere.position.z + vz > 100) {
                vz *= -1;
            }

            lavaBall.sphere.position = new BABYLON.Vector3(
                lavaBall.sphere.position.x + vx,
                lavaBall.sphere.position.y + vy,
                lavaBall.sphere.position.z + vz
            );

            lavaBall.sphere.scaling = new BABYLON.Vector3(lavaBall.radius, lavaBall.radius, lavaBall.radius);

            for (var j = 0; j < lavaBalls.length; j++) {
                if (i !== j) {
                    var lavaBall2 = lavaBalls[j];
                    if (checkCollision(lavaBall, lavaBall2)) {
                        mergeBalls(lavaBall, lavaBall2);
                        i--;
                        j--;
                    }
                }
            }
        }
    });

    return scene;
};

var scene = createScene();
engine.runRenderLoop(function () {
    scene.render();
});
