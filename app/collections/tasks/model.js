

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

    var TaskModel = Backbone.Model.extend({

        defaults: {
            users: [],
            name: '',
            bucket: {},
        },

        urlRoot: '/task'
    });

    return TaskModel;

});
