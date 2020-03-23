
//Load avatar and allow only Y rotation

let renderer = null,
scene = null,
camera = null,
root = null,
group = null,
objectList = [],
transformControls = null;

let objLoader = null;

let duration = 20000; // ms
let currentTime = Date.now();

let directionalLight = null;
let spotLight = null;
let ambientLight = null;
let pointLight = null;
let mapUrl = "../images/checker_large.gif";

let SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

let objModelUrl = {obj:'../models/obj/human/FinalBaseMesh.obj'};

function promisifyLoader ( loader, onProgress )
{
    function promiseLoader ( url ) {

      return new Promise( ( resolve, reject ) => {

        loader.load( url, resolve, onProgress, reject );

      } );
    }

    return {
      originalLoader: loader,
      load: promiseLoader,
    };
}

const onError = ( ( err ) => { console.error( err ); } );

async function loadObj(objModelUrl, objectList)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        const object = await objPromiseLoader.load(objModelUrl.obj);

        let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
        let normalMap = objModelUrl.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(objModelUrl.normalMap) : null;
        let specularMap = objModelUrl.hasOwnProperty('specularMap') ? new THREE.TextureLoader().load(objModelUrl.specularMap) : null;

        //puede que el objeto venga separado, por eso todos los hijos del modelo pueden ser un mesh, a esos meshes le asignamos las texturas y sombras
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material.color.setHex(0xde7826);
            }
        });

        object.scale.set(1, 1, 1);
        object.position.z = 15;
        object.position.x = 0;
        object.rotation.y = 0;
        object.name = "objObject";
        objectList.push(object);
        control.attach( object );
        scene.add(object);

    }
    catch (err) {
        return onError(err);
    }
}

function run()
{
    requestAnimationFrame(function() { run(); });

    // Render the scene
    renderer.render( scene, camera );

}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;

    light.color.setRGB(r, g, b);
}

function createScene(canvas)
{
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.BasicShadowMap;

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(0, 10, 50);
    scene.add(camera);

   //--------------------

    // Create a group to hold all the objects
    root = new THREE.Object3D;

    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0x000000, 1);

    // Create and add all the lights

    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(0, 30, 20);
    spotLight.target.position.set(0, 0, 15);
    root.add(spotLight);

    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(0, 30, -20);
    spotLight.target.position.set(0, 0, 15);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow. camera.far = 200;
    spotLight.shadow.camera.fov = 45;

    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0xffffff, 0.8);
    root.add(ambientLight);

    //Create TransformControls
    control = new THREE.TransformControls( camera, renderer.domElement );
    control.addEventListener( 'change', function() {
    control.update();
    renderer.render(scene);
    });

    // Create the objects, in this case only one object
    loadObj(objModelUrl, objectList);

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    //PLANE
    let map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    let color = 0xffffff;

    let geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    group.add( mesh );

    scene.add( root );

    //ADD CONTROL and allow only Y rotation
    scene.add( control );
    control.showX = false;
    control.showZ = false;
    control.setMode( "rotate" );

}
