

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
  'text!modules/bucket/templates/viewerPDFTemplate.html',

  'jqueryTag',
  'pdfViewer',

], function($, _, Backbone, BucketModel, TaskModel, mainTemplate, createPeopleTemplate, fileUploadTemplate, viewerPDFTemplate) {


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

			'click .slot--file--info' : 'openPDF',
			'click .popup_background' : 'hidePopup',

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

			console.log(self.theBucket);


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



				// var PAGE_TO_VIEW = 1;

				// var container = document.querySelector('.popup_viewer--pdfs');

				// // Loading document.
				// PDFJS.getDocument(pdfUrl).then(function (pdfDocument) {
				//   // Document loaded, retrieving the page.
				//   return pdfDocument.getPage(PAGE_TO_VIEW).then(function (pdfPage) {
				//   	var ratio = 840 / pdfPage.pageInfo.view[2];
				//   	console.log(ratio);
				//     // Creating the page view with default parameters.
				//     var pdfPageView = new PDFJS.PDFPageView({
				//       container: container,
				//       id: PAGE_TO_VIEW,
				//       scale: 1,
				//       defaultViewport: pdfPage.getViewport(ratio)
				//     });
				//     // Associates the actual page with the view, and drawing it
				//     pdfPageView.setPdfPage(pdfPage);
				//     return pdfPageView.draw();
				//   });
				// });
			}

		},




	});

	return BucketView;

});


