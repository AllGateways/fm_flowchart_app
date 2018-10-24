define([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/searchmanager',
    'api/SplunkVisualizationBase',
    'api/SplunkVisualizationUtils',
    'jointjs',
    'flowchart_utils',
    'modalView'
    ], 
    function(
        $,
        _,
        mvc,
	SearchManager,
        SplunkVisualizationBase,
        SplunkVisualizationUtils,
        jointjs,
        flowchart_utils,
        ModalView
    ){
        const GRIDSIZE = 10;
        var clicked_link = null;
        var edit_mode = 0;
        var graph;
        var paper;
        var stencilGraph;
        var stencilPaper;
        var panel_id;

        var search = new SearchManager({
             id: "flow_search",
             cache: false,
             earliest_time: "-1m@m",
             latest_time: "now"
        });

        var update  = new SearchManager({
             id: "flow_update",
             cache: false,
             earliest_time: "-1m@m",
             latest_time: "now"
        });

        return SplunkVisualizationBase.extend({
            initialize: function() {
                this.$el = $(this.el);
                chart = document.createElement("div");
                chart.className = "splunk-flowchart";
                edit = document.createElement("div");
                edit.className = "splunk-flowchart-stencil";
                this.el.appendChild(edit);
                this.el.appendChild(chart);

	        panel_id = $('.dashboard-cell.dashboard-layout-panel').attr('id');

                initPaper(this.el.getElementsByClassName('splunk-flowchart'));
                initStencilPaper(this.el.getElementsByClassName('splunk-flowchart-stencil'));

                loadDiagram(panel_id, graph, paper);

		graph.on('add', function(link) {
                    if (link.attributes.type === 'flowchart.Link') {
                        appendLinkLabels(link);
                    }
                })

                graph.on('change', function () {
                    if(edit_mode == 1) {
                        r = stencilGraph.getCells()[0]; 
                        r.attr('body/fill', 'gray');
                    }
                })

                paper.on('link:pointerclick', function(linkView, evt, x, y) {
                    if(edit_mode == 0)
                        return;

                    showLinkTool(linkView);
                });

                paper.on('blank:pointerclick', function(evt, x, y) {
                    if(edit_mode == 0)
                        return;
 
                    removeLinkTool();
                });


                paper.on('element:pointerdblclick', function(elementView, evt, x, y) {
                    if(edit_mode == 0)
                        return;

                    removeNode(elementView.model);
                });

                paper.on('link:contextmenu', function(linkView, evt, x, y) {
                    attachLinkFlowId(linkView.model);
                });

	        paper.on('element:contextmenu', function(elemView, evt, x, y) { 
                    attachElementFlowId(elemView.model);
    	        });

                stencilPaper.on('cell:pointerdown', function(cellView, e, x, y) {
                    if(cellView.model.attributes.type === 'flowchart.Edit') {
                        setEditMode(cellView);
                    } else {
                        createNode(cellView, e, x, y);
                    }
                });
            },

            getInitialDataParams: function() {
                return ({
                    outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                    count: 10000
                });
            },
  
            updateView: function(data, config) {
                if (!data || !data.meta) {
                    return;
                }

                if (edit_mode == 1) {
        _.each(graph.getLinks(), function(link) {
            if (link.attributes['flow-id']) {
                link.label(0, {attrs: {source_value: {fill: 'black'}}});
                link.label(0, {attrs: {source_bg: {stroke: '#222222'}}});
                link.label(0, {attrs: {source_value: {text: link.attributes['flow-id'] + '_source'}}});
                link.label(1, {attrs: {target_value: {fill: 'black'}}});
                link.label(1, {attrs: {target_bg: {stroke: '#222222'}}});
                link.label(1, {attrs: {target_value: {text: link.attributes['flow-id'] + '_target'}}});
            }
        })
                    return;
                }

                if (data.meta.done) {
                    for (i=0; i<data.fields.length; i++) {
                        field = data.fields[i].name;
                        if (field.endsWith('_source')) {
                            field = field.substr(0, field.length - 7);
                            link = getLinkById(field);
                            if (link != null) {
                                value = data.rows[0][i];
                                setLinkSourceValue(link, value);
                            };
                        } else if (field.endsWith('_target')) {
                            field = field.substr(0, field.length - 7);
                            link = getLinkById(field);
                            if (link != null) {
                                value = data.rows[0][i];
                                setLinkTargetValue(link, value);
                            };
                        } else if (field.endsWith('_link')) {
                            field = field.substr(0, field.length - 5);
                            link = getLinkById(field);
                            if (link != null) {
                                value = data.rows[0][i];
                                setLinkValue(link, value);
                            };
                        } else {
                            element = getElementById(field);
                            if (element != null) {
                                value = data.rows[0][i];
                                setElementValue(element, value);
                            }
                        }
                    }
                }
            }
    });

    function showLinkTool(linkView) {
        var verticesTool = new jointjs.linkTools.Vertices();
        var segmentsTool = new jointjs.linkTools.Segments();
        var sourceArrowheadTool = new jointjs.linkTools.SourceArrowhead();
        var targetArrowheadTool = new jointjs.linkTools.TargetArrowhead();
        var sourceAnchorTool = new jointjs.linkTools.SourceAnchor();
        var targetAnchorTool = new jointjs.linkTools.TargetAnchor();
        var boundaryTool = new jointjs.linkTools.Boundary();
        var removeButton = new jointjs.linkTools.Remove();

        tvs = new jointjs.dia.ToolsView({
            tools: [
                verticesTool,
                segmentsTool,
                sourceArrowheadTool,
                targetArrowheadTool,
                sourceAnchorTool,
                targetAnchorTool,
                //boundaryTool,
                removeButton
            ]
        })
        linkView.addTools(tvs);
        linkView.showTools();
        if(clicked_link != null) {
            clicked_link.hideTools();
            clicked_link.removeTools();
            clicked_link = null;
        }
        clicked_link = linkView;
    }

    function removeLinkTool() {
        if(clicked_link != null) {
            clicked_link.hideTools();
            clicked_link.removeTools();
            clicked_link = null;
        }
    }

    function appendLinkLabels(link) {
        len = link.labels();
        for (i; i < len; i++) {
            link.removeLabel(i);
        }

        link.appendLabel({
            markup: [
                {
                    tagName: 'rect',
                    selector: 'source_bg'
                }, {
                    tagName: 'text',
                    selector: 'source_value'
                }
            ],
            attrs: {
                source_bg: {
                    event: 'source:change',
                    opacity: 0.0,
                    stroke: '#222222',
                    strokeWidth: 0,
                    ref: 'source_value',
                    refWidth: +6,
                    refHeight: +2,
                    refX: -3,
                    refY: -1,
                    rx: 2,
                    ry: 2,
                    fill: 'white',
                },
                source_value: {
                    text: '',
                    fill: '#000000',
                    fontSize: 10,
                    textAnchor: 'middle',
                    yAlignment: 'middle',
                },
            },
            position: {
                distance: 18,
            }
        });
        link.appendLabel({
            markup: [
                {
                    tagName: 'rect',
                    selector: 'target_bg'
                }, {
                    tagName: 'text',
                    selector: 'target_value'
                }
            ],
            attrs: {
                filter: 'unset',
                target_bg: {
                    opacity: 0.0,
                    stroke: '#222222',
                    strokeWidth: 0,
                    ref: 'target_value',
                    refWidth: +6,
                    refHeight: +2, refX: -3,
                    refY: -1,
                    rx: 2,
                    ry: 2,
                    fill: 'white',
                },
                target_value: {
                    text: '',
                    fill: '#000000',
                    fontSize: 10,
                    textAnchor: 'middle',
                    yAlignment: 'middle',
                },
            },
            position: {
                distance: -25,
            }
        });
    }

    function loadDiagram(panel_id, graph, paper) {
        search_str = '|inputlookup flowchart_kv|eval k=_key|where k="' + panel_id + '"|table defs';
        search.set({search:  search_str});
        search.startSearch();
        results = search.data('results');
        results.on("data", () => {
            if (results.hasData()) {
                graph_str = results.data().rows[0][0];
                graph.fromJSON(JSON.parse(graph_str));
                _.each(graph.getCells(), function(cell) {
                    cell.findView(paper).options.interactive = false;
                })
            }
        });
    }

    function saveDiagram(graph) {
        flow_str = JSON.stringify(graph.toJSON());
        flow_str = flow_str.replace(/\"/g, "\\\"");
        //var update = new SearchManager({
             //id: "flow_update",
             //earliest_time: "-24h@h",
             //latest_time: "now",
             //search: '|makeresults| eval id=\"' + panel_id + '\"|eval _key=id|eval defs=\"' + flow_str + '\"|outputlookup flowchart_kv',
        //});
        search_str = '|makeresults| eval id=\"' + panel_id + '\"|eval _key=id|eval defs=\"' + flow_str + '\"|outputlookup flowchart_kv';
        update.set({search:  search_str});
        update.startSearch();
        update.on("search:done", function(state, job) {
            ;
        });
    }

    function initPaper(el) {
        graph = new jointjs.dia.Graph;
        paper = new jointjs.dia.Paper({
            background: {
                color: '#ffffff'
            },
            el: el,
            width: '100%',
            gridSize: GRIDSIZE,
            defaultLink: new jointjs.shapes.flowchart.Link,
            linkPinning: false,
            model: graph,
            //interactive: false,
            defaultConnector: {
                name: 'rounded',
                args: {
                    radius: 10
                }
            }
        });
    }

    function initStencilPaper(el) {
        stencilGraph = new jointjs.dia.Graph;
        stencilPaper = new jointjs.dia.Paper({
            background: {
                color: '#ffffff'
            },
            opacity: 0.2,
            el: el,
            height: 40,
            width: '100%',
            model: stencilGraph,
            interactive: false
        });

        var r1 = new jointjs.shapes.flowchart.Edit({
            position: {
                x: 5,
                y: 5
            }
        });

        stencilGraph.addCells([r1]);
        stencilPaper.scale(0.5);
    }

    function setEditMode(cellView) {
        if (edit_mode == 0) {
            var r2 = new jointjs.shapes.flowchart.Rectangle({
                position: {
                    x: 35,
                    y: 5
                }
            });

            var r3 = new jointjs.shapes.flowchart.Diamond({
                position: {
                    x: 165,
                    y: 3
                }
            });

            var r4 = new jointjs.shapes.flowchart.Circle({
                position: {
                    x: 255,
                    y: 41
                }
            });
            stencilGraph.addCells([r2, r3, r4]);
            _.each(graph.getCells(), function(cell) {
                cell.findView(paper).options.interactive = true;
            })

            edit_mode = 1;
        } else {
            r2 = stencilGraph.getCells()[1];
            r3 = stencilGraph.getCells()[2];
            r4 = stencilGraph.getCells()[3];
            r2.remove();
            r3.remove();
            r4.remove();
            cellView.model.attr('body/fill', 'lightgray');
            _.each(graph.getElements(), function(cell) {
                cell.findView(paper).options.interactive = false;
            })

            saveDiagram(graph);

            edit_mode = 0;
        }
    }

    function removeNode(elem) {
        ret = confirm("Delete element?");
        if (ret) 
           elem.remove();
    }

    function createNode(cellView, e, x, y) {
        $('body').append('<div id="flyPaper" style="position:fixed;z-index:100;opacity:.7;pointer-event:none;"></div>');
        var flyGraph = new jointjs.dia.Graph,
            flyPaper = new jointjs.dia.Paper({
            gridSize: GRIDSIZE,
            el: $('#flyPaper'),
            model: flyGraph,
            interactive: false
        }),
                
        flyShape = cellView.model.clone(),
            pos = cellView.model.position(),
            offset = { 
                x: x - pos.x,
                y: y - pos.y
        };

        flyShape.position(0, 0);

        flyGraph.addCell(flyShape);

        $("#flyPaper").offset({
            left: GRIDSIZE * Math.round((e.pageX - offset.x) / GRIDSIZE),
            top: GRIDSIZE * Math.round((e.pageY - offset.y) / GRIDSIZE)
        });

        $('body').on('mousemove.fly', function(e) {
            $("#flyPaper").offset({
                left: GRIDSIZE * Math.round((e.pageX - offset.x) / GRIDSIZE),
                top: GRIDSIZE * Math.round((e.pageY - offset.y) / GRIDSIZE)
            });
        });

        $('body').on('mouseup.fly', function(e) {
            var x = e.pageX,
            y = e.pageY,
            target = paper.$el.offset();

            // Dropped over paper ?
            if (x > target.left && x < target.left + paper.$el.width() && y > target.top && y < target.top + paper.$el.height()) {
                var s = flyShape.clone();
                s.position(x - target.left - offset.x, y - target.top - offset.y);
                graph.addCell(s);
            }

            $('body').off('mousemove.fly').off('mouseup.fly');

            flyShape.remove();
            $('#flyPaper').remove();
        });
    }

    function attachElementFlowId(element) {
        if(edit_mode == 0)
            return;

//var modal = new ModalView({ title : 'An Amazing Modal Title' });
//modal.show(element.el);

        label = prompt('Update label');
        element.set('flow-id', label);
        setElementTag(element, label);
    }

    function attachLinkFlowId(link) {
        if(edit_mode == 0)
            return;

        var label = prompt('Update label');
        link.set('flow-id', label);
        setLinkTargetTag(link, label + '_target');
        setLinkSourceTag(link, label + '_source');
    }

    function setElementTag(element, value) {
        if (element == null) 
            return;

        element.attr('label/text', value);
    }

    function setLinkTargetTag(link, value) {
        if (link == null) 
            return;

	link.label(1, {attrs: {target_value: {text: value}}})
    }

    function setLinkSourceTag(link, value) {
        if (link == null) 
            return;

	link.label(0, {attrs: {source_value: {text: value}}})
    }

    function getElementById(id) {
        if (graph == null)
            return null;

        ret = null;
        _.each(graph.getElements(), function(elem) {
            if (elem.attributes['flow-id'] && elem.attributes['flow-id']==id) {
                ret = elem;
            }
        })

        return ret;
    }

    function getLinkById(id) {
        if (graph == null)
            return null;

        ret = null;
        _.each(graph.getLinks(), function(link) {
            if (link.attributes['flow-id'] && link.attributes['flow-id']==id) {
                ret = link;
            }
        })
 
        return ret;
    }

    function setLinkValue(link, value) {
        color = getColor(value);
        link.attr('line/stroke', color);
        link.attr('line/strokeWidth', '0.5');
    }

    function setElementValue(elem, value) {
        color = getColor(value);
        elem.attr('body/fill', color);
        elem.attr('border/fill', color);
        elem.attr('data/text', getData(value));
    }

    function guidGenerator() {
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    function setLinkSourceValue(link, value) {
        if (edit_mode == 1) {
            color = 'black';
            value = link.attributes['flow-id'] + '_source';
        } else {
           color = getColor(value);
        }

        link.label(0, {attrs: {source_value: {text: value}}});
        link.label(0, {attrs: {source_value: {fill: color}}});
    }

    function setLinkTargetValue(link, value) {
        if (edit_mode == 1) {
            color = 'black';
            value = link.attributes['flow-id'] + '_target';
        } else {
           color = getColor(value);
        }

        link.label(1, {attrs: {target_value: {text: value}}});
        link.label(1, {attrs: {target_value: {fill: color}}});
    }

    function getData(value) {
        return value.split(',')[0];
    }

    function getColor(value) {
        l = value.split(',')[1];
        h = value.split(',')[2];
        v = value.split(',')[0];
        if (v < l) {
            return 'red';
        } else if (v < h) {
            return 'orange';
        } else {
            return '#42b9f4';
        }
    }

    function setLinkSourceValue(link, value) {
        if (edit_mode == 1) {
            color = 'black';
            value = link.attributes['flow-id'] + '_source';
        } else {
           color = getColor(value);
        }

        link.label(0, {attrs: {source_value: {text: getData(value)}}});
        link.label(0, {attrs: {source_value: {fill: color}}});
        link.label(0, {attrs: {source_bg: {stroke: color}}});
        link.label(0, {attrs: {source_bg: {strokeWidth: '0.5'}}});
        link.label(0, {attrs: {source_bg: {opacity: '0.8'}}});

        if (getData(value) === '') {
            link.label(0, {attrs: {source_bg: {display: 'none'}}});
        } else {
            link.label(0, {attrs: {source_bg: {display: 'block'}}});
        }
    }

    function setLinkTargetValue(link, value) {
        if (edit_mode == 1) {
            color = 'black';
            value = link.attributes['flow-id'] + '_target';
        } else {
           color = getColor(value);
        }

        link.label(1, {attrs: {target_value: {text: getData(value)}}});
        link.label(1, {attrs: {target_value: {fill: color}}});
        link.label(1, {attrs: {target_bg: {stroke: color}}});
        link.label(1, {attrs: {target_bg: {strokeWidth: '0.5'}}});
        link.label(1, {attrs: {target_bg: {opacity: '0.8'}}});

        if (!getData(value) || getData(value) == null || getData(value) === '') {
            link.label(1, {attrs: {target_bg: {display: 'none'}}});
        } else {
            link.label(1, {attrs: {target_bg: {display: 'block'}}});
        }
    }
});
