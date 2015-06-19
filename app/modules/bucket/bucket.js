

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
  'cookies',
  'moment',

  'collections/buckets/model',
  'collections/tasks/model',
  'collections/session/model',
  'collections/files/model',
  'collections/invite/model',
  'collections/users/model',
  'collections/comments/model',

  'text!modules/bucket/templates/mainTemplate.html',
  'text!modules/bucket/templates/createPeopleTemplate.html',
  'text!modules/bucket/templates/createUserTemplate.html',
  'text!modules/bucket/templates/fileUploadTemplate.html',
  'text!modules/bucket/templates/viewerPDFTemplate.html',

  'jqueryTag',
  'pdfViewer',


], function($, _, Backbone, Cookies, moment, BucketModel, TaskModel, Session, FileModel, InviteModel, UserModel, CommentModel, mainTemplate, createPeopleTemplate, createUserTemplate, fileUploadTemplate, viewerPDFTemplate) {


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

			'submit .popup_user_creation form' : 'addName',

			'submit .page_bucket--docs_new form' : 'addTask',
			'click .page_bucket--doc .btn-download' : 'removeTask',

			'click .slot--file--info' : 'openPDF',
			'click .popup_background' : 'hidePopup',
			'click .popup_viewer--navigate--prev' : 'prevPDF',
			'click .popup_viewer--navigate--next' : 'nextPDF',
			'click .popup_viewer--option--review a' : 'reviewPDF',
			'submit .popup_viewer--option--comment--window form' : 'addComment',

			'dragenter .dropzone' : 'highlightDropZone',
			'dragleave .dropzone' : 'unhighlightDropZone',

			'change input[type="file"]' : 'onDrop',
			'click .slot--file--delete' : 'removeFile'
		},



		/**
		 *	Init Home view 
		 */

		initialize: function(options) {

			var self = this;

			self.session = new Session();

			if (self.session.invited() || options.token) {

				var bucket = new InviteModel({
					token: options.token
				});

				bucket.save(null, {success: function(model, response){

					self.theBucket = new BucketModel({
						id: response.id
					});

					self.theBucket.fetch();

					// Binding
					self.listenTo(self.theBucket, 'reset add change remove', self.render, self);
				}});

			} else {

				self.theBucket = new BucketModel({
					id: options.id
				});

				self.theBucket.fetch();

				// Binding
				self.listenTo(self.theBucket, 'reset add change remove', self.render, self);
			}
		},




		/** 
		 *	Render the view with bucket data
		 *	@return		self
		 */

		render: function() {

			var self = this;

			var bucket = self.theBucket.toJSON();


			var template = _.template(mainTemplate);
			template = template({bucket: bucket, session: self.session.toJSON()});

			$(self.elPage).html(template);

			self.session.load();

			if (!self.session.get('name')) {
				self.initAddName();
			}

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

			var i = self.people.indexOf({email: email});

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
				processData: false,
				success: function() {
					self.theBucket.fetch();
				}
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

		initAddName: function() {
			var self = this;
			var userTemplate = _.template(createUserTemplate);
			self.$el.append(userTemplate);
		},

		addName: function(e) {
			var self = this;

			e.preventDefault();
			e.stopPropagation();

			var $this = $(e.currentTarget);
			var name = $this.find('input[name="name"]').val();

			var user = new UserModel({
				id: self.session.get('id'),
				email: self.session.get('email'),
				name: name
			});
			
			user.save(null, {success: function(model, response){
				response[0].token = self.session.get('token');
				self.session.saveCredentials(response[0]);
				self.session.load();
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

			// Get all data
		  	var self = this; 
		  	var taskIdAsked = $(e.currentTarget).data("taskid");
		  	var fileIdAsked = $(e.currentTarget).data("fileid");
		  	var peopleIdAsked = $(e.currentTarget).data("contributorid");

		  	bucket = self.theBucket.toJSON();

		  	var task = _.where(bucket.tasks, { id : taskIdAsked });

		  	var files = _.where(task[0].files, { users : peopleIdAsked });
		  	var numberFileAsked = _.findIndex(files, { id : fileIdAsked });

		  	var user = _.where(bucket.contributors, { id : peopleIdAsked });

		  	var comments = _.where(task[0].comments, { userId : peopleIdAsked });
		  	comments = _.map(comments, function(comment) {
		  		comment.dateFormated = moment(comment.createdAt, moment.ISO_8601).format('DD/MM/YYYY, HH:hh');
		  		return comment;
		  	});

		  	var reviewed = ( _.size( _.where(files, { accepted : true })) == files.length && files.length > 0);

		  	// Template with user, task, files, filesclicked, comments, session
		  	var templateFile = _.template(viewerPDFTemplate);
		 	templateFile = templateFile({ user : user[0], files: files, task : task[0], fileAsked : numberFileAsked, reviewed : reviewed, session: self.session.toJSON(), comments : comments });
		 	self.$el.append(templateFile);

		 	self.generatePDF(files);

			$('.popup_viewer--pdfs').css('left', -numberFileAsked * $('.popup_viewer--pdfs').width() )
									.width( files.length * $('.popup_viewer--pdfs').width() + 30 );
			$('.popup_viewer--navigate ul li').hide().eq(numberFileAsked).show();
			$('.popup_viewer--pdfs--option').hide().eq(numberFileAsked).show();

		},



		generatePDF:function(files) {


			// Kill if not there
		  	if (!PDFJS.PDFViewer || !PDFJS.getDocument)
		  		return;



	  		PDFJS.workerSrc = '../vendors/pdfjs-dist/build/pdf.worker.js';

	  		var currPage = 1; //Pages are 1-based not 0-based
			var numPages = 0;
			var thePDF = null;
			var handlePages;
			var containerCanvas = document.querySelector('.popup_viewer--pdfs');
			var div;

			_.each(files, function(file) {

				//This is where you start
				PDFJS.getDocument(file.url).then(function(pdf) {

			        //Set PDFJS global object (so we can easily access in our page functions
			        thePDF = pdf;

			        // We set new container
			        var div = document.createElement( "div" );
			    	div.classList.add("popup_viewer--pdf");
			        containerCanvas.appendChild( div );

			        //How many pages it has
			        numPages = pdf.numPages;

			        //Start with first page
			        pdf.getPage( 1 ).then( handlePages );

				});

			});


			handlePages = function(page) { 

			    //This gives us the page's dimensions at full scale
			    var viewport = page.getViewport( ( ($('.popup_viewer--pdfs').width() - 30 ) / files.length) / page.getViewport(1.0).width );

			    //We'll create a canvas for each page to draw it on
			    var canvas = document.createElement( "canvas" );
			    var context = canvas.getContext('2d');
			    canvas.style.display = "block";
			    canvas.height = viewport.height;
			    canvas.width = viewport.width;

				//Draw it on the canvas
				page.render({canvasContext: context, viewport: viewport});

			    //Add it to the web page
			    $('.popup_viewer--pdf').last().append( canvas );

			    //Move to next page
			    currPage++;
			    if ( thePDF !== null && currPage <= numPages ) {
			        thePDF.getPage( currPage ).then( handlePages );
			    }

			};


		},


		/** 
		 *	Action en carousel
		 */

		nextPDF:function(e) {

			e.preventDefault();
			e.stopPropagation();

			var pdfNow = $('.popup_viewer--navigate--count span').text();
			var nbrPDF = $('.popup_viewer--navigate ul li').length;

			if(pdfNow == nbrPDF)
				return;
			else 
				pdfNow++;

			$('.popup_viewer--pdfs').css('left', -(pdfNow - 1) * $('.popup--container').width() );
			$('.popup_viewer--navigate--count span').text(pdfNow);
			$('.popup_viewer--navigate ul li').hide().eq(pdfNow - 1).show();
			$('.popup_viewer--pdfs--option').hide().eq(pdfNow - 1).show();

		},		

		prevPDF:function(e) {

			e.preventDefault();
			e.stopPropagation();

			var pdfNow = $('.popup_viewer--navigate--count span').text();
			var nbrPDF = $('.popup_viewer--navigate ul li').length;

			if(pdfNow == 1)
				return;
			else 
				pdfNow--;

			$('.popup_viewer--pdfs').css('left', -(pdfNow - 1) * $('.popup--container').width() );
			$('.popup_viewer--navigate--count span').text(pdfNow);
			$('.popup_viewer--navigate ul li').hide().eq(pdfNow - 1).show();
			$('.popup_viewer--pdfs--option').hide().eq(pdfNow - 1).show();

		},




		/**
		 *	Review a PDF
		 */

		reviewPDF:function(e) {

			e.preventDefault();
			e.stopPropagation();

			var self = this;		  	
			var taskIdAsked = $(e.currentTarget).data("taskid");
			var userIdAsked = $(e.currentTarget).data("userid");
			
			var task = new TaskModel({
				id: taskIdAsked
			});
			task.fetch({
				success:function(){

					var taskJson = task.toJSON();
					var newFiles = _.map(taskJson.files, function(file) {
											if (file.tasks == taskIdAsked && file.users == userIdAsked)
												file.accepted = true;
											return file;
										});

					task.set('files', newFiles);
					task.save(null, {
						success: function(){
							self.hidePopup();
							self.theBucket.fetch();
						}
					});

				}
			});

		},



		/**
		 *	Add commentaire
		 */

		addComment:function(e) {

			e.preventDefault();
			e.stopPropagation();

			var self = this;
			var $form = $(e.currentTarget);
			var author = self.session.toJSON();

			var comment = new CommentModel({
				"author": author.email,
				"userId": $form.find('#userId_comment').val(),
				"name": author.name,
				"content": $form.find('#text_comment').val(),
				"task": $form.find('#taskId_comment').val()
			});

			comment.save(null, {
				success: function(model, response){
					self.hidePopup();
					self.theBucket.fetch();
				}
			});

		},

	});

	return BucketView;

});


