

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
  'text!modules/bucket/templates/createPeopleTemplate.html',
  'text!modules/bucket/templates/fileUploadTemplate.html',

  'jqueryTag'

], function($, _, Backbone, BucketModel, mainTemplate, createPeopleTemplate, fileUploadTemplate) {


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
			'click .page_bucket .btn-add-people' : 'initPopupAddPeople',
			'submit .page_bucket--docs_new form' : 'addFileRow',

			'click .popup_bucket_creation_people .popup--btn-close' : 'hidePopup',

			'dragenter .dropzone' : 'highlightDropZone',
		    'dragleave .dropzone' : 'unhighlightDropZone',
		    'change input[type="file"]' : 'dropFile',
		},



		/**
		 *	Init Home view 
		 */

		initialize: function() {

			var self = this;

			// Get the bucket
			self.theBucket = new BucketModel({
				id: self.id
			});
			self.theBucket.fetch();

			// Binding
			self.listenTo(self.theBucket, 'reset add change remove', this.render, this);
		},




		/** 
		 *	Render the view with bucket data
		 *	@return		self
		 */

		render: function() {

			var self = this;

			var bucket = self.theBucket.toJSON();
			var template = _.template(mainTemplate, {bucket: bucket});

			$(self.elPage).html(template);

			return self;

		},




		/**
		 *	Init popup to add people to bucket
		 *	@param		e = Event
		 */

		initPopupAddPeople:function(e) {
 
			e.preventDefault();
			e.stopPropagation();

			var self = this;

			// Template popup add people
			bucket = self.theBucket.toJSON();
			var popupTemplate = _.template(createPeopleTemplate, bucket);
			self.$el.append(popupTemplate);

			$('#bucket_people').tagsInput({
			   'height': 'auto',
			   'width': '100%',
			   'interactive':true,
			   'defaultText':'Emails des participants',
			   'delimiter': [',',';',' '], 
			   'removeWithBackspace' : true,
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




		/**
		 *	Dropzone
		 */

		highlightDropZone:function(e) {
		 	e.preventDefault();

		 	var $dropZone = $(e.currentTarget);
		 	$dropZone.addClass('is-hovered');
		},


		unhighlightDropZone:function(e) {
		 	e.preventDefault();

		 	var $dropZone = $(e.currentTarget);
		 	$dropZone.removeClass('is-hovered');
		},


		/** 
		 *	Convert size to readable size 
		 * TODO : REMOVE THIS TO HELPER
		 */

		fileSizeSI:function(a,b,c,d,e){
			 return (b=Math,c=b.log,d=1e3,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)+' '+(e?'kMGTPEZY'[--e]+'B':'Bytes');
		},


		/**
		 *	Event when files are drop in dropzone
		 */

		dropFile:function(e) {

			var self = this;
		 	var $input = $(e.currentTarget);
		 	var $slot = $input.parent().parent();
		 	var $dropZone = $slot.find('.dropzone');

		 	// Add class, prepare style
		 	$dropZone.removeClass('is-hovered');
		 	$slot.addClass('is-contain-file');

		 	// Get file
		 	var fileDropped = e.currentTarget.files;

		 	_.each(fileDropped, function(file) {

		 		file.sizeFormated = self.fileSizeSI(file.size);

			 	var templateFile = _.template(fileUploadTemplate, file);
			 	$slot.prepend(templateFile);

		 	});


		 },




	});

	return BucketView;

});


