var createScene = function () {
    // Это создает базовый объект сцены Babylon (без сетки).
    var scene = new BABYLON.Scene(engine);

    //Это создает и позиционирует свободную камеру (без сетки).
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    // Это позволяет направить камеру в исходное положение сцены
    camera.setTarget(BABYLON.Vector3.Zero());

    // Это позволяет прикрепить камеру к холсту
    camera.attachControl(canvas, true);

    // Это создает свет, направленный 0,1,0 - в небо (без сетки).
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Интенсивность по умолчанию равна 1. Давайте немного приглушим свет
    light.intensity = 0.7;

    // Создайте массив для хранения лавовых шариков
    var lavaBalls = [];

    // Создайте массив для хранения чанков
    var chunks = {};

    // Функция для создания нового лавового шара
    function createLavaBall(x, y, z) {
        var vx = Math.random() * 2 - 1;
        var vy = Math.random() * 2 - 1;
        var vz = Math.random() * 2 - 1;
        var radius = Math.random() * 2 + 0.5;

        var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: radius * 2, segments: 32}, scene);
        sphere.position = new BABYLON.Vector3(x, y, z);
        sphere.material = new BABYLON.StandardMaterial("material", scene);
        sphere.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

        lavaBalls.push({sphere: sphere, vx: vx, vy: vy, vz: vz});
    }

    // Функция для генерации фрагмента чанка
    function generateChunk(x, z) {
        if (chunks[x + "," + z]) return;

        chunks[x + "," + z] = true;

        for (var i = 0; i < 100; i++) {
            var lx = x * 100 + Math.random() * 100;
            var ly = Math.random() * 100; // генерируем координату y случайным образом
            var lz = z * 100 + Math.random() * 100;

            createLavaBall(lx, ly, lz);
        }
    }

    // Функция для выгрузки фрагмента чанка
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

    // Цикл анимации
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
        }
    });

    return scene;
};
