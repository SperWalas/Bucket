

/**
 *  model.js
 *  @path : /app/collections/tasks/
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

        url: '/file',
        urlRoot: '/file'

    });

    return FileModel;

});
