

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
  'lodash',
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
			"click .header--nav--login" : "sendPopupEvent",
			'click .header--nav--logout' : 'logout',
			'login' : 'render'
		},



		/**
		 *	Init Home view 
		 */

		initialize: function() {

			var self = this;

			self.session = new Session();

			// Add header template
			$(self.elHeader).html(mainTemplate);

			self.render();
		},



		/** 
		 *	Render the view with submodule
		 *	@return		self
		 */

		render: function() {

			var self = this;

			self.session.load();

			if (self.session.authenticated()) {
				var userInfo = self.session.toJSON();
				if(!userInfo.name) {
					userInfo.name = userInfo.email;
				}
				var template = _.template(menuLoggedTemplate);
				template = template({name : userInfo.name});
				$(self.elNav).html(template);
			} else {
				$(self.elNav).html(menuTemplate);
			}

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

		},

		logout: function(e) {

			var self = this;

			e.preventDefault();

			self.session.logout(self.logoutCallback.bind(self));
		},

		logoutCallback: function(status) {

			var self = this;

			if (status) {
				self.goToPage('/');
				self.render();
			} else {
				// Handle error
			}
		}

	});

	return HeaderView;

});


