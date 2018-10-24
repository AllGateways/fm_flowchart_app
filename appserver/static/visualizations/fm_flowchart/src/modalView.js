define([
    'underscore',
    'backbone',
    'jquery',
    'splunkjs/mvc/searchmanager'
    ], function(_, Backbone, $, SearchManager) {
        var modalTemplate = "<div id=\"pivotModal\" class=\"modal\">" +
           "<div class=\"modal-header\"><h3><%- title %></h3></div>" +
           "<div class=\"modal-body\"></div>" +
           "<div class=\"modal-footer\"><button " +
           "class=\"dtsBtn close\">Close</button></div>" +
           "</div>" +
           "<div class=\"modal-backdrop\"></div>";

        var ModalView = Backbone.View.extend({
            defaults: {
                title: 'Not Set'
            },

            initialize: function(options) {
                this.options = options;
                this.options = _.extend({}, this.defaults, this.options);
                this.template = _.template(modalTemplate);
                console.log('Hello from Modal View: ' + this.options.title);
            },

            events: {
            },

            render: function() {
                var data = { title : this.options.title }
                this.$el.html(this.template(data));
                return this;
            },

            show: function(el) {
                //$(document.body).append(this.render().el);
                el.append(this.render().el);
            },

            close: function() {
                this.unbind();
                this.remove();
            }
        });
    return ModalView;
});
