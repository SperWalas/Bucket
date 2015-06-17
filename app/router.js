
define([
  "lodash",
  "jquery",
  "backbone",
  "modules/header/header",
  "modules/home/home",
  "modules/board/board",
  "modules/bucket/bucket",
  'collections/session/model'

], function(_, $, Backbone, HeaderView, HomeView, BoardView, BucketView, Session) {



    // Defining the application router.

    var Router = Backbone.Router.extend({

        history: [],

        // All Route
        routes: {
            "(:module)(/)(:id)": "render"
        },


        // First function
        initialize:function() {

            var self = this;
            self.bind( "all", self.storeRoute );
            self.currentView = null;

            self.session = new Session();

            // Init default view
            self.defaultView = 'home';
            self.homeView = HomeView || null;
            self.boardView = BoardView || null;
            self.bucketView = BucketView || null;
            self.headerView = new HeaderView();

        },
 

        // Save route
        storeRoute : function() {

            this.currentUrl = Backbone.history.fragment;
            this.history.push(self.currentUrl);

        },

        // Render view asked
        render: function(module) {

            var self = this;

            // Set default view and clean name
            module = (!module) ? this.defaultView : module;
            module = module.toLowerCase();

            self.session.load();

            if (module !== this.defaultView) {
                if (!self.session.authenticated()) {
                    module = this.defaultView;
                    this.navigate('/', true);
                }
            } else {
                if (self.session.authenticated()) {
                    module = 'board';
                    this.navigate('/board', true);
                }
            }

            // Load view asked 
            if(self[module+'View']) { 

                // If module is not the loaded load the new module (3d or Carto here)
                if(self.moduleLoaded != module) {

                    self.currentView = new self[module+'View']();
                    self.currentView.render();

                } else {

                    self.currentView.render();

                }

                // Save the module loaded
                self.moduleLoaded = module;

                console.log("Module loaded : " + module );

            } else {

                // Module doesn't exist
                self.error();


            }
 
        },


        // Error
        error: function() {

            console.log('404');

        }



    });

    return Router;

});
