/*
TO DO
Adjust how building dim ranges are determined
    basing them on how much space is left in the block
    weighting towards some average size
*/


function getWindows(cube, floor_dims, windowMaterial){
    var windows = new THREE.Object3D();
    //var max_windowDensity = 10;
    //var windowDensity = Math.ceil(Math.random() * max_windowDensity);
    
    windowWidths = [1, 2, 4];
    var windowWidth_x, windowWidth_z;
    var index;
    do{
        index = Math.floor(Math.random() * windowWidths.length);
        windowWidth_x = windowWidths[index];
        windowWidth_x *= 0.75;
    }while(windowWidth_x > floor_dims.x);
    do{
        index = Math.floor(Math.random() * windowWidths.length);
        windowWidth_z = windowWidths[index];
        windowWidth_z *= 0.75;
    }while(windowWidth_z > floor_dims.z);
    var windowStep;
    
    // Add Windows
        cube.material = windowMaterial;
        var windowMesh;
        var windowSet;
        var thisLength;
        var thatLength;
                        
        // for each wall, fill with windows
        for (var i = 0; i < 4; i++){
            windowSet = new THREE.Object3D();
            if (i % 2 == 0){
                thisLength = floor_dims.x;
                thatLength = floor_dims.z;
                windowWidth = windowWidth_x; 
            }else{
                thisLength = floor_dims.z;
                thatLength = floor_dims.x;
                windowWidth = windowWidth_z;
            }
            //windowCount = thisLength / windowWidth;
            windowStep = windowWidth * (4.0/3.0);
            windowCount = thisLength / windowStep;
            cube.scale.set(windowWidth, 
                            floor_dims.y * 0.75, 
                            0.05);
            var xPos;
            // for each window on this wall
            for (var j = 0; j < windowCount; j++){
                // clone the cube as-is
                windowMesh = cube.clone();
                // set windowMesh position relative to
                // the front facing wall
                windowMesh.position.set((j * windowStep 
                                        + windowStep/2) 
                                        - thisLength/2,
                                        cube.position.y,
                                        -thatLength/2 - cube.scale.z*0.5);
                if(Math.abs(windowMesh.position.x + windowWidth) < thisLength){
                    windowSet.add(windowMesh);
                }
            }
            // rotate window set to the desire wall
            windowSet.rotation.y = Math.PI/2 * i;
            windows.add(windowSet);
    }
    return windows;
}

function getBuilding(maxDims, wallMaterial, windowMaterial){
     //
    // Add a building
    //
    const building = new THREE.Object3D();
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
 
    var cube = new THREE.Mesh(geometry, wallMaterial);
    var max_floorCount = 4;
    var floorCount = Math.random() * max_floorCount;

    // Windows can end up running off the edge of the length of a wall
    // if the wall length is not a multiple of 2, so it's easiest to 
    // just ensure that x/z_length are even by doubling the output of the
    // Math.round( . . . ) expression
    var x_length = Math.ceil(Math.random() * maxDims[0] / 2) * 2;
    var z_length = Math.ceil(Math.random() * maxDims[1] / 2) * 2;
    var floor_dims = new THREE.Vector3(x_length, 2, z_length);
    for (var f = 0; f < floorCount; f++){
        // Place floor of height, width, length  
        cube = new THREE.Mesh(geometry, wallMaterial);
        cube.scale.set(floor_dims.x, floor_dims.y, floor_dims.z);
        cube.position.y = f * floor_dims.y;
        building.add(cube.clone());
        building.add(getWindows(cube, floor_dims, windowMaterial));   
        }
    building.name = "building";
    return building;
}

function getStreet(streetDims, buildingBase, 
                    streetMaterial, wallMaterial, windowMaterial){
    const street= new THREE.Object3D;
    streetGeo = new THREE.BoxBufferGeometry(streetDims[0], 0.15,
                                                streetDims[1]);
    streetMesh = new THREE.Mesh(streetGeo, streetMaterial);
    streetMesh.name = "street";
    streetMesh.position.y -= 1;
    street.add(streetMesh);
    streetPoints = [[-streetDims[0]/2, 0],
                    [streetDims[0]/2, 0]];
    var b = 0;
    while(b < streetDims[0]){
        building = getBuilding(buildingBase, wallMaterial, 
                                windowMaterial);
        buildingDepth = building.children[0].scale.z;
        buildingWidth = building.children[0].scale.x;
        building.position.x = b - streetDims[0]/2 + buildingWidth/2;
        building.position.z = - (streetDims[1]/2 
                                + buildingDepth/2);
        //building.position.y -= 0.5;
        street.add(building.clone());
        b += buildingWidth + 0.5;
    }
    b = 0;
    while(b < streetDims[0]){
        building = getBuilding(buildingBase, wallMaterial, 
                                windowMaterial);
        buildingDepth = building.children[0].scale.z;
        buildingWidth = building.children[0].scale.x;
        building.position.x = b - streetDims[0]/2 + buildingWidth/2;
        building.position.z = + (streetDims[1]/2 
                        + buildingDepth/2);
        //building.position.y -= 0.5;
        street.add(building.clone());
        b += buildingWidth + 0.5;
    }
    return street;
}

function getBlock(blockDims, wallMaterial, windowMaterial){
    var block = new THREE.Object3D();
    var dimsUsed = 0;
    for (var i = 0; i < blockDims[0]; i++){
        building = getBuilding([blockDims[0]-dimsUsed, blockDims[1]],wallMaterial, windowMaterial);
        building.position.x -= (blockDims[0]/2 - i) 
                             - ( building.children[0].scale.x/2 + 0.5);
        building.position.z -= (building.children[0].scale.z/2);
        block.add(building.clone());
        dimsUsed -= building.scale.x;
        i += building.children[0].scale.x;
        }
    return block;
}