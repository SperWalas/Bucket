

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
  'collections/session/model',
  'collections/files/model',

  'text!modules/bucket/templates/mainTemplate.html',
  'text!modules/bucket/templates/createPeopleTemplate.html',
  'text!modules/bucket/templates/fileUploadTemplate.html',
  'text!modules/bucket/templates/viewerPDFTemplate.html',

  'jqueryTag',
  'pdfViewer',


], function($, _, Backbone, BucketModel, TaskModel, Session, FileModel, mainTemplate, createPeopleTemplate, fileUploadTemplate, viewerPDFTemplate) {


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

			'submit .popup_bucket_creation_people form' : 'addPeople',
			'click .popup_bucket_creation_people .popup--btn-close' : 'hidePopup',
			'click .page_bucket--people .btn-download' : 'removePeople',

			'submit .page_bucket--docs_new form' : 'addTask',
			'click .page_bucket--doc .btn-download' : 'removeTask',

			'click .slot--file--info' : 'openPDF',
			'click .popup_background' : 'hidePopup',

			'dragenter .dropzone' : 'highlightDropZone',
			'dragleave .dropzone' : 'unhighlightDropZone',

			'change input[type="file"]' : 'onDrop',
			'click .slot--file--delete' : 'removeFile'
		},



		/**
		 *	Init Home view 
		 */

		initialize: function() {

			var self = this;

			self.session = new Session();

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

		onDrop: function(e) {

			var self = this;
			var $this = $(e.currentTarget);
			var $slot = $this.parent().parent();
			var $dropZone = $this.find('.dropzone');
			var files = e.currentTarget.files;
			
			$dropZone.removeClass('is-hovered');
			$slot.addClass('is-contain-file');

			_.each(files, function(file) {

				file.sizeFormated = self.fileSizeSI(file.size);

				var templateFile = _.template(fileUploadTemplate);
				templateFile = templateFile(file);
				$slot.prepend(templateFile);
			});

			self.addFile(e);
		},


		addFile: function(e) {

			var self = this;
			var $this = $(e.currentTarget);
			var files = e.currentTarget.files;
			var data = new FormData();
			var token = self.session.get('token');
			var contributor = $this.data('contributor');
			var task = $this.data('task');
			var erase = false;

			_.forEach(files, function(file){
				data.append('files', file);
			});


			// With file model
			var file = new FileModel();

			file.url = file.url + '?contributor=' + contributor + '&task=' + task + '&erase=' + erase;
			file.save(null, {
				data: data,
				contentType: false,
				processData: false
			});

			// // With standalone js
			// $.ajax({
			// 	url: 'https://damp-ridge-1156.herokuapp.com/file?token=' + token + '&contributor=' + contributor + '&task=' + task + '&erase=' + erase,
			// 	data: data,
			// 	contentType: false,
			// 	processData: false,
			// 	crossDomain: true,
			// 	xhrFields: {
			// 		withCredentials: true
			// 	},
			// 	type: 'POST',
			// 	success: function(data) {
			// 		// Handle success event
			// 	}
			// });
		},

		removeFile: function(e) {

			var self = this;

			e.preventDefault();
			e.stopPropagation();

			var $this = $(e.currentTarget);
			var id = $this.data('id');
			var file = new FileModel({
				id: id
			});

			file.url = file.url + '/' + id;
			file.destroy({success: function(){
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



		 /**
		  *	Gestion du PDF
		  */

		openPDF:function(e) {

			e.stopPropagation();
			e.preventDefault();

			var self = this; 

			self.$el.append(viewerPDFTemplate);

			var pdfUrl = $(e.currentTarget).data("url");
			pdfUrl = 'https://s3.amazonaws.com/buckethostinghetic2/4c1f9aca-54d9-49a5-9b75-66f0abb2cd8e.pdf';



			function handlePages(page) { 


				var container = document.querySelector('.popup_viewer--pdfs');

				//This gives us the page's dimensions at full scale
				var viewport = page.getViewport( $('.popup_viewer--pdfs').width() / page.getViewport(1.0).width );

				//We'll create a canvas for each page to draw it on
				var canvas = document.createElement( "canvas" );
				canvas.style.display = "block";
				var context = canvas.getContext('2d');
				canvas.height = viewport.height;
				canvas.width = viewport.width;

				//Draw it on the canvas
				page.render({canvasContext: context, viewport: viewport});

				//Add it to the web page
				container.appendChild( canvas );

				//Move to next page
				currPage++;
				if ( thePDF !== null && currPage <= numPages )
				{
					thePDF.getPage( currPage ).then( handlePages );
				}

			}


			if (PDFJS.PDFViewer || PDFJS.getDocument) {

				PDFJS.workerSrc = '../vendors/pdfjs-dist/build/pdf.worker.js';


				var currPage = 1; //Pages are 1-based not 0-based
				var numPages = 0;
				var thePDF = null;

				//This is where you start
				PDFJS.getDocument(pdfUrl).then(function(pdf) {

					//Set PDFJS global object (so we can easily access in our page functions
					thePDF = pdf;

					//How many pages it has
					numPages = pdf.numPages;

					//Start with first page
					pdf.getPage( 1 ).then( handlePages );

				});

			}

		},

	});

	return BucketView;

});


