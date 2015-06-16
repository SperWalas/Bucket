

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
            token: null
        },

        url: 'http://localhost:1337/user/login',
        
        initialize : function() {
            this.load();
        },

        authenticated: function() {
            return Boolean(this.get('token'));
        },

        login: function(username, password) {
            var self = this;

            $.ajax({
                method: 'POST',
                url: self.url,
                data: { email: username, password: password },
                success: function(data) {
                    self.save(data);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    self.save(false);
                }
            });
        },

        save: function(token) {
            Cookies.set('token', token);
        },

        load: function() {
            this.set('token', Cookies.get('token'));
        }
    });

    return SessionModel;

});
