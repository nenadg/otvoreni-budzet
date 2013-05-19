exports.index = function(req, res){
    // scripts
    var styles = '<link href="/css/sumo.css" rel="stylesheet" type="text/css" media="screen"/>';
    var scripts = '<script src="/js/d3.v3.min.js"></script>\n\
    <script src="/js/oplib.js"></script>\n\
    <script src="/js/graph.js"></script>\n\
    <script src="/js/load.js"></script>';
    
    res.render('index', { 
                title: 'Budžetski podaci',
                style: styles, 
                script: scripts });
};


