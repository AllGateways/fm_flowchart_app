var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: 'visualization_source',
    resolve: {
        root: [
            path.join(__dirname, 'src'),
        ]
    },
    output: {
        filename: 'visualization.js',
        libraryTarget: 'amd'
    },
    externals: [
        'splunkjs/mvc',
        'splunkjs/mvc/searchmanager',
        'api/SplunkVisualizationBase',
        'api/SplunkVisualizationUtils'
    ]
};
