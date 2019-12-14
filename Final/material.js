/*
    ======================
    Material
    COS 452, Fall 2019
    Final Project
    Author: Zachary Rohman
    ======================

    Collection of scripts and data for handling image textures and material.
    Includes functions for initialising and returning random materials,
    as well as data structures for storing already loaded materials (to avoid
    loading multiple materials for the same image texture set), and for getting
    image file names (it's too much work to get file lists at runtime via 
    javascript so it's easier to just store the list right here in material.js)
*/

/*  
    Declare and initialise fileList a list of possible textures to load.
    Each string value identifies a collection of diffuse/bump/specular textures
    with the following formats for some array item "StringID":
        StringID_diffuse.jpg, String_bump.jpg, StringID_specular.jpg
    Strings identifying specific file names are constructed in loadMaterial()
    
    Strings with alpha characters following their numeric ID indicate a texture
    set with multiple diffuse options for the corresponding bump and specular
    maps. This allows us to store a single bump/spec pair for more than one
    diffuse texture (as opposed to redundant bump/spec image pairs for each
    unique diffuse image). The regular expression alphaCheck is used to check 
    for this string pattern in loadMaterial() which will then strip the last 
    character from the string. Consequently, no texture set can have more than 
    26 alternative diffuse image textures.
*/
var fileList = ["BRICK_00","BRICK_01", "BRICK_02", "BRICK_02a", 
    "BRICK_02b", "BRICK_02c", "BRICK_03", "CONCRETE_00", "CONCRETE_01",
    "CONCRETE_01a", "CONCRETE_02", "CONCRETE_02a", "CONCRETE_02b", 
    "CONCRETE_02c", "WOOD_00", "WOOD_00a", "WOOD_00b", "WOOD_00c"];
const alphaCheck = new RegExp('[\d\da-z]$');

/*  
    Declare and initialise a hashmap loadedTexs to track and store materials
    From some Material created from the texture set for StringID, the material
    is stored as:
        {"StringID" : Material}
    Materials are added to loadedTexs in getMaterial(). This allows us to just
    store a material and reuse it where necessary as opposed to creating and
    storing multiple materials for a single image texture set
*/
var loadedTexs = {};

// Declare and initialise a material with default parameters
var material = new THREE.MeshPhongMaterial({color : 0xee00ee});

// Declare and initialise a texture loader
const loader = new THREE.TextureLoader();

/*
    getMaterial: helper function to get a random material for a building.
    Gets a random index for fileList and checks for the corresponding material
    in loadedTexs, if it is not already present then the material is created
    by loadMaterial() and stored in loadedTexs. getMaterial returns
    the corresponding random material from loadedTexs
    PARAMS: n/a
    RETURNS: loadedTexs[texID], material: the randomly selected material from
        fileList
*/
function getMaterial(){
    // get random index value from within the range of possible
    // values for fileList
    const index = Math.floor(Math.random() * fileList.length);
    // assign corresponding fileList value to texID
    const texID = fileList[index];
    // if texID is not in loadedTexs then create the material
    // and load it into loaded texs
    if (!(texID in loadedTexs)){
        loadedTexs[texID] = loadMaterial(texID);
    }
    return loadedTexs[texID];
}
/*
    loadMaterial: initialises and returns a material using image textures
    associated with texID. Note that the returned material uses the default
    wrapping mode for its image textures.
    PARAMS: texID, string: a string identified for a texture set
    RETURNS: material, material: a MeshPhongMaterial initialized with 
        the texID image set
*/
function loadMaterial(texID){
    // Initialise the string ID (diffuseID) for loading the diffuse
    // texture (diffuseTex)
    const diffuseID = "textures/".concat(texID.concat("_diffuse.jpg"));
    const diffuseTex = loader.load(diffuseID);

    // Check for alpha characters in texID indicating an alternative diffuse
    // texture and strip away the trailing alpha character if it's there
    if (alphaCheck.test(texID)){
        texID = texID.substring(0, texID.length - 1);
    }
    
    // Initialise the string ID (bump/specID) for loading the bump/specular
    // texture (bump/specTex)
    const bumpID = "textures/".concat(texID.concat("_bump.jpg"));
    const bumpTex = loader.load(bumpID);
    const specID = "textures/".concat(texID.concat("_specular.jpg"));
    const specTex = loader.load(specID);
    
    // assign new material to material and return
    return material = new THREE.MeshPhongMaterial({
                            map : diffuseTex,
                            bumpMap : bumpTex,
                            bumpScale : 0.05,
                            shininess : 10,
                            specularMap : specTex});
}