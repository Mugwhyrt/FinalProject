/**
Camera Controls - Assignment 4
===============
Functions for standard first person camera controls
COS 452, Fall 2019
Zachary Rohman
**/

// flag for current camera perspective( 0 for perspective, 1 for ortho);
var cameraPerspective = 0;
var orthoDenominator = 750;


var onKeyDown = function ( event ){
    switch (event.keyCode){
        // Camera Rotation
        case 38: // up
            rotateUp = true;
            break;
        case 37: // left
            rotateLeft = true;
            break;
        case 40: // down
            rotateDown = true;
            break;
        case 39: // right
            rotateRight = true;
            break;
       // Camera Movement                         
       case 87: // w
            moveForward = true;
            break;
        case 65: // a
            moveLeft = true;
            break;
        case 83: // s
            moveBackward = true;
            break;
        case 68: // d
            moveRight = true;
            break;
        case 69://e
            moveUp = true;
            break;
        case 81: //q
            moveDown = true;
            break;
        // Switch Camera Projection Type
        case 80: //p
            // copy camera's position and rotation
            // so that it can be restored
            oldPos = camera.position.clone();
            oldRot = camera.rotation.clone();
            // Switch to Orthographic Camera
            if (cameraPerspective == 0){
                cameraPerspective = 1;
                camera = new THREE.OrthographicCamera( 
                                    window.innerWidth / -orthoDenominator, 
                                    window.innerWidth / orthoDenominator, 
                                    window.innerHeight / orthoDenominator, 
                                    window.innerHeight / -orthoDenominator, -1, 100 );
            // Switch to Perspective Camera
            } else{
                cameraPerspective = 0;
                camera = new THREE.PerspectiveCamera(60, 
                                                    window.innerWidth / 
                                                    window.innerHeight,
                                                    0.1,
                                                    1000);
            }
            // Set camera rotation order to Yaw/Pitch/Roll
            camera.rotation.order = 'YXZ';
            // Re-initialise camera's rotation and position to
            // original values
            camera.position.set(oldPos.x, oldPos.y, oldPos.z);
            camera.rotation.set(oldRot.x, oldRot.y, oldRot.z);
        break;
            
    }
}
                    
var onKeyUp = function ( event ){
    switch (event.keyCode){
        // Camera Rotation
        case 38: // up
            rotateUp = false;
            break;
        case 37: // left
            rotateLeft = false;
            break;
        case 40: // down
            rotateDown = false;
            break;
        case 39: // right
            rotateRight = false;
            break;
            
        // Camera Translation                        
        case 87: // w
            moveForward = false;
            break;
        case 65: // a
            moveLeft = false;
            break;
        case 83: // s
            moveBackward = false;
            break;
        case 68: // d
            moveRight = false;
            break;
        case 69:
            moveUp = false;
            break;
        case 81: //q
            moveDown = false;
            break;
    }
}


// applyCameraTransforms
// applies camera transforms based on boolean values
// for movement and rotation (ie, apply if true)
function applyCameraTransforms(){
    // apply camera transformations
    // Calculate the x and y positions on a 
    // unit circle from the current camera rotation
    moveCos = Math.cos(camera.rotation.y);
    moveSin = Math.sin(camera.rotation.y);
    // Move camera along axes according to the product
    // of the move rate and the direction to move
    // along the x or z axis according to moveCos
    // or moveSin
    // Note that moveCos affects the Z axis for
    // forward/back movement, but affects the
    // x axis for left/right movement (and vice versa
    // for moveSin)
    if (moveForward){
        camera.position.z -= moveRate * moveCos;
        camera.position.x -= moveRate * moveSin;
    }else if(moveBackward){
        camera.position.z += moveRate * moveCos;
        camera.position.x += moveRate * moveSin;
    }else if(moveLeft){
        camera.position.z += moveRate * moveSin;
        camera.position.x -= moveRate * moveCos;
    }else if(moveRight){
        camera.position.z -= moveRate * moveSin;
        camera.position.x += moveRate * moveCos;
    }else if(moveUp){
        camera.position.y += moveRate;
    }else if(moveDown){
        camera.position.y -= moveRate;
    }
    // Camera Rotation
    if(rotateUp){
        camera.rotation.x += turnRate;
    }else if(rotateDown){
        camera.rotation.x -= turnRate;
    }else if(rotateLeft){
        camera.rotation.y += turnRate;
    }else if(rotateRight){
        camera.rotation.y -= turnRate;
    }
}
// undoCameraTranslation
// applies camera translations based on boolean values
// for movement and rotation (ie, apply if true)
// Similar to applyCameraTransforms, except direction of
// translation is flipped, and there is no rotation applied
function undoCameraTranslation(){
    moveCos = Math.cos(camera.rotation.y);
    moveSin = Math.sin(camera.rotation.y);
    // Move camera along axes according to the product
    // of the move rate and the direction to move
    // along the x or z axis according to moveCos
    // or moveSin
    // Note that moveCos affects the Z axis for
    // forward/back movement, but affects the
    // x axis for left/right movement (and vice versa
    // for moveSin)
    var mult = 1;
    if (moveForward){
        camera.position.z += mult * moveRate * moveCos;
        camera.position.x += mult * moveRate * moveSin;
    }else if(moveBackward){
        camera.position.z -= mult * moveRate * moveCos;
        camera.position.x -= mult * moveRate * moveSin;
    }else if(moveLeft){
        camera.position.z -= mult * moveRate * moveSin;
        camera.position.x += mult * moveRate * moveCos;
    }else if(moveRight){
        camera.position.z += mult * moveRate * moveSin;
        camera.position.x -= mult * moveRate * moveCos;
    }
}

// checkCameraBoundary
// checks if camera is out of bounds
// calls undoCameraTranslation() if it is
function checkCameraBoundary(box){
        var camBox = 
            camera.position.clone();
        camSize = 0.5;
        if (!( box.min.x < (camBox.x - camSize)
            && box.max.x > (camBox.x + camSize)
            && box.min.y < (camBox.y - camSize)
            && box.max.y > (camBox.y + camSize)
            && box.min.z < (camBox.z - camSize)
            && box.max.z > (camBox.z + camSize) )
           )
        {
           undoCameraTranslation();
        }
    }
