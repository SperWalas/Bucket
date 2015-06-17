

/**
 *	bucket.js
 *	@path : /app/module/bucket/
 *	@url : /bucket/(:id)
 *	@desc : 
 *
 *	@return 	BucketView
 */


define([
  'jquery',
  'underscore',
  'backbone',

  'collections/buckets/model',

  'text!modules/bucket/templates/mainTemplate.html',
  'text!modules/board/templates/createNameTemplate.html',
  'text!modules/board/templates/createPeopleTemplate.html'

], function($, _, Backbone, BucketModel, mainTemplate, createNameTemplate, createPeopleTemplate) {


	var BucketView = Backbone.View.extend({


		/**
		 *	All variables
		 */

		el:'#main',
		elPage: '.page',



		/**
		 *	Listener in the view
		 */
		 
		events: {},



		/**
		 *	Init Home view 
		 */

		initialize: function() {

			var self = this;

			// Init new bucket model, in case
			// self.newBucket = new BucketModel();

			// Template the page
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




	});

	return BucketView;

});


