define([
	"lodash",
	"jquery",
	"backbone",
	"router",
	'cookies'

], function(_, $, Backbone, Router, Cookies) {

	
	var App = {};

	App.init = function() {

		var self = this;

		var app = {
			settings: {
				root : '/',
				api : 'https://damp-ridge-1156.herokuapp.com'
			}
		};


		// Store the original version of Backbone.sync
		var backboneSync = Backbone.sync;

		// Create a new version of Backbone.sync which calls the stored version after a few changes
		Backbone.sync = function (method, model, options) {
			
			// Change the `url` property of options to begin with the URL from settings
			// This works because the options object gets sent as the jQuery ajax options, which
			// includes the `url` property

			options.url = app.settings.api + (_.isFunction(model.url) ? model.url() : model.url) + '?token=' + Cookies.get('token');
			 
			// Call the stored original Backbone.sync method with the new url property
			// return BackboneSync(method, model, options);
			return backboneSync.apply(this, [method, model, options]);
		};

		// App router
		app.router = new Router();

		// Add goto function to navigate in view
		Backbone.View.prototype.goToPrevious = function () {
			app.router.goToPrevious();
		};

		Backbone.View.prototype.goToPage = function(href) {
			app.router.navigate(href, true);
		};

		// Trigger the initial route and enable HTML5 History API support, set the root folder to '/' by default.
		Backbone.history.start({
			pushState: true,
			root: app.settings.root
		});


		// Not firing link to avoid reload
		$(document).on('click', 'a:not([data-bypass])', function (evt) {

			var href = $(this).attr('href') || '/';
			var protocol = this.protocol + '//';

			if (href.slice(protocol.length) !== protocol) {
				evt.preventDefault();
				app.router.navigate(href, true);
			}

		});

		// force ajax call on all browsers
		//$.ajaxSetup({ cache: false });
	};

	return App;

});