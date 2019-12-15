/* 
    =======================
    Building
    COS 452, Fall 2019
    Final Project
    Author: Zachary Rohman
    =======================
    Functions for creating buildings, streets, and blocks. Generally speaking,
    getX() functions create and return the desired mesh, placeX() functions will
    position the object relative to the object's creation function that calls 
    it.
    Ex: getBuilding() will create a building of random dimensions and material
    and return it as-is at the origin point. placeBuilding() is called by
    getStreet() and returns a building positioned relative to the street
    and other buildings on the street.
    
    Some functions may not have corresponding get/place functions.
*/

/*
    BUILDING CREATION
    The following functions are used for generation of buildings
    Includes the functions:
        placeWindows()
        getBuilding()
        placeBuilding()

*/


/* placeWindows: creates and applies windows to sides of a building. There
    is no associated getWindows() function.
    Window count and placement is determined from the dimensions
    of the target building
PARAMS: cube, mesh: a mesh with box geometry
        floor_dims, array[x, z]: an array representing the width and depth 
                    of a building
        windowMaterial, material: the material to apply to the windows
RETURNS:
    windows, Object3D: parent object containing four sets of windows
*/
function placeWindows(cube, floor_dims, windowMaterial){
    cube.name = "window"
    // Initialise parent object for window sets
    var windows = new THREE.Object3D();
    // possible window window widths to randomly select from
    windowWidths = [1, 2];
    var windowWidth_x, windowWidth_z;
    var index;
    
    // Get a random window width from possible windowWidths
    index = Math.floor(Math.random() * windowWidths.length);
    windowWidth_x = windowWidths[index];
    // scale window down slightly
    windowWidth_x *= 0.75;
    
    // Get random window width for z-length
    index = Math.floor(Math.random() * windowWidths.length);
    windowWidth_z = windowWidths[index];
    windowWidth_z *= 0.75;

    var windowStep;
    
    // Add Windows
    // apply window material to cube
    cube.material = windowMaterial;
    var windowMesh;
    // declare windowSet, an empty object3D to parent individual windows to
    var windowSet;
    // declare values this/thatLength for determining
    // how much to offset a window set from the center
    var thisLength;
    var thatLength;
                        
    // for each wall, fill with windows
    for (var i = 0; i < 4; i++){
        // point window set to a new Object3D
        windowSet = new THREE.Object3D();
        // if i is even then we are filling windows along
        // the building side of length x
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
        cube.scale.set(windowWidth, floor_dims.y * 0.75, 0.05);
        var xPos;
        // for each window on this wall
        for (var j = 0; j < windowCount; j++){
            // clone the cube as-is
            windowMesh = cube.clone();
            // set windowMesh position relative to
            // the front facing wall
            windowMesh.position.set((j * windowStep + windowStep/2) - thisLength/2,
                                        cube.position.y,
                                        -thatLength/2 - cube.scale.z*0.5);
            if(Math.abs(windowMesh.position.x + windowWidth) < thisLength){
                    windowSet.add(windowMesh);
            }
        }
        // rotate window set to the desired wall
        windowSet.rotation.y = Math.PI/2 * i;
        windows.add(windowSet);
    }
    return windows;
}
/* getBuilding: generates a random building within a range of maximum values
PARAMS: maxDims, int [x, z, y]: the maximum width/depth and height for a building
        wallMaterial, material: the material to apply to the building floors
        windowMaterial, material: the material to apply to the windows
RETURNS:
    building, Object3D: parent object containing a building of random dimensions
        with windows
*/
function getBuilding(maxDims, wallMaterial, windowMaterial){
    // declare and initialise a building object and box geometry
    const building = new THREE.Object3D();
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    // initialise a cube with the given wall material
    var cube = new THREE.Mesh(geometry, wallMaterial);
    
    /*  
        Windows can end up running off the edge of the length of a wall
        if the wall length is not a multiple of 2, so it's easiest to 
        just ensure that x/z_length are even by doubling the output of the
        Math.round( . . . ) expression
    */
    var x_length = Math.ceil(Math.random() * maxDims[0] / 2) * 2;
    var z_length = Math.ceil(Math.random() * maxDims[1] / 2) * 2;
    // get random floor count
    var floorCount = Math.random() * maxDims[2];
    // declare and initialise a vector to track building dimensions
    var floor_dims = new THREE.Vector3(x_length, 2, z_length);
    
    // for each floor, place a floor and offset along the y-axis (upward)
    for (var f = 0; f < floorCount; f++){
        // Place floor of height, width, length  
        cube = new THREE.Mesh(geometry, wallMaterial);
        cube.scale.set(floor_dims.x, floor_dims.y, floor_dims.z);
        cube.position.y = f * floor_dims.y;        
        cube.name = "floor";

        building.add(cube.clone());
        building.add(placeWindows(cube, floor_dims, windowMaterial));   
        }
    building.name = "building";
    return building;
}

