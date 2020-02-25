var projectionMatrix;

let mat4 = glMatrix.mat4;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute,
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 10000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try
    {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -5]);
}

// TO DO: Create the functions for each of the figures.
//-------------------------------------------------------------
function createPyramid(gl, translation, rotationAxis)
{
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        let verts =  [0.0, 0.0, 0.0];
        let radio = 1;

        //Under face
        for(let angulo = 270; angulo < 630; angulo += 72) //72 so it will happen 5 times
        {
           let rad = angulo * Math.PI / 180;
           verts.push(Math.cos(rad) * radio);
           verts.push(0);
           verts.push(Math.sin(rad) * radio);
        }

        //Face 1
        verts.push(
          verts[3], verts[4], verts[5],
          0.0,  3,  0.0,
          verts[6], verts[7], verts[8]
        );
        //Face 2
        verts.push(
          verts[6], verts[7], verts[8],
          0.0, 3, 0.0,
          verts[9], verts[10], verts[11]
        );
        //Face 3
        verts.push(
          verts[9], verts[10], verts[11],
          0.0, 3, 0.0,
          verts[12], verts[13], verts[14]
        );
        //Face 4
        verts.push(
          verts[12], verts[13], verts[14],
          0.0, 3, 0.0,
          verts[15], verts[16], verts[17]
        );
        //Face 5
        verts.push(
          verts[15], verts[16], verts[17],
          0.0, 3, 0.0,
          verts[3], verts[4], verts[5]
        );

        console.log(verts);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
      [1.0, 0.0, 0.0, 1.0], // 1 face
      [0.0, 1.0, 0.0, 1.0], // 2 face
      [0.0, 0.0, 1.0, 1.0], // 3 face
      [1.0, 1.0, 0.0, 1.0], // 4 face
      [1.0, 0.0, 1.0, 1.0], // 5 face
      [0.0, 1.0, 1.0, 1.0]  // Under face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors)
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    for (let j=0; j < 6; j++){
      vertexColors.push(...faceColors[0]);
    }
    for (let i=1; i <= 5; i++){
      for (let j=0; j < 3; j++){
        vertexColors.push(...faceColors[i]);
      }
    }


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

    let cubeIndices = [
      0, 1, 2,      0, 2, 3,    0, 3, 4,   0, 4, 5,   0, 5, 1,// Front face
      6, 7, 8,    // Face 1
      9, 10, 11,   // Face 2
      12, 13, 14, // Face 3
      15, 16, 17, // Face 4
      18, 19, 20  // Face 5

    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    let cube = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:cubeIndexBuffer,
            vertSize:3, nVerts:30, colorSize:4, nColors: 30, nIndices:30,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, translation);

    cube.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return cube;
}
//-------------------------------------------------------------
//-------------------------------------------------------------
function createDodecahedron(gl, translation, rotationAxis,rotationAxis2)
{
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        let t = ( 1 + Math.sqrt( 5 ) ) / 2;
      	let r = 1 / t;

        let verts = [
          //FTOES Cara 1
          t, 0, r, //T
          t, 0, - r, //S
          1, - 1, - 1,//E
          1, - 1, 1,//F
          r, - t, 0, //O

          //LJFHT Cara 2
          t, 0, r, //T
          1, - 1, 1,//F
          0, r, t,//L
          0, - r, t,//J
          1, 1, 1,//H


          //THPSG Cara 3
          1, 1, 1,//H
          r, t, 0, //P
          1, 1, - 1,//G
          t, 0, - r, //S
          t, 0, r, //T


          //LHDPN Cara 4
          0, r, t,//L
          1, 1, 1,//H
          r, t, 0, //P
          - r, t, 0,//N
          - 1, 1, 1, //D

          //KGCPN Cara 5
          r, t, 0, //P
          - r, t, 0,//N
          - 1, 1, - 1, //C
          0, r, - t,//K
          1, 1, - 1,//G

          //KIGSE Cara 6
          1, 1, - 1,//G
          t, 0, - r, //S
          1, - 1, - 1,//E
          0, - r, - t,//I
          0, r, - t,//K


           //KICAQ Cara 7
           0, r, - t,//K
           0, - r, - t,//I
           - 1, 1, - 1, //C
           - t, 0, - r,//Q
           - 1, - 1, - 1, //A

           //IAEMO Cara 8
            - 1, - 1, - 1, //A
            0, - r, - t,//I
            1, - 1, - 1,//E
            r, - t, 0, //O
            - r, - t, 0,//M


            //JBFMO Cara 9
            - r, - t, 0,//M
            r, - t, 0, //O
            1, - 1, 1,//F
            0, - r, t,//J
            - 1, - 1, 1, //B

          //LJDBR Cara 10
          - 1, - 1, 1, //B
          0, - r, t,//J
          0, r, t,//L
          - 1, 1, 1, //D
          -t, 0, r, //R

          //RBMQA Cara 11
          -t, 0, r, //R
          - 1, - 1, 1, //B
          - r, - t, 0,//M
          - 1, - 1, - 1, //A
          - t, 0, - r,//Q

          //DRNCQ Cara 12
          - t, 0, - r,//Q
          - 1, 1, - 1, //C
          - r, t, 0,//N
          - 1, 1, 1, //D
          -t, 0, r //R


      	];

    console.log(verts);


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    let faceColors = [
      [1.0, 0.0, 0.0, 1.0], // 1 face
      [0.0, 1.0, 0.0, 1.0], // 2 face
      [0.0, 0.0, 1.0, 1.0], // 3 face
      [1.0, 1.0, 0.0, 1.0], // 4 face
      [1.0, 0.0, 1.0, 1.0], // 5 face
      [1.0, 1.0, 1.0, 1.0], // 6 face
      [1.0, 0.0, 0.5, 1.0], // 7 face
      [0.0, 1.0, 0.6, 1.0], // 8 face
      [1.0, 0.0, 0.7, 1.0], // 9 face
      [0.0, 0.0, 0.8, 1.0], // 10 face
      [0.5, 0.0, 0.9, 1.0], // 11 face
      [0.5, 1.0, 0.5, 1.0]  // 12 face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors)
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color =>{
        for (let j=0; j < 5; j++)
            vertexColors.push(...color);
    });

    console.log(vertexColors);


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);


    let cubeIndices = [
            0, 1, 2, 3, 4, 0, 2, 4,
            5, 6, 7, 8, 9, 5, 7, 9,
            10, 11, 12, 13, 14, 10, 12, 14,
            15, 16, 17, 18, 19, 15, 17, 19,
            20, 21, 22, 23, 24, 20, 22, 24,
            25, 26, 27, 28, 29, 25, 27, 29,
            30, 31, 32, 33, 34, 30, 31, 34,
            35, 36, 37, 38, 39, 35, 37, 39,
            40, 41, 42, 43, 44, 40, 42, 44,
            45, 46, 47, 48, 49, 45, 47, 49,
            50, 51, 52, 53, 54, 50, 52, 54,
            55, 56, 57, 58, 59, 55, 57, 59,
        ];

    console.log(cubeIndices);
    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    let cube = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:cubeIndexBuffer,
            vertSize:3, nVerts:12, colorSize:4, nColors: 12, nIndices:96,
            primtype:gl.TRIANGLE_STRIP, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, translation);

    cube.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;

        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis2);
    };

    return cube;
}
//-------------------------------------------------------------
//-------------------------------------------------------------
function createOctahedron(gl, translation, rotationAxis)
{
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        let verts = [];

        //Face 1
        verts.push(
          -1.0, 0.0, -1.0,
          0.0,  1,  0.0,
          1.0, 0.0, -1.0
        );
        //Face 2
        verts.push(
          1.0, 0.0, -1.0,
          0.0, 1, 0.0,
          1.0, 0.0,  1.0
        );
        //Face 3
        verts.push(
          1.0, 0.0,  1.0,
          0.0, 1, 0.0,
          -1.0, 0.0,  1.0
        );

        //Face 4
        verts.push(
          -1.0, 0.0,  1.0,
          0.0, 1, 0.0,
          -1.0, 0.0, -1.0
        );

        //Face  5
        verts.push(
          -1.0, 0.0, -1.0,
          0.0,  -1,  0.0,
          1.0, 0.0, -1.0
        );
        //Face 6
        verts.push(
          1.0, 0.0, -1.0,
          0.0, -1, 0.0,
          1.0, 0.0,  1.0
        );
        //Face 7
        verts.push(
          1.0, 0.0,  1.0,
          0.0, -1, 0.0,
          -1.0, 0.0,  1.0
        );

        //Face 8
        verts.push(
          -1.0, 0.0,  1.0,
          0.0, -1, 0.0,
          -1.0, 0.0, -1.0
        );

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
      [1.0, 0.0, 0.0, 1.0], // 1 face
      [0.0, 1.0, 0.0, 1.0], // 2 face
      [0.0, 0.0, 1.0, 1.0], // 3 face
      [1.0, 1.0, 0.0, 1.0], // 4 face
      [1.0, 0.0, 1.0, 1.0], // 5 face
      [1.0, 1.0, 1.0, 1.0], // 6 face
      [1.0, 0.0, 0.5, 1.0], // 7 face
      [0.0, 1.0, 0.6, 1.0], // 8 face
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the cube's face.
    let vertexColors = [];
    // for (const color of faceColors)
    // {
    //     for (let j=0; j < 4; j++)
    //         vertexColors.push(...color);
    // }
    faceColors.forEach(color =>{
        for (let j=0; j < 3; j++)
            vertexColors.push(...color);
    });


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    let cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

    let cubeIndices = [
      0,1,2,
      3,4,5,
      6,7,8,
      9,10,11,
      12,13,14,
      15,16,17,
      18,19,20,
      21,22,23,
      24,25,26

    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    let cube = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:cubeIndexBuffer,
            vertSize:3, nVerts:30, colorSize:4, nColors: 30, nIndices:24,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, translation);

        let up = true;
        let f = 0;

    cube.update = function()
    {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;


        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);

        if(up){
          if(f == 43){
            up = false;
          }
          else{
              mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, [0,0.1,0]);
              f = f + 1;
            }
        }
        else{
          if(f == -43){
            up = true;
          }
          else{
              mat4.translate(cube.modelViewMatrix, cube.modelViewMatrix, [0,-0.1,0]);
              f = f - 1;
              }
            }
    };

    return cube;
}
//-------------------------------------------------------------

function createShader(gl, str, type)
{
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs)
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i<objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs)
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}
