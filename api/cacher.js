const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { reject } = require('lodash');
const { resolve } = require('path');
const flatted = require('flatted');


const Cacher = {
    CACHE_FOLDER : "./api/cache/",

    /**
     * 
     * @param {*} baseUrl 
     * @param {*} path 
     */
    get : async (url)  => {
        return new Promise(async (resolve,reject) => {
            try {
                let path = Cacher.getPath(url);
                let res;
                if(Cacher.cached(path)){
                    res = Cacher.getFromCache(path);
                }else {
                    res = await axios.get(url);
                    await Cacher.putInCache(path, res);
                }
                resolve(res);
            } catch (err) {
                reject(err);
            }
        });
    },

    cached : (path) => {
        return fs.existsSync(path);
    },

    getFromCache : (path) => {
        let tmp = fs.readFileSync(path);
        return flatted.parse(tmp);
    },

    putInCache : async (filePath, obj) => {
        return new Promise(async (resolve, reject) => {
            try {
                let fullPath = path.resolve(filePath);
                let folder = path.dirname(fullPath);
                let pathExist = await fs.pathExists(folder);
                if(!pathExist){
                    await fs.promises.mkdir(folder, {recursive: true});
                }
                let data = flatted.stringify(obj);
                await fs.promises.writeFile(filePath, data);
                resolve();
            }
            catch(err) {
                reject(err);
            }
        })        
    },

    getPath : (url) => {
        let urlTokens = url.split('/');
        let path = "";
        urlTokens.forEach(t => {
            if(t == "") return;
            if(path != "") path+= "/";
            let parsed = t.replace("http:","");
            parsed = parsed.replace("https:", "");
            parsed = parsed.replace("?","/");
            parsed = parsed.replace(/:/g, "");
            path += parsed;
        });
        return Cacher.CACHE_FOLDER+path+".json";
    }
}



module.exports = Cacher;