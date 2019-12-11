/*
    TO DO:
        + Comment Code and remove anything commented out
*/
var fileList = ["BRICK_00","BRICK_01", "BRICK_02", "BRICK_02a", 
    "BRICK_02b", "BRICK_02c", "BRICK_03", "CONCRETE_00", "CONCRETE_01",
    "CONCRETE_01a", "CONCRETE_02", "CONCRETE_02a", "CONCRETE_02b", 
    "CONCRETE_02c", "WOOD_00", "WOOD_00a", "WOOD_00b", "WOOD_00c"];
var loadedTexs = {};
var material = new THREE.MeshPhongMaterial({color : 0xee00ee});
const loader = new THREE.TextureLoader();
const alphaCheck = new RegExp('[\d\da-z]$');

function getMaterial(buildingBase){
    const index = Math.floor(Math.random() * fileList.length);
    const texID = fileList[index];
    if (!(texID in loadedTexs)){
        loadedTexs[texID] = loadMaterial(buildingBase, texID);
    }
    return loadedTexs[texID];
}

function loadMaterial(buildingBase, texID){
    const diffuseID = "textures/".concat(texID.concat("_diffuse.jpg"));
    const diffuseTex = loader.load(diffuseID);
    if (alphaCheck.test(texID)){
        texID = texID.substring(0, texID.length - 1);
    }
    const bumpID = "textures/".concat(texID.concat("_bump.jpg"));
    const bumpTex = loader.load(bumpID);
    const specID = "textures/".concat(texID.concat("_specular.jpg"));
    const specTex = loader.load(specID);
    diffuseTex.wrapS = THREE.RepeatWrapping;
    diffuseTex.wrapT = THREE.RepeatWrapping;
    //diffuseTex.repeat.x = buildingWidth;
    return material = new THREE.MeshPhongMaterial({
                            map : diffuseTex,
                            bumpMap : bumpTex,
                            bumpScale : 0.05,
                            shininess : 10,
                            specularMap : specTex});
    
}