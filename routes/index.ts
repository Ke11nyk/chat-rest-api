async function pingServer() {
    return 'Hello World!';
}

module.exports = {
    get: pingServer,
};