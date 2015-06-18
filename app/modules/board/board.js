	

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

  'collections/buckets/collection',
  'collections/buckets/model',
  'collections/session/model',

  'text!modules/board/templates/mainTemplate.html',
  'text!modules/board/templates/createBucketTemplate.html',

  'jqueryTag'

], function($, _, Backbone, BucketCollection, BucketModel, Session, mainTemplate, createBucketTemplate) {


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
			'click .btn-new-bucket' : 'showBucketCreationPopup',
			'submit .popup_bucket_creation form' : 'createBucket',
			'click .popup_bucket_creation .popup--btn-close' : 'hidePopup',
			'click .btn-delete' : 'deleteBucket'
		},



		/**
		 *	Init Home view 
		 */

		initialize: function() {

			var self = this;

			self.session = new Session();
			self.session.load();

			self.buckets = new BucketCollection();
			self.buckets.fetch();

			// Binding
			this.listenTo(self.buckets, 'reset add change remove', this.render, this);
		},



		/** 
		 *	Render the view with submodule
		 *	@return		self
		 */

		render: function() {

			var self = this;

			var buckets = self.buckets.toJSON();
			var template = _.template(mainTemplate, {buckets: buckets, files: self.getFilesNumber(buckets)});

			$(self.elPage).html(template);
			console.log(buckets);

			return self;

		},

		/**
		 *	Lunch creation of bucket
		 */

		showBucketCreationPopup: function(e) {
			var self = this;

			e.preventDefault();
			e.stopPropagation();

			self.hidePopup();
			self.$el.append(createBucketTemplate);
		},

		createBucket: function(e) {
			var self = this;

			e.preventDefault();

			var bucket = new BucketModel();
			var $form = $(e.currentTarget);
			var name = $form.find('input[name="name"]').val();

			bucket.set('name', name);
			bucket.set('authors', [
				self.session.get('id')
			]);
			bucket.save();
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

		deleteBucket: function(e) {
			var self = this;

			e.preventDefault();
			e.stopPropagation();

			var $this = $(e.currentTarget);

			var bucket = self.buckets.findWhere({ id: $this.data('id') });

			bucket.destroy();
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

		},

		getFilesNumber: function(buckets) {
			var files = 0;

			_.forEach(buckets, function(bucket){
				files += bucket.files;
			});

			return files;
		}




	});

	return BoardView;

});


