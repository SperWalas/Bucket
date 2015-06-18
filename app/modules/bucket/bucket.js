

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
  'lodash',
  'backbone',

  'collections/buckets/model',
  'collections/tasks/model',

  'text!modules/bucket/templates/mainTemplate.html',
  'text!modules/bucket/templates/createPeopleTemplate.html',
  'text!modules/bucket/templates/fileUploadTemplate.html',

  'jqueryTag'

], function($, _, Backbone, BucketModel, TaskModel, mainTemplate, createPeopleTemplate, fileUploadTemplate) {


	var BucketView = Backbone.View.extend({


		/**
		 *	All variables
		 */

		el:'#main',
		elPage: '.page',

		people: [],


 
		/**
		 *	Listener in the view
		 */
		 
		events: {
			'click .page_bucket .btn-add-people' : 'initPopupAddPeople',
			'submit .page_bucket--docs_new form' : 'addTask',

			'submit .popup_bucket_creation_people form' : 'addPeople',
			'click .popup_bucket_creation_people .popup--btn-close' : 'hidePopup',
			'click .page_bucket--people .btn-download' : 'removePeople',

			'click .page_bucket--doc .btn-download' : 'removeTask',

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
			self.listenTo(self.theBucket, 'reset add change remove', self.render, self);
		},




		/** 
		 *	Render the view with bucket data
		 *	@return		self
		 */

		render: function() {

			var self = this;

			var bucket = self.theBucket.toJSON();

			var template = _.template(mainTemplate);
			template = template({bucket: bucket});

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
			var popupTemplate = _.template(createPeopleTemplate);
			popupTemplate = popupTemplate(bucket);
			self.$el.append(popupTemplate);

			$('#bucket_people').tagsInput({
				height: 'auto',
				width: '100%',
				interactive:true,
				defaultText:'Emails des participants',
				delimiter: [',',';',' '], 
				removeWithBackspace: true,
				placeholderColor: '#BBB',
				onAddTag: self.onAddPeople.bind(self),
				onRemoveTag: self.onRemovePeople.bind(self)
			});

		},

		onAddPeople: function(email) {
			var self = this;
			self.people.push({email: email});
		},

		onRemovePeople: function(email) {
			var self = this;

			var i = array.indexOf({email: email});

			if (i != -1) {
				self.people.splice(i, 1);
			}
		},	

		addPeople: function(e) {
			var self = this;

			e.preventDefault();

			var users = self.theBucket.get('users');
			users = users.concat(self.people);

			self.theBucket.set('users', users);
			self.theBucket.save();
			self.hidePopup();
		},

		removePeople: function(e) {
			var self = this;

			e.preventDefault();
			e.stopPropagation();

			var $this = $(e.currentTarget);
			var email = $this.data('email');
			var users = self.theBucket.get('users');
			var index = _.findIndex(users, {
				email: email
			});

			if (index != -1) {
				users.splice(index, 1);
			}

			self.theBucket.set('users', users);
			self.theBucket.save();
		},

		addTask: function(e) {
			var self = this;

			e.preventDefault();

			var $this = $(e.currentTarget);
			var $name = $this.find('input');
			var users = self.theBucket.get('users');
			if (!users.length) {
				users = self.theBucket.get('authors');
			}
			var task = new TaskModel({
				name: $name.val(),
				users: users,
				bucket: {
					id: self.theBucket.get('id')
				}
			});
			$name.val('');
			task.save(null, {success: function(model, response, options) {
				self.theBucket.fetch();
			}});
		},

		removeTask: function(e) {
			var self = this;

			e.preventDefault();
			e.stopPropagation();

			var $this = $(e.currentTarget);
			var id = $this.data('id');
			var task = new TaskModel({
				id: id
			});
			task.destroy({success: function(){
				self.theBucket.fetch();
			}});
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

			 	var templateFile = _.template(fileUploadTemplate);
			 	templateFile = templateFile(file);
			 	$slot.prepend(templateFile);

		 	});


		 },




	});

	return BucketView;

});