/* placeBuilding: gets a building (getBuilding()) and positions the building
    accordingly along a road. Simplifies code for getRoad() below
PARAMS: index, int: how far along the street's x-axis to place a building
        sign, int: Either -1 or 1, determines on which side of a street to 
                    place to place the building
        buildingBase, int [x, z, y]: the maximum width/depth and height 
                for a building
        streetDims, int [x, z]: the length and width of the street
        wallMaterial, material: the material to apply to the building floors
        windowMaterial, material: the material to apply to the windows
RETURNS:
    building, Object3D: building object positioned relative to the target street
*/
function placeBuilding(index, sign, buildingBase, streetDims, wallMaterial, windowMaterial){
    var building = getBuilding(buildingBase, wallMaterial, 
                                windowMaterial);
    buildingDepth = building.children[0].scale.z;
    buildingWidth = building.children[0].scale.x;
    building.position.x = index - streetDims[0]/2 + buildingWidth/2;
    building.position.z = sign * (streetDims[1]/2 + buildingDepth/2);
    return building;
}


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


/*
    STREET CREATION
    The following functions are used for creation of streets
    Includes the functions:
        getRoad()
        getStreet()
        getCorner()
        placeCorner()
*/


/*
getRoad: gets a road and positions it relative to the assumed floor

PARAMS: steetDims, int[x, z]: the length and width of the road
        streetMaterial, material: the material for a road
RETURNS: road, mesh: the mesh for the road
*/
function getRoad(streetDims, streetMaterial){
    const geometry = new THREE.BoxBufferGeometry(streetDims[0], 0.15,
                                                streetDims[1]);
    const road  = new THREE.Mesh(geometry, streetMaterial);

    road.name = "road";
    road.position.y -= 1;
    return road;
}

/* getStreet: gets a street with a road and buildings on either side
PARAMS: 
        streetDims, [x, z]: the length and width of the street
        buildingBase, int [x, z, y]: the maximum width/depth and height 
                for a building
        streetMaterial, material: the material for the road
        windowMaterial, material: the material to apply to the windows
RETURNS:
    street, Object3D: parent of a road and rows of buildings
*/
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
            wallMaterial = getMaterial();
            building = placeBuilding(b, -1, buildingBase, streetDims, 
                            wallMaterial, windowMaterial);
            row.add(building.clone());
            b += building.children[0].scale.x + Math.random() * 2;
        }
        lengthLeft = Math.floor(streetDims[0] - b);
        if (lengthLeft > 1){
            wallMaterial = getMaterial();
            building = placeBuilding(b, -1, [lengthLeft, buildingBase[1], 
                        buildingBase[2]], streetDims, wallMaterial, 
                        windowMaterial);
            row.add(building.clone());
        }else{
            row.position.x += (streetDims[0] - b) / 2;
        }
        street.add(row.clone());
    }
    if (right){  
        row = new THREE.Object3D;;
        b = 0;
        while(b + buildingBase[0] < streetDims[0]){
            wallMaterial = getMaterial();
            building = placeBuilding(b, 1, buildingBase, streetDims, 
                            wallMaterial, windowMaterial);
            row.add(building.clone());
            b += building.children[0].scale.x + 0.5;
        }
        lengthLeft = Math.floor(streetDims[0] - b);
        if (lengthLeft > 1){
            wallMaterial = getMaterial();
            building = placeBuilding(b, 1, [lengthLeft, buildingBase[1], 
                        buildingBase[2]], streetDims, wallMaterial, 
                        windowMaterial);
            row.add(building.clone());
        }else{
            row.position.x += (streetDims[0] - b) / 2;
        }
        street.add(row);
    }
    return street;
}

