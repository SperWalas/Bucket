

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

        url: '/user/login',
        
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
                    self.saveToken(response);
                    callback(true);
                },
                error: function() {
                    callback(false);
                }
            });
        },

        saveToken: function(token) {
            Cookies.set('token', token);
        },

        load: function() {
            this.set('token', Cookies.get('token'));
        },

        destroy: function() {
            Cookies.expire('token');
        }
    });

    return SessionModel;

});
