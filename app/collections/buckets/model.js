

/**
 *  model.js
 *  @path : /app/collections/buckets/
 *  @desc : Model to get a bucket
 *
 *  @return     BucketModel
 */


define([
    'jquery',
    'lodash',
    'backbone',
    
], function($, _, Backbone){

    var BucketModel = Backbone.Model.extend({

        defaults: {
            id: '',
            name : '',
            tasks : {},
            authors : {}
        },
        
        url : '/bucket',

        // On init model
        initialize : function() {},


    });

    return BucketModel;

});
