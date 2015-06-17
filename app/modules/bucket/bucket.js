

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

			self.bucket = new BucketModel({
				id: self.id
			});
			self.bucket.fetch();

			// Binding
			this.listenTo(self.bucket, 'reset add change remove', this.render, this);
		},



		/** 
		 *	Render the view with submodule
		 *	@return		self
		 */

		render: function() {

			var self = this;

			var bucket = self.bucket.toJSON();
			var template = _.template(mainTemplate, {bucket: bucket});

			$(self.elPage).html(template);
			console.log(bucket);

			return self;

		},




	});

	return BucketView;

});


