

/**
 *  model.js
 *  @path : /app/collections/users/
 *  @desc : Model to handle users
 *
 *  @return     BucketModel
 */


define([
    'jquery',
    'lodash',
    'backbone',
    
], function($, _, Backbone){

    var UserModel = Backbone.Model.extend({

        defaults: {
            name: '',
            email: '',
            password: '',
        },
        
        url : '/user',

        initialize : function() {},

    });

    return UserModel;

});
