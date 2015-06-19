
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
            "(:module)(/)(:id)(/)(:token)": "render"
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
        render: function(module, id, token) {

            var self = this;

            // Set default view and clean name
            module = (!module) ? this.defaultView : module;
            module = module.toLowerCase();

            if (id === 'invite' && token && !self.session.invited()) {

                self.session.invite(token, function(){
                    self.headerView = new HeaderView();
                });

            } else {

                self.session.load();

                if (!self.session.authenticated()) {

                    console.log('Stranger');

                    // If you are a stranger, you can only see the home
                    if (module !== this.defaultView) {
                        module = this.defaultView;
                        this.navigate('/', true);
                    }

                } else if (self.session.invited()) {

                    console.log('Guest');

                    token = self.session.get('token');

                    // If you are a guest, you can go on home or bucket
                    if (module !== this.defaultView || module !== 'bucket') {
                        module = 'bucket';
                        this.navigate('/bucket', true);
                    }

                } else {

                    console.log('Authenticated');

                    // if you are authenticated, you can go everywhere, except on home
                    if (module === this.defaultView) {
                        module = 'board';
                        this.navigate('/board', true);
                    }

                }

            }

            // Load view asked 
            if(self[module+'View']) {

                self.currentView = new self[module+'View']({
                    id: id,
                    token: token
                });

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
