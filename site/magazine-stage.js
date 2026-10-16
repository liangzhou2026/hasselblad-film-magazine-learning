/* Shared studio reflections, lighting and ground for all sixteen magazines. */
(() => {
  'use strict';
  const stages = new WeakMap();

  window.configureMagazineStage = function configureMagazineStage(T, scene, renderer, { floorY = -49 } = {}) {
    scene.background = new T.Color('#eef2f2');
    renderer.outputColorSpace = T.SRGBColorSpace;
    if (renderer.shadowMap) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
    }
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const existing = stages.get(scene);
    if (existing) {
      existing.setFloorY(floorY);
      return existing;
    }

    // A local studio environment gives metal broad reflected highlights. It is
    // generated once per viewer and works without downloading an HDR image.
    let environment = null;
    if (renderer.isWebGLRenderer && T.PMREMGenerator) {
      const room = new T.Scene();
      const wall = new T.Mesh(new T.BoxGeometry(600, 600, 600), new T.MeshBasicMaterial({ color: 0x989da0, side: T.BackSide }));
      room.add(wall);
      function softbox(position, width, height, strength) {
        const panel = new T.Mesh(new T.PlaneGeometry(width, height), new T.MeshBasicMaterial({color: new T.Color(strength, strength, strength), side: T.DoubleSide}));
        panel.position.set(...position); panel.lookAt(0, 0, 0); room.add(panel);
      }
      softbox([-160, 90, 80], 95, 210, 4.2);
      softbox([120, 120, -120], 65, 180, 3.2);
      softbox([20, 220, 0], 170, 90, 3.6);
      softbox([0, 30, 240], 145, 55, 1.7);
      softbox([220, 25, 65], 100, 210, 3);
      const pmrem = new T.PMREMGenerator(renderer);
      environment = pmrem.fromScene(room, .055, .1, 1000);
      scene.environment = environment.texture;
      pmrem.dispose();
      room.traverse(object => { if (object.isMesh) { object.geometry.dispose(); object.material.dispose(); } });
    }
    scene.add(new T.HemisphereLight(0xffffff, 0x7c848b, .95));
    function lamp(x, y, z, intensity) {
      const light = new T.DirectionalLight(0xffffff, intensity);
      light.position.set(x, y, z);
      scene.add(light);
      return light;
    }
    const key = lamp(110, 180, 120, 2.1);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -210, right: 210, top: 180, bottom: -160, far: 700 });
    key.shadow.bias = -.0007;
    key.shadow.normalBias = .035;
    key.shadow.radius = 3;
    lamp(-100, 80, -60, .65);
    lamp(70, 15, -120, 1.1);

    const floor = new T.Mesh(new T.PlaneGeometry(1000, 1000), new T.ShadowMaterial({ opacity: .18 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const grid = new T.GridHelper(460, 23, 0xaebcbb, 0xcdd7d4);
    grid.material.transparent = true;
    grid.material.opacity = .15;
    scene.add(grid);

    const stage = {
      floor,
      grid,
      environment,
      setFloorY(y) {
        const height = Number.isFinite(y) ? y : -49;
        floor.position.y = height;
        grid.position.y = height - .1;
      }
    };
    stage.setFloorY(floorY);
    stages.set(scene, stage);
    return stage;
  };
})();
