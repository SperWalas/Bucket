

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
		 
		events: {
			'submit .page_bucket--docs_new form' : 'addFileRow'
		},



		/**
		 *	Init Home view 
		 */

		initialize: function() {

			var self = this;

			// Get the bucket asked
			self.theBucket = new BucketModel();


			// Set the bucket to test
			var peopleInBucket = [
				{ 
					name: "Laure",
					email: "laure@gmail.com"
				},
				{ 
					name: "Sam",
					email: "sam@gmail.com"
				},
			];

			self.theBucket.set('peoples', peopleInBucket);

		},



		/** 
		 *	Render the view with bucket data
		 *	@return		self
		 */

		render: function() {

			var self = this;

			// Template the page
			var template = _.template(mainTemplate, self.theBucket.toJSON() );
			$(self.elPage).html(template);

			return self;

		},



		/**
		 *	Add a file row in the bucket
		 * 	@param		e = Event
		 */

		addFileRow:function(e) {

			e.preventDefault();

			var self = this;
			var $from = $('.page_bucket--docs_new form');

			// Add task in bucket
			var tasks = self.theBucket.get('tasks');
			if(!tasks.length) 
				tasks = [];
			tasks.push({ name: $from.find('#new_doc').val() });
			self.theBucket.set('tasks', tasks);

			// Remove entry in 
			$from.find('#new_doc').val(''); 

			self.render();


		},




	});

	return BucketView;

});


