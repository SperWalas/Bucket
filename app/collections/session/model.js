

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
            invite: false
        },

        url: '/session',
        
        initialize : function() {
            this.load();
        },

        authenticated: function() {
            return Boolean(this.get('token'));
        },

        invited: function() {
            return Boolean(this.get('invite'));
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

            self.deleteCredentials();

            self.destroy({
                success: function() {
                    callback(true);
                },
                error: function() {
                    callback(false);
                }
            });
        },

        invite: function(token, callback) {
            var self = this;

            self.set({
                token: token,
                invite: true
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

        saveCredentials: function(response) {

            if (this.invited()) {
                Cookies.set('token', this.get('token'));
            } else {
                Cookies.set('token', response.token);
            }

            Cookies.set('email', response.email).set('id', response.id).set('name', response.name).set('invite', this.get('invite'));
        },

        deleteCredentials: function() {
            Cookies.expire('token').expire('email').expire('id').expire('name').expire('invite');
        },

        load: function() {
            this.set({
                token: Cookies.get('token'),
                email: Cookies.get('email'),
                id: Cookies.get('id'),
                name: Cookies.get('name'),
                invite: Cookies.get('invite')
            });
        }
    });

    return SessionModel;

});
