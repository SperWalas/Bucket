

/**
 *	home.js
 *	@path : /app/module/home/
 *	@url : /
 *	@desc : 
 *
 *	@return 	HomeView
 */


define([
  'jquery',
  'underscore',
  'backbone',

  'text!modules/home/templates/mainTemplate.html',
  'text!modules/home/templates/popupTemplate.html',

  'collections/session/model'

], function($, _, Backbone, mainTemplate, popupTemplate, Session) {


	var HomeView = Backbone.View.extend({


		/**
		 *	All variables
		 */

		el:'#main',
		elPage: '.page',



		/**
		 *	Listener in the view
		 */
		 
		events: {
			'connect' : 'showPopup',
			'click .popup_login .popup--btn-close' : 'hidePopup',
			'submit .popup_login form' : 'login'
		},



		/**
		 *	Init Home view 
		 */

		initialize: function() {

			var self = this;

			self.session = new Session();

			$(self.elPage).html(mainTemplate);

		},



		/** 
		 *	Render the view with submodule
		 *	@return		self
		 */

		render: function() {

			var self = this;
			return self;

		},


		showPopup: function(e) {

			var self = this;
			self.$el.append(popupTemplate);

		},


		hidePopup: function(e) {

			var self = this;
			e.preventDefault();
			e.stopPropagation();
			$('.popup').remove();

		},

		login: function(e) {

			var self = this;

			e.preventDefault();
			e.stopPropagation();

			var $form = $(e.currentTarget);
			var name = $form.find('input[name="email"]').val();
			var password = $form.find('input[name="password"]').val();

			self.session.login(name, password);
		}


	});

	return HomeView;

});


