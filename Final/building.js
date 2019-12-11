/* TO DO
    + comment file
    + see to dos for each function
    + Add bounding box for city to prevent camera from moving out of bounds
*/

function getWindows(cube, floor_dims, windowMaterial){
    var windows = new THREE.Object3D();
    
    windowWidths = [1, 2];
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

    const building = new THREE.Object3D();
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
 
    var cube = new THREE.Mesh(geometry, wallMaterial);
    var max_floorCount = 10;
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

function placeBuilding(index, sign, buildingBase, streetDims, wallMaterial, windowMaterial){
    building = getBuilding(buildingBase, wallMaterial, 
                                windowMaterial);
    buildingDepth = building.children[0].scale.z;
    buildingWidth = building.children[0].scale.x;
    building.position.x = index - streetDims[0]/2 + buildingWidth/2;
    building.position.z = sign * (streetDims[1]/2 + buildingDepth/2);
    return building;
}

function getRoad(streetDims, streetMaterial){
    const geometry = new THREE.BoxBufferGeometry(streetDims[0], 0.15,
                                                streetDims[1]);
    const road  = new THREE.Mesh(geometry, streetMaterial);
    road.name = "road";
    road.position.y -= 1;
    return road;
}

// TO DO:
//  Implement placeRow to simplify code, implement such that it can
//          take any mesh generation function like for windows
//
function getStreet(streetDims, buildingBase, streetMaterial, windowMaterial,
                    left = true, right = true){
    var wallMaterial;

    const street= new THREE.Object3D;
    street.name = "street";
    street.add(getRoad(streetDims, streetMaterial));

    var building;
    var row = new THREE.Object3D;;
    var b = 0;
    if (left){
        while(b + buildingBase[0] < streetDims[0]){
            wallMaterial = getMaterial(buildingBase);
            building = placeBuilding(b, -1, buildingBase, streetDims, 
                            wallMaterial, windowMaterial);
            row.add(building.clone());
            b += building.children[0].scale.x + Math.random() * 2;
        }
        row.position.x += (streetDims[0] - b) / 2;
        street.add(row.clone());
    }
    if (right){  
        row = new THREE.Object3D;;
        b = 0;
        while(b + buildingBase[0] < streetDims[0]){
            wallMaterial = getMaterial(buildingBase);
            building = placeBuilding(b, 1, buildingBase, streetDims, 
                            wallMaterial, windowMaterial);
            row.add(building.clone());
            b += building.children[0].scale.x + 0.5;
        }
        row.position.x += (streetDims[0] - b) / 2;
        street.add(row);
    }
    return street;
}

// TO DO:
//  implement placeStreet and placeCorner to simplify code
//
function getBlock( blockDims, buildingBase, streetMaterial, windowMaterial,
                    outsides = [false, false, false, false] ){
    const block = new THREE.Object3D;
    // street dimensions, [length, width]
    var streetDimsLong = [blockDims[0], blockDims[2]];
    var streetDimsShort = [blockDims[1], blockDims[2]];
    // get first street and add to city
    var street = getStreet(streetDimsLong, buildingBase, streetMaterial,
                        windowMaterial, true, outsides[0]);
    
    street.position.z += streetDimsShort[0]/2 + blockDims[2] / 2 + buildingBase[1];                
    block.add(street);
 
    var street = getStreet(streetDimsLong, buildingBase, streetMaterial,
                    windowMaterial, outsides[1], true);
    street.position.z -= streetDimsShort[0]/2 + blockDims[2] / 2 + buildingBase[1];
    block.add(street);
    
    street = getStreet(streetDimsShort, buildingBase, streetMaterial,
                windowMaterial, outsides[2], true);
    street.rotation.y = Math.PI/2;
    
    street.position.x -= (streetDimsLong[0] / 2 + buildingBase[1] + blockDims[2] / 2);
    
    block.add(street);
                    
    street = getStreet(streetDimsShort, buildingBase, streetMaterial,
                windowMaterial, true, outsides[3]);
    street.rotation.y = Math.PI/2;
    street.position.x += (streetDimsLong[0] / 2 + buildingBase[0] + blockDims[2] / 2);
                   
    block.add(street);              
    block.position.z += streetDimsShort[0] + buildingBase[1]/2;

    
    var corner;
    
    corner = getCorner(blockDims, buildingBase, streetMaterial, windowMaterial);
    corner.position.x += blockDims[0] / 2 + buildingBase[1] + blockDims[2] / 2;
    corner.position.z += blockDims[1] / 2 + buildingBase[1] + blockDims[2] / 2;
    block.add(corner);
    
    corner = getCorner(blockDims, buildingBase, streetMaterial, windowMaterial);
    corner.position.x -= blockDims[0] / 2 + buildingBase[1] + blockDims[2] / 2;
    corner.position.z += blockDims[1] / 2 + buildingBase[1] + blockDims[2] / 2;
    corner.rotation.y -= Math.PI/2;
    block.add(corner);
    
    corner = getCorner(blockDims, buildingBase, streetMaterial, windowMaterial);
    corner.position.x -= blockDims[0] / 2 + buildingBase[1] + blockDims[2] / 2;
    corner.position.z -= blockDims[1] / 2 + buildingBase[1] + blockDims[2] / 2;
    corner.rotation.y -= Math.PI;
    block.add(corner);
    
    corner = getCorner(blockDims, buildingBase, streetMaterial, windowMaterial);
    corner.position.x += blockDims[0] / 2 + buildingBase[1] + blockDims[2] / 2;
    corner.position.z -= blockDims[1] / 2 + buildingBase[1] + blockDims[2] / 2;
    corner.rotation.y += Math.PI/2;
    block.add(corner);
    
    return block;
}

function getCorner(blockDims, buildingBase, streetMaterial, windowMaterial){
    var building;
    const roadDims = [(blockDims[2] + buildingBase[1]), blockDims[2]];
    var road = getRoad(roadDims, streetMaterial);
    const corner = new THREE.Object3D;
    
    road.position.x -= roadDims[0]/2 - blockDims[2]/2;
    corner.add(road.clone());
    road = getRoad(roadDims, streetMaterial);
    road.position.z -= roadDims[0]/2 - blockDims[2]/2;
    road.rotation.y = Math.PI/2;
    corner.add(road.clone());
    
    building = getBuilding(buildingBase, wallMaterial, windowMaterial);
    building.position.x -= blockDims[2]/2 + buildingBase[0] / 2;
    building.position.z -= blockDims[2]/2 + buildingBase[0] / 2;
    corner.add(building);
    return corner; 
}