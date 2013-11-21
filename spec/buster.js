var config = module.exports;

config["Lib"] = {
    environment: "node",        // or "node"
    rootPath: "../",
    sources: [
        "lib/**/*.js"      // Glob patterns supported
    ],
    tests: [
        "spec/*-test.js"
    ]
};
