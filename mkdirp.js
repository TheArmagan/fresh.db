let fs = require("fs");
let path = require("path");

// From: https://stackoverflow.com/a/41970204/11949394
function mkdirp(pathToCreate) {
    return pathToCreate
        .split("/")
        .reduce((prevPath, folder) => {
            const currentPath = path.join(prevPath, folder);
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath);
            }
            return currentPath;
        }, '');
}

module.exports = mkdirp;