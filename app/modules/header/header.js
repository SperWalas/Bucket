

/**
 *	header.js
 *	@path : /app/module/header/
 *	@url : /
 *	@desc : 
 *
 *	@return 	HeaderView
 */


define([
  'jquery',
  'underscore',
  'backbone',

  'text!modules/header/templates/mainTemplate.html',
  'text!modules/header/templates/menuTemplate.html',
  'text!modules/header/templates/menuLoggedTemplate.html',

  'collections/session/model'

], function($, _, Backbone, mainTemplate, menuTemplate, menuLoggedTemplate, Session) {


	var HeaderView = Backbone.View.extend({


		/**
		 *	All variables
		 */

		el:'#main',
		elHeader:'.header',
		elNav:'.header--nav',



		/**
		 *	Listener in the view
		 */
		 
		events: {
			"click .header--nav--login" : "sendPopupEvent"
		},



		/**
		 *	Init Home view 
		 */

		initialize: function() {

			var self = this;

			var session = new Session();

			// Add header template
			$(self.elHeader).html(mainTemplate);

			if (session.authenticated()) {
				$(self.elNav).html(menuLoggedTemplate);
			} else {
				$(self.elNav).html(menuTemplate);
			}

		},



		/** 
		 *	Render the view with submodule
		 *	@return		self
		 */

		render: function() {

			var self = this;
			return self;

		},



		/** 
		 *	Send event to home view
		 *	@params		e = Event
		 */

		sendPopupEvent:function(e) {

			var self = this;
			e.preventDefault();
			self.$el.trigger('connect');

		}


	});

	return HeaderView;

});


