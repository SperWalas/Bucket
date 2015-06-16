

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
			var popupTemplate = _.template(createPeopleTemplate, self.newBucket.toJSON() );

			self.hidePopup();
			self.$el.append(popupTemplate);

			$('#bucket_people').tagsInput({
			   'height': $('#bucket_people').height(),
			   'width': $('#bucket_people').width(),
			   'interactive':true,
			   'defaultText':'Emails des participants',
			   // 'onAddTag':callback_function,
			   // 'onRemoveTag':callback_function,
			   // 'onChange' : callback_function,
			   'delimiter': [',',';',' '],   // Or a string with a single delimiter. Ex: ';'
			   'removeWithBackspace' : true,
			   // 'minChars' : 0,
			   // 'maxChars' : 0, // if not provided there is no limit
			   'placeholderColor' : '#BBB'
			});

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


