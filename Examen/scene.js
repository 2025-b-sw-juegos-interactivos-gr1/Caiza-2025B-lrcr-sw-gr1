(function () {
    window.addEventListener('DOMContentLoaded', function () {

        const canvas = document.getElementById("renderCanvas");
        const engine = new BABYLON.Engine(canvas, true);


        // Variable de estado
        let bolsaEnMano = false;

        // Mapa de teclas
        let inputMap = {};

        const createScene = function () {

            const scene = new BABYLON.Scene(engine);
            const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 25, -30), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, true);

            // Luz hemisférica
            const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

            //suelo con textura de asfalto
            const matSuelo = new BABYLON.StandardMaterial("matSuelo", scene);
            matSuelo.diffuseTexture = new BABYLON.Texture('assets/textures/acera.jpg', scene);
            matSuelo.diffuseTexture.uScale = 2; // Repetir textura 2 veces en X
            matSuelo.diffuseTexture.vScale = 2; // Repetir textura 2 veces en Z

            // Crear el suelo (4 veces más grande)
            const suelo = BABYLON.MeshBuilder.CreateGround("suelo", { width: 40, height: 40 }, scene);
            suelo.material = matSuelo;

            let jugador;
            let bolsa;
            let vertedero;

            // Posiciones de las casas para generar bolsas cerca
            const posicionesCasas = [
                { x: 15, z: 15, offsetX: -5, offsetZ: -3 },   // Casa 1 - Frente hacia el centro
                { x: -15, z: 15, offsetX: 5, offsetZ: -3 },   // Casa 2 - Frente hacia el centro
                { x: -15, z: 0, offsetX: 5, offsetZ: 0 },     // Casa 3 - Frente hacia el centro
                { x: 15, z: 0, offsetX: -5, offsetZ: 0 }      // Casa 4 - Frente hacia el centro
            ];

            function crearBolsaBasura(scene) {
                return BABYLON.SceneLoader.ImportMeshAsync(
                    null,
                    "assets/models/garbage_bag/",
                    "scene.gltf",
                    scene
                ).then((result) => {
                    const nuevo = result.meshes[0];
                    nuevo.scaling = new BABYLON.Vector3(0.007, 0.007, 0.007);

                    // Seleccionar una casa aleatoria
                    const casaAleatoria = posicionesCasas[Math.floor(Math.random() * posicionesCasas.length)];

                    // Generar posición al frente de la casa con pequeña variación
                    const variacionX = (Math.random() - 0.5) * 2; // -1 a +1
                    const variacionZ = (Math.random() - 0.5) * 2; // -1 a +1

                    nuevo.position = new BABYLON.Vector3(
                        casaAleatoria.x + casaAleatoria.offsetX + variacionX,
                        0.2,
                        casaAleatoria.z + casaAleatoria.offsetZ + variacionZ
                    );
                    nuevo.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);

                    console.log("📍 Nueva bolsa generada en:", nuevo.position);
                    return nuevo;
                });
            }

            // Importar el modelo del camión
            BABYLON.SceneLoader.ImportMeshAsync(null, "assets/models/garbage_truck/", "scene.gltf", scene)
                .then((result) => {
                    const truckRoot = new BABYLON.TransformNode("truckRoot", scene);

                    result.meshes.forEach(m => {
                        if (m.parent === null) {
                            m.parent = truckRoot;
                        }
                    });

                    jugador = truckRoot;

                    // ESCALA, POSICIÓN Y ROTACIÓN DEL MODELO COMPLETO
                    jugador.scaling = new BABYLON.Vector3(0.006, 0.006, 0.006);
                    jugador.position = new BABYLON.Vector3(0, 0, 0);
                    jugador.rotation = new BABYLON.Vector3(0, Math.PI, 0);

                    console.log("Camión está listo y es el jugador");
                })
                .catch((err) => {
                    console.error("❌ No se pudo cargar el modelo del Camión:", err);
                });

            // Importar el modelo de la bolsa de basura
            crearBolsaBasura(scene).then(r => {
                bolsa = r;
                console.log("Primera bolsa de basura lista");
            });


            // Importar el modelo del vertedero
            BABYLON.SceneLoader.ImportMeshAsync(null, "assets/models/garbage_container/", "scene.gltf", scene)
                .then((result) => {
                    const meshes = result.meshes;
                    if (meshes && meshes.length) {
                        vertedero = meshes[0];

                        // Agrandar el vertedero
                        vertedero.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);
                        vertedero.position = new BABYLON.Vector3(0, 0, 0); // Centro del mapa
                        // Girarlo hacia el campo del lado derecho (porque mira hacia otro lado por defecto)
                        vertedero.rotation = new BABYLON.Vector3(0, Math.PI / 0.5, 0);

                        console.log("✅ Vertedero ubicado");
                    }
                })

                .catch((err) => {
                    console.error("❌ No se pudo cargar el modelo del Vertedero:", err);
                });

            //importar el modelo de la Casa residencial
            BABYLON.SceneLoader.ImportMeshAsync(null, "assets/models/casa/", "scene.gltf", scene)
                .then((result) => {
                    const meshes = result.meshes;
                    if (meshes && meshes.length) {
                        const house = meshes[0];

                        // Escala para que no se vea gigante
                        house.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
                        house.position = new BABYLON.Vector3(15, 0, 15); // Esquina superior derecha
                        house.rotation.y = -Math.PI / 4; // Rotar hacia el centro

                        console.log("✅ Casa 1 ubicada");
                    }
                })
                .catch((err) => {
                    console.error("❌ No se pudo cargar el modelo de la Casa 1:", err);
                });

            // Importar segunda casa
            BABYLON.SceneLoader.ImportMeshAsync(null, "assets/models/casa/", "scene.gltf", scene)
                .then((result) => {
                    const meshes = result.meshes;
                    if (meshes && meshes.length) {
                        const house2 = meshes[0];

                        house2.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
                        house2.position = new BABYLON.Vector3(-15, 0, 15); // Esquina superior izquierda
                        house2.rotation.y = Math.PI / 4; // Rotar hacia el centro

                        console.log("✅ Casa 2 ubicada");
                    }
                })
                .catch((err) => {
                    console.error("❌ No se pudo cargar el modelo de la Casa 2:", err);
                });

            // Importar tercera casa
            BABYLON.SceneLoader.ImportMeshAsync(null, "assets/models/casa/", "scene.gltf", scene)
                .then((result) => {
                    const meshes = result.meshes;
                    if (meshes && meshes.length) {
                        const house3 = meshes[0];

                        house3.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
                        house3.position = new BABYLON.Vector3(-15, 0, 0); // Lado izquierdo centro (cruzando acera)
                        house3.rotation.y = Math.PI / 2; // Rotar hacia el centro

                        console.log("✅ Casa 3 ubicada");
                    }
                })
                .catch((err) => {
                    console.error("❌ No se pudo cargar el modelo de la Casa 3:", err);
                });

            // Importar cuarta casa
            BABYLON.SceneLoader.ImportMeshAsync(null, "assets/models/casa/", "scene.gltf", scene)
                .then((result) => {
                    const meshes = result.meshes;
                    if (meshes && meshes.length) {
                        const house4 = meshes[0];

                        house4.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
                        house4.position = new BABYLON.Vector3(15, 0, 0); // Lado derecho centro
                        house4.rotation.y = -Math.PI / 2; // Rotar hacia el centro

                        console.log("✅ Casa 4 ubicada");
                    }
                })
                .catch((err) => {
                    console.error("❌ No se pudo cargar el modelo de la Casa 4:", err);
                });


            scene.actionManager = new BABYLON.ActionManager(scene);

            scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, evt => {
                inputMap[evt.sourceEvent.key.toLowerCase()] = true;
            }));
            scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, evt => {
                inputMap[evt.sourceEvent.key.toLowerCase()] = false;
            }));

            scene.onKeyboardObservable.add(kbInfo => {
                console.log("🎹 Tecla detectada:", kbInfo.event.key, "Tipo:", kbInfo.type);

                if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN && kbInfo.event.key === " ") {
                    console.log("🔑 Espacio presionado!");

                    // Validar que los objetos existan
                    if (!jugador || !bolsa || !vertedero) {
                        console.log("⏳ Esperando a que se carguen todos los objetos...");
                        console.log("   - Jugador:", !!jugador);
                        console.log("   - Bolsa:", !!bolsa);
                        console.log("   - Vertedero:", !!vertedero);
                        return;
                    }

                    console.log("📦 Estado bolsaEnMano:", bolsaEnMano);

                    if (!bolsaEnMano) {
                        const distancia = BABYLON.Vector3.Distance(jugador.position, bolsa.position);
                        console.log("📏 Distancia a la bolsa:", distancia.toFixed(2), "metros (necesita < 2)");
                        console.log("   - Posición jugador:", jugador.position);
                        console.log("   - Posición bolsa:", bolsa.position);

                        if (distancia < 2) {
                            bolsa.scaling = new BABYLON.Vector3(0.0035, 0.0035, 0.0035);
                            bolsa.parent = jugador;
                            bolsa.position.set(0.2, 0.4, 0.2);
                            bolsaEnMano = true;
                            console.log("✅ Bolsa de basura recogida");
                        } else {
                            console.log("⚠️ Demasiado lejos de la bolsa. Acércate más.");
                        }
                    } else {
                        const distancia = BABYLON.Vector3.Distance(jugador.position, vertedero.position);
                        console.log("📏 Distancia al vertedero:", distancia.toFixed(2), "metros (necesita < 2)");
                        console.log("   - Posición jugador:", jugador.position);
                        console.log("   - Posición vertedero:", vertedero.position);

                        if (distancia < 2) {
                            bolsa.parent = null;
                            bolsa.position.copyFrom(vertedero.position);
                            bolsa.scaling = new BABYLON.Vector3(0.007, 0.007, 0.007);
                            bolsa.position.y = 0.4;
                            bolsaEnMano = false;

                            crearBolsaBasura(scene).then(r => {
                                bolsa = r;
                                console.log("✅ Nueva bolsa de basura lista");
                            });

                            // Incrementar el contador de bolsas recolectadas
                            console.log("📊 Incrementando contador...");
                            window.incrementarBolsasRecolectadas();
                        } else {
                            console.log("⚠️ Demasiado lejos del vertedero. Acércate más.");
                        }
                    }
                }
            });

            const velocidad = 0.15;
            scene.onBeforeRenderObservable.add(() => {
                if (inputMap["w"]) {
                    jugador.position.z += velocidad;
                    jugador.rotation.y = 0;
                }

                if (inputMap["s"]) {
                    jugador.position.z -= velocidad;
                    jugador.rotation.y = Math.PI;
                }
                if (inputMap["a"]) {
                    jugador.position.x -= velocidad;
                    jugador.rotation.y = -Math.PI / 2;
                }

                if (inputMap["d"]) {
                    jugador.position.x += velocidad;
                    jugador.rotation.y = Math.PI / 2;
                }

                if (inputMap["w"] && inputMap["a"]) {
                    jugador.rotation.y = -Math.PI / 4;
                }

                if (inputMap["w"] && inputMap["d"]) {
                    jugador.rotation.y = Math.PI / 4;
                }

                if (inputMap["s"] && inputMap["a"]) {
                    jugador.rotation.y = -3 * Math.PI / 4;
                }

                if (inputMap["s"] && inputMap["d"]) {
                    jugador.rotation.y = 3 * Math.PI / 4;
                }

            });

            return scene;

        };

        const scene = createScene();
        engine.runRenderLoop(() => scene.render());
        window.addEventListener("resize", () => engine.resize());


    });

})();