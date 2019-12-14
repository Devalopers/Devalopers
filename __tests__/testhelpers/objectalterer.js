function shallowCopy(object){
    return Object.assign({},object)
}

module.exports = class {

    constructor(object){
        this.object = object
    }

    alterObjectWithChanges(alterationObject){
        let duplicateObject = shallowCopy(this.object);
        for(let attribute in alterationObject)
            duplicateObject[attribute] = alterationObject[attribute]
        return duplicateObject
    }

}
