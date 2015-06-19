

/**
 *  model.js
 *  @path : /app/collections/tasks/
 *  @desc : Model to get a task
 *
 *  @return     CommentModel
 */


define([
    'jquery',
    'lodash',
    'backbone',
    
], function($, _, Backbone){

    var CommentModel = Backbone.Model.extend({

        url: '/comment',
        urlRoot: '/comment'

    });

    return CommentModel;

});
