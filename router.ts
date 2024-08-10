const isObject  = require('lodash/isObject');
const forEach  = require('lodash/forEach');
const has  = require('lodash/has');
const isFunction  = require('lodash/isFunction');
const isArray  = require('lodash/isArray');
const path      = require('path');
const importDir = require('directory-import');
const { directoryImport } = require('directory-import');
const { Server }   = require('./server');

const schemas = directoryImport('./schemas', 'sync');

const routesDir = './routes';

directoryImport(routesDir, 'sync', (routeName: string, routePath: string, routeMethods: string) => {
    const isModule = path.extname(routePath) === '.js';

    if (!isModule) return console.warn(`File ${routePath} is not a route`);
    if (!isObject(routeMethods)) return console.warn(`Expected an object in the file: ${routePath}`);

    const cleanUPedPath = routeName === 'index' 
    ? routePath.slice(routesDir.length, routePath.length - 'index.ts'.length)
    : routePath.slice(routesDir.length, routePath.length - '.ts'.length);

    forEach(routeMethods, (methodArgs: Array<any>, methodName: string) => {
        const schema = has(schemas, `${routeName}.${methodName}`)
        ? schemas[routeName][methodName]
        : {};

        if (isFunction(methodArgs)) Server[methodName](cleanUPedPath, { schema }, routeMethods);

        else if (isArray) {
            const [options] = methodArgs;

            if(!options.schema) options.schema = schema;

            Server[methodName](cleanUPedPath, ...methodArgs);
        }

        else return console.error(`Route ${routePath} has invalid arguments`);
    });
});