/* placeCorner: gets a block corner with building using getCorner and positions
    relative to the block
PARAMS: 
        xSign, int: +/- 1, determines which side to place a corner along the
            x-axis
        zSign, int: +/- 1, determines which side to place a corner along the
            z-axis
        rotation, float: How many radians to rotate a corner
        blockDims, [x_0, x_1, z]: the two street lengths for a block (height
            and width of the block), and street width        
        buildingBase, int [x, z, y]: the maximum width/depth and height 
                for a building
        streetMaterial, material: the material for the road
        windowMaterial, material: the material to apply to the windows
RETURNS:
    corner, Object3D: corner object positioned relative to the block
*/
function placeCorner(xSign, zSign, rotation, blockDims, buildingBase, 
                            streetMaterial, windowMaterial){
    const corner = getCorner(blockDims, buildingBase, 
                                streetMaterial, windowMaterial);
    corner.position.x += xSign * ( blockDims[0] / 2 + buildingBase[1] 
                                        + blockDims[2] / 2);
    corner.position.z += zSign * ( blockDims[1] / 2 + buildingBase[1] 
                                        + blockDims[2] / 2 );
    corner.rotation.y += rotation;
    
    return corner;
}

/* getCorner: gets a road with a right angle and a building on the inner
    corner
PARAMS: 
        blockDims, [x_0, x_1, z]: the two street lengths for a block (height
            and width of the block), and street width        
        buildingBase, int [x, z, y]: the maximum width/depth and height 
                for a building
        streetMaterial, material: the material for the road
        windowMaterial, material: the material to apply to the windows
RETURNS:
    corner, Object3D: parent of two orthogonal roads with a building
*/
function getCorner(blockDims, buildingBase, streetMaterial, windowMaterial){
    var building;
    var wallMaterial = getMaterial(buildingBase);
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
    building.position.x -= blockDims[2]/2 + building.children[0].scale.x/2;
    building.position.z -= blockDims[2]/2 + building.children[0].scale.z/2;
    corner.add(building);
    return corner; 
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

/*
    BLOCK CREATION
    The following functions relate to block creation
    Includes the functions:
        getBlock()

*/

/* getBlock: gets a street with a road and buildings on either side. Includes
    options for whether to place buildings on the outside of the block, this
    makes it easier to place blocks side by side without worrying about
    overlapping buildings
PARAMS: 
        blockDims, [x_0, x_1, z]: the two street lengths for a block (height
            and width of the block), and street width
        buildingBase, int [x, z, y]: the maximum width/depth and height 
                for a building
        streetMaterial, material: the material for the road
        windowMaterial, material: the material to apply to the windows
        outsides, boolean[]: whether to place a street on the outside
            of the block. Defaults to false for all sides. Each value
            corresponds to sides like so: [north, south, west, east]
RETURNS:
    block, Object3D: a parent to streets with buildings
*/
function getBlock( blockDims, buildingBase, streetMaterial, windowMaterial,
                    outsides = [false, false, false, false] ){
    const block = new THREE.Object3D;
    // street dimensions, [length, width]
    var streetDimsLong = [blockDims[0], blockDims[2]];
    var streetDimsShort = [blockDims[1], blockDims[2]];
   
    /*
        getStreets and position relative to the dimensions of other streets
        the following comments identify cardinal directions for the purposes
        of making their relative positions within a block clear but shouldn't
        be taken too seriously in terms of world position
    */
    // Initialise and position Northern street
    var street = getStreet(streetDimsLong, buildingBase, streetMaterial,
                        windowMaterial, true, outsides[0]);
    
    street.position.z += (streetDimsShort[0]/2 + blockDims[2] / 2 + buildingBase[1]);                
    block.add(street);

    // Initialise and position Southern street
    var street = getStreet(streetDimsLong, buildingBase, streetMaterial,
                    windowMaterial, outsides[1], true);
    street.position.z -= streetDimsShort[0]/2 + blockDims[2] / 2 + buildingBase[1];
    block.add(street);
    
    // Initialise and position Western street
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

    // AUTHOR ASIDE: I'm assuming this is meant to center the block, before
    // placing the corners. But TBH I actually don't remember and positioning
    // buildings on a grid is more complicated then one would think and
    // requires a lot of hacky-code to get working right so this could be
    // one of those lines of hacky-code to get roads and corners positioned
    // in a "good-enough" relation.
    block.position.z += streetDimsShort[0] + buildingBase[1]/2;

    // Get the corners for the block
    var corner = placeCorner(1, 1, 0, blockDims, buildingBase, streetMaterial, 
                            windowMaterial);
    block.add(corner);
    
    corner = placeCorner(-1, 1, -Math.PI/2, blockDims, buildingBase, streetMaterial, 
                            windowMaterial);
    block.add(corner);
    
    corner = placeCorner(-1, -1, -Math.PI, blockDims, buildingBase, streetMaterial, 
                            windowMaterial);
    block.add(corner);
    
    corner = placeCorner(1, -1, Math.PI/2, blockDims, buildingBase, streetMaterial, 
                            windowMaterial);
    block.add(corner);
    
    return block;
}