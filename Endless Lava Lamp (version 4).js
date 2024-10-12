var createScene = function () {
    // Это создает базовый объект сцены Babylon (без меша)
    var scene = new BABYLON.Scene(engine);

    // Это создает и позиционирует свободную камеру (без меша)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    // Это нацеливает камеру на начало сцены
    camera.setTarget(BABYLON.Vector3.Zero());

    // Это позволяет прикрепить камеру к холсту
    camera.attachControl(canvas, true);

    // Это создает свет, направленный 0,1,0 - в небо (без меша)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Интенсивность по умолчанию равна 1. Давайте немного приглушим свет
    light.intensity = 0.7;

    // Создайте массив для хранения лавовых шариков
    var lavaBalls = [];

    // Создайте массив для хранения фрагментов
    var chunks = {};

    // Функция для создания нового лавового шара
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

    // Функция для генерации фрагмента
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

    // Функция для выгрузки фрагмента
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

        // Генерируем случайную скорость
        var vx = Math.random() * 2 - 1;
        var vy = Math.random() * 2 - 1;
        var vz = Math.random() * 2 - 1;

        // Проверяем, не вышел ли шар за пределы области
        if (lavaBall.sphere.position.x + vx < 0 || lavaBall.sphere.position.x + vx > 100) {
            vx *= -1;
        }
        if (lavaBall.sphere.position.y + vy < 0 || lavaBall.sphere.position.y + vy > 10) {
            vy *= -1;
        }
        if (lavaBall.sphere.position.z + vz < 0 || lavaBall.sphere.position.z + vz > 100) {
            vz *= -1;
        }

        // Обновляем позицию шара
        lavaBall.sphere.position = new BABYLON.Vector3(
            lavaBall.sphere.position.x + vx,
            lavaBall.sphere.position.y + vy,
            lavaBall.sphere.position.z + vz
        );

        // Обновляем размер шара
        lavaBall.sphere.scaling = new BABYLON.Vector3(lavaBall.radius, lavaBall.radius, lavaBall.radius);
    }
});

    return scene;
};
