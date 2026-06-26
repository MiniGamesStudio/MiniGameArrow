


loadCC();


function loadCC() {
    require('./web-adapter.5fadd.js');


    // Polyfills bundle.
    require("src/polyfills.bundle.43263.js");


    // SystemJS support.
    require("src/system.bundle.f45da.js");

    // Adapt for IOS, swap if opposite
    if (canvas){
        var _w = canvas.width;
        var _h = canvas.height;
        if (screen.width < screen.height) {
            if (canvas.width > canvas.height) {
                _w = canvas.height;
                _h = canvas.width;
            }
        } else {
            if (canvas.width < canvas.height) {
                _w = canvas.height;
                _h = canvas.width;
            }
        }
        canvas.width = _w;
        canvas.height = _h;
    }

    // Adjust initial canvas size
    if (canvas && window.devicePixelRatio >= 2) {canvas.width *= 2; canvas.height *= 2;}

    const importMap = require("src/import-map.b7ae5.js").default;
    System.warmup({
        importMap,
        importMapUrl: 'src/import-map.b7ae5.js',
        defaultHandler: (urlNoSchema) => {
            require('.' + urlNoSchema);
        },
        handlers: {
            'plugin:': (urlNoSchema) => {
                typeof requirePlugin === 'function' ? requirePlugin(urlNoSchema) : require(urlNoSchema);
            },
            'project:': (urlNoSchema) => {
                require(urlNoSchema);
            },
        },
    });

    System.import('./application.a954f.js').then(({ Application }) => {
        return new Application();
    }).then((application) => {
        return onApplicationCreated(application);
    }).catch((err) => {
        console.error(err);
    });

    function onApplicationCreated(application) {
        return System.import('cc').then((cc) => {
            require('./engine-adapter.1fde9.js');
            return application.init(cc);
        }).then(() => { return application.start(); });
    }

}
