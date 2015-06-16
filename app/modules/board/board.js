

/**
 *	board.js
 *	@path : /app/module/board/
 *	@url : /board
 *	@desc : 
 *
 *	@return 	BoardView
 */


define([
  'jquery',
  'underscore',
  'backbone',

  'collections/buckets/model',

  'text!modules/board/templates/mainTemplate.html',
  'text!modules/board/templates/createNameTemplate.html',
  'text!modules/board/templates/createPeopleTemplate.html',

  'jqueryTag'

], function($, _, Backbone, BucketModel, mainTemplate, createNameTemplate, createPeopleTemplate) {


	var BoardView = Backbone.View.extend({


		/**
		 *	All variables
		 */

		el:'#main',
		elPage: '.page',



		/**
		 *	Listener in the view
		 */
		 
		events: {
			'click .btn-new-bucket, .popup_bucket_creation_people .btn-back' : 'startCreateBucket',
			'submit .popup_bucket_creation form' : 'startAddPeopleBucket',
			'submit .popup_bucket_creation_people' : 'publishBucket',

			'click .popup_bucket_creation .popup--btn-close, .popup_bucket_creation_people .popup--btn-close' : 'hidePopup'
		},



		/**
		 *	Init Home view 
		 */

		initialize: function() {

			var self = this;

			// Init new bucket model, in case
			self.newBucket = new BucketModel();

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



		/**
		 *	Lunch creation of bucket
		 */

		startCreateBucket: function(e) {

			e.preventDefault();
			e.stopPropagation();

			var self = this;

			// Save last email
			self.newBucket.set('emailTag', $('.tagsinput .tag').text().split('x').join(',').slice(0, - 1));

			var popupTemplate = _.template(createNameTemplate, self.newBucket.toJSON() );

			self.hidePopup();
			self.$el.append(popupTemplate);

		},



		/**
		 *	Show second popup of creation
		 */
		startAddPeopleBucket: function(e) {

			e.preventDefault();
			e.stopPropagation();

			var self = this;

			// Set name in new bucket
			self.newBucket.set("name", $('#bucket_name').val() );

			var jSON = self.newBucket.toJSON();
			var popupTemplate = _.template(createPeopleTemplate, jSON );

			self.hidePopup();
			self.$el.append(popupTemplate);

			$('#bucket_people').tagsInput({
			   'height': 'auto',
			   'width': '100%',
			   'interactive':true,
			   'defaultText':'Emails des participants',
			   'delimiter': [',',';',' '], 
			   'removeWithBackspace' : true,
			   'placeholderColor' : '#BBB'
			}).importTags(jSON.emailTag);

		},



		/**
		 *	Hide popup
		 *	@param		e = Event
		 */

		hidePopup: function(e) {

			var self = this;
			if(e) {
				e.preventDefault();
				e.stopPropagation();		
			}
			$('.popup').remove();

		}




	});

	return BoardView;

});


