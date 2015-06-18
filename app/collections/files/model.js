

/**
 *  model.js
 *  @path : /app/collections/files/
 *  @desc : Model to get a task
 *
 *  @return     BucketModel
 */


define([
    'jquery',
    'lodash',
    'backbone',
    
], function($, _, Backbone){

    var FileModel = Backbone.Model.extend({

        defaults: {
            contributors: '', // Email
            task: '', // Id
            erase: false,
        },

        urlRoot: '/file'
    });

    return FileModel;

});
