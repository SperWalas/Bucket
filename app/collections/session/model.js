

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
            token: false
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
                    self.deleteCredentials();
                    callback(true);
                },
                error: function() {
                    callback(false);
                }
            });
        },

        saveCredentials: function(response) {
            Cookies.set('token', response.token).set('email', response.email).set('id', response.id).set('name', response.name);
        },

        deleteCredentials: function() {
            Cookies.expire('token').expire('email').expire('id').expire('name');
        },

        load: function() {
            this.set({
                token: Cookies.get('token'),
                email: Cookies.get('email'),
                id: Cookies.get('id'),
                name: Cookies.get('name')
            });
        }
    });

    return SessionModel;

});
