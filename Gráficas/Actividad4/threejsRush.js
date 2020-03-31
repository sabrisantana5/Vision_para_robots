//en el html quitó el scroll overflow: hidden;  y puso el canvas en pantalla completa <style>
let container;
let camera, scene, raycaster, renderer;

let mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
let radius = 100, theta = 0;
let duration = 20000; // ms
let currentTime = Date.now();
let objectList = [];
let counter = 0;
let stop = false;


let objModelUrl = {obj:'../models/obj/Penguin_obj/penguin.obj', map:'../models/obj/Penguin_obj/peng_texture.jpg'};
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

async function loadObj(objModelUrl,i,objectList)
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
              child.castShadow = true;
              child.receiveShadow = true;
              child.material.map = texture;
              child.material.normalMap = normalMap;
              child.material.specularMap = specularMap;
          }
        });

        object.scale.set(1, 1, 1);
        object.position.set(Math.random() * 200 - 100, Math.random() * 200 - 100, -100);
        object.name = "objObject"+i;
        objectList.push(object);
        scene.add(object);

    }
    catch (err) {
        return onError(err);
    }
}

function createScene(canvas)
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.name = "Camera"; //Position 0,0,0
    console.log(camera.position);
    //camera.position.set(0,2.5,2.5);
    //camera.lookAt(new THREE.Vector3(0,0,10));

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

    let light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 1 );
    light.name = "Light";
    scene.add( light );

    //Aquí crea los pingus

    for ( let i = 0; i < 10; i ++ )
    {
        loadObj(objModelUrl, i, objectList);
    }
    //RAYCASTER, objeto que se encarga de lanzar un rayo para ver si toca un objeto
    raycaster = new THREE.Raycaster();

    document.addEventListener('mousedown', onDocumentMouseDown);

    window.addEventListener( 'resize', onWindowResize);
}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseDown(event) //evento del click
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );
    let intersects = raycaster.intersectObjects( scene.children, true );
    console.log("intersects", intersects);
    if ( intersects.length > 0 )
    {
        CLICKED = intersects[ intersects.length - 1 ].object.parent;//aqui le puse el parent por el group
        console.log(CLICKED.name);
        counter  = counter + 1;
        document.querySelector('#score').textContent = "Score: " + counter; //actualiza el score
        CLICKED.position.set(Math.random() * 200 - 100, Math.random() * 200 - 100, -100); //regresa el objeto al inicio del nivel
    }
    else
    {
        CLICKED = null;
    }
}

//Funcion que crea un contador para el juego
function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = "Timer:" + minutes + ":" + seconds;

        if (--timer < 0) {
          //si el tiempo se acaba la animacion se detiene y podemos dar clic en el texto para volver a cargar la pagina y volver a jugar
            stop = true;
            display.textContent = "Game over, CLICK HERE TO RESTART";
            display.onclick = function Reload() {location.reload()}
        }
    }, 1000);
}
//Cuando la pagina se recarga se reinicia el contador
window.onload = function () {
    var oneMinute = 25 * 1, //cambiar a 60
        display = document.querySelector('#time');
    startTimer(oneMinute, display);
};

//Animacion de pinguinos que se dirigen hacia la camara
function animate()
{
    for(object of objectList){
            if(object.position.z >= 0){
              //Si el objeto ya llegó a la camara se coloca al final del nivel y el contador se actualiza
              object.position.set(Math.random() * 200 - 100, Math.random() * 200 - 100, -100);
              counter  = counter - 1;
              document.querySelector('#score').textContent = "Score: " + counter;
            }
            else{
              object.translateZ(0.1);
            }

            if(object.position.y > 0){
              object.translateY(-0.1);
            }
            else{
              object.translateY(0.1);
            }

            if(object.position.x > 0){
              object.translateX(-0.1);
            }
            else{
              object.translateX(0.1);
            }
  }
}

function run()
{
    requestAnimationFrame( run );
    if(stop!=true){
    animate();
  }
    render();
}
function render()
{
    renderer.render( scene, camera );
}
