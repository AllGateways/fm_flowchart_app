define([
    'jquery',
    'underscore',
    'jointjs'
    ], function(
        $,
        _,
        jointjs
    ) {
        jointjs.dia.Link.define('flowchart.Link', {
            attrs: {
                line: {
                    connection: true,
                    stroke: '#222222',
                    strokeWidth: 0.25,
                    strokeLinejoin: 'round',
                    targetMarker: {
                        'type': 'path',
                        'd': 'M 7 -3 0 0 7 3 z'
                        //'d': 'M 5 -2 0 0 5 2 z'
                    },
		    z: -1
                },
                wrapper: {
                    connection: true,
                    strokeWidth: 5,
                    strokeLinejoin: 'round'
                }
            },
            markup: [{
                tagName: 'path',
                selector: 'wrapper',
                attributes: {
                    'fill': 'none',
                    'cursor': 'pointer',
                    'stroke': 'transparent'
                }
            }, {
                tagName: 'path',
                selector: 'line',
                attributes: {
                    'fill': 'none',
                    //'pointer-events': 'none'
                }
            }]
        });


        jointjs.dia.Element.define('flowchart.Edit', {
            attrs: {
                body: {
                    refWidth: 10,
                    refHeight: 65,
                    strokeWidth: 0,
                    fill: 'lightgray',
                },
            },
            markup: [{
                tagName: 'rect',
                selector: 'body',
            }]
        });

	jointjs.dia.Element.define('flowchart.Rectangle', {
	    attrs: {
	        border: {
                    event: 'element:border:mouseenter',
	            refWidth: 65,
	            refHeight: 65,
		    rx: 5,
		    ry: 5,
	            strokeWidth: 0,
	            fill: '#12b9f4',
		    filter: { name: 'dropShadow', args: { dx: 1, dy: 1, blur: 1, color: '#223322' } },
		    magnet: true,
		    cursor: 'pointer',
	        },
	        body: {
	            refWidth: 56,
	            refHeight: 56,
		    refX: 5,
		    refY: 5,
		    rx: 5,
		    ry: 5,
	            strokeWidth: 0,
	            stroke: '#222222',
	            fill: '#42b9f4',
	        },
	        label: {
		    text: 'name me',
	            textVerticalAnchor: 'middle',
	            textAnchor: 'middle',
	            refX: 33,
	            refY: 33,
	            fontSize: 12,
	            //fill: '#223333',
	            fill: 'white',
                    'cursor': 'default',
	        },
	        data: {
		    text: '',
	            textVerticalAnchor: 'middle',
	            textAnchor: 'middle',
	            refX: 33,
	            refY: 53,
	            fontSize: 10,
	            //fill: '#223333',
	            fill: 'white',
                    'cursor': 'default',
	        },
	    },
    	    markup: [{
                tagName: 'rect',
                selector: 'border',
    	    }, {
                tagName: 'rect',
                selector: 'body',
    	    }, {
                tagName: 'text',
                selector: 'label'
    	    }, {
                tagName: 'text',
                selector: 'data'
            }]
	});


        jointjs.dia.Element.define('flowchart.Diamond', {
            attrs: {
                border: {
                    refWidth: 50,
                    refHeight: 50,
                    rx: 0,
                    ry: 0,
                    strokeWidth: 0,
                    fill: '#12b9f4',
                    filter: { name: 'dropShadow', args: { dx: 1, dy: 0, blur: 1, color: '#223322' } },
                    magnet: true,
		    transform: 'rotate(45)',
                    cursor: 'pointer',
                },
                body: {
                    refWidth: 42,
                    refHeight: 42,
                    refX: 1,
                    refY: 6,
                    rx: 0,
                    ry: 0,
                    strokeWidth: 0,
                    stroke: '#222222',
                    fill: '#42b9f4',
		    transform: 'rotate(45)'
                },
                label: {
                    text: 'name me',
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    refX: 1,
                    refY: 36,
	            fontSize: 12,
                    //fill: '#223333',
                    fill: 'white',
                    'cursor': 'default',
                }
            },
            markup: [{
                tagName: 'rect',
                selector: 'border',
            }, {
                tagName: 'rect',
                selector: 'body',
            }, {
                tagName: 'text',
                selector: 'label'
            }]
        });


        jointjs.dia.Element.define('flowchart.Circle', {
            attrs: {
                border: {
                    r: 25,
                    fill: '#42b9f4',
                    filter: { name: 'dropShadow', args: { dx: 1, dy: 1, blur: 1, color: '#223322' } },
                    magnet: true,
                    cursor: 'pointer',
                },
                body: {
                    r: 21,
                    refCX: 16,
                    refCY: 2,
                    fill: '#42b9f4',
                },
                label: {
                    text: 'name me',
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    refX: 0,
                    refY: 0,
	            fontSize: 12,
                    //fill: '#223333',
                    fill: 'white',
                    'cursor': 'default',
                }
            },
            markup: [{
                tagName: 'circle',
                selector: 'border',
            }, {
                tagName: 'circle',
                selector: 'body',
            }, {
                tagName: 'text',
                selector: 'label'
            }]
        });

        jointjs.dia.Element.define('flowchart.Box', {
            attrs: {
                border: {
                    connection: true,
                    strokeWidth: 1,
                    stroke: 'darkgray',
                    cursor: 'default',
                },
                topleft: {
                    ref: 'border',
                    event: 'topleft:pointerdown', 
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: 0,
                    refY: 0,
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-45)',
                    display: 'none',
                },
                left: {
                    ref: 'border',
                    event: 'topleft:pointerdown', 
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: 0,
                    refY: "+50%",
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-90)',
                    display: 'none',
                },
                bottomleft: {
                    ref: 'border',
                    event: 'topleft:pointerdown', 
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: 0,
                    refY: "+100%",
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-135)',
                    display: 'none',
                },
                bottom: {
                    ref: 'border',
                    event: 'topleft:pointerdown', 
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: "+50%",
                    refY: "+100%",
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-180)',
                    display: 'none',
                },
                bottomright: {
                    ref: 'border',
                    event: 'topleft:pointerdown', 
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: "+100%",
                    refY: "+100%",
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-225)',
                    display: 'none',
                },
                right: {
                    ref: 'border',
                    event: 'topleft:pointerdown', 
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: "+100%",
                    refY: "+50%",
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-270)',
                    display: 'none',
                },
                topright: {
                    ref: 'border',
                    event: 'topleft:pointerdown', 
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: "+100%",
                    refY: 0,
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-315)',
                    display: 'none',
                },
                top: {
                    ref: 'border',
                    event: 'topleft:pointerdown', 
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: "+50%",
                    refY: 0,
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(0)',
                    display: 'none',
                },
                topleft: {
                    ref: 'border',
                    event: 'topleft:pointerdown', 
                    connection: true,
                    strokeWidth: 1,
                    fill: 'orange',
                    cursor: 'default',
                    refX: 0,
                    refY: 0,
                    d: 'M -4 0 L 0 -6 L 4 0 z',
                    transform: 'rotate(-45)',
                    display: 'none',
                },
                label: {
                    text: 'name me',
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    ref: 'border',
                    refX: 20,
                    refY: 20,
                    fontSize: 12,
                    fill: 'darkgray',
                    'cursor': 'default',
                },
            },
            markup: [{
                tagName: 'path',
                selector: 'border',
            }, {
                tagName: 'path',
                selector: 'topleft',
            }, {
                tagName: 'path',
                selector: 'left',
            }, {
                tagName: 'path',
                selector: 'bottomleft',
            }, {
                tagName: 'path',
                selector: 'bottom',
            }, {
                tagName: 'path',
                selector: 'bottomright',
            }, {
                tagName: 'path',
                selector: 'right',
            }, {
                tagName: 'path',
                selector: 'topright',
            }, {
                tagName: 'path',
                selector: 'top',
            }, {
                tagName: 'text',
                selector: 'label'
            }]
        });
    }
)
