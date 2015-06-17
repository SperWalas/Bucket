

/**
 *  model.js
 *  @path : /app/collections/session/
 *  @desc : Model to auth
 *
 *  @return     SessionModel
 */


define([
    'jquery',
    'lodash',
    'backbone',
    'cookies'
    
], function($, _, Backbone, Cookies){

    var SessionModel = Backbone.Model.extend({

        defaults: {
            token: false,
            email: '',
            password: ''
        },

        url: '/session',
        
        initialize : function() {
            this.load();
        },

        authenticated: function() {
            return Boolean(this.get('token'));
        },

        login: function(username, password, callback) {

            var self = this;

            self.set({
                email: username,
                password: password
            });

            self.save(null, {
                success: function(model, response, options) {
                    self.saveCredentials(response);
                    callback(true);
                },
                error: function() {
                    callback(false);
                }
            });
        },

        logout: function(callback) {

            var self = this;

            self.destroy({
                success: function() {
                    self.deleteToken();
                    callback(true);
                },
                error: function() {
                    callback(false);
                }
            });
        },

        saveCredentials: function(response) {
            Cookies.set('token', response.token).set('email', response.email).set('id', response.id);
        },

        deleteToken: function() {
            Cookies.expire('token');
        },

        load: function() {
            this.set('token', Cookies.get('token'));
            this.set('email', Cookies.get('email'));
            this.set('id', Cookies.get('id'));
        }
    });

    return SessionModel;

});
