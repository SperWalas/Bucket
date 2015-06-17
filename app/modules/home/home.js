

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

  'collections/session/model',
  'collections/users/model'

], function($, _, Backbone, mainTemplate, popupTemplate, Session, User) {


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
			'submit .popup_login form' : 'login',
			'submit .page_home form' : 'signin'
		},



		/**
		 *	Init Home view 
		 */

		initialize: function() {

			var self = this;

			self.session = new Session();

			self.render();
		},



		/** 
		 *	Render the view with submodule
		 *	@return		self
		 */

		render: function() {

			var self = this;

			$(self.elPage).html(mainTemplate);

			return self;

		},


		showPopup: function(e) {

			var self = this;
			self.$el.append(popupTemplate);

		},


		hidePopup: function(e) {

			var self = this;

			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}

			$('.popup').remove();

		},

		login: function(e) {

			var self = this;

			e.preventDefault();
			e.stopPropagation();

			var $form = $(e.currentTarget);
			var email = $form.find('input[name="email"]').val();
			var password = $form.find('input[name="password"]').val();

			self.session.login(email, password, self.loginCallback.bind(self));
		},

		loginCallback: function(status) {

			var self = this;

			if (status) {
				self.hidePopup();
				self.$el.trigger('login');
				self.goToPage('/board');
			} else {
				// Handle error
			}
		},

		signin: function(e) {
			var self = this;

			e.preventDefault();
			e.stopPropagation();

			var $form = $(e.currentTarget);
			var name = $form.find('input[name="name"]').val();
			var email = $form.find('input[name="email"]').val();
			var password = $form.find('input[name="password"]').val();

			var user = new User({
				name: name,
				email: email,
				password: password
			});

			user.save(null, {success: self.signinCallback.bind(self), error: self.signinCallback.bind(self)});
		},

		signinCallback: function(model, response, options) {

			var self = this;

			if (response.status) {
				// Handle error
			} else {
				self.session.saveToken(response);
				self.hidePopup();
				self.$el.trigger('login');
				self.goToPage('/board');
			}
		}


	});

	return HomeView;

});


