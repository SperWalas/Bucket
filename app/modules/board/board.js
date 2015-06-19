

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
  'lodash',
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

			self.buckets.fetch({success: function(){
				// If no buckets
				if (!_.size(self.buckets)) {
					self.render();
				}
			}});

			// Binding
			self.listenTo(self.buckets, 'add', self.saveBucket, self);
			self.listenTo(self.buckets, 'remove', self.destroyBucket, self);
			self.listenTo(self.buckets, 'add change remove ', self.render, self);
		},



		/** 
		 *	Render the view with submodule
		 *	@return		self
		 */

		render: function() {

			var self = this;
			var buckets = self.buckets.toJSON();
			
			var template = _.template(mainTemplate);
			template = template({buckets: buckets, files: self.getFilesNumber(buckets)});

			$(self.elPage).html(template);

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

			var $form = $(e.currentTarget);
			var name = $form.find('input[name="name"]').val();

			self.buckets.add({
				name: name,
				authors: [self.session.get('id')]
			});
		},

		deleteBucket: function(e) {
			var self = this;

			e.preventDefault();
			e.stopPropagation();

			var $this = $(e.currentTarget);

			self.buckets.remove($this.data('id'));
		},

		saveBucket: function(bucket) {
			var self = this;
			self.hidePopup();
			bucket.save();
		},

		destroyBucket: function(bucket) {
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
				files += bucket.filesToReview;
			});

			return files;
		}




	});

	return BoardView;

});


