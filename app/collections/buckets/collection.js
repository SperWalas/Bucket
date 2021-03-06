



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
    'collections/buckets/model'

], function($, _, Backbone, BucketModel){

    var BucketCollection = Backbone.Collection.extend({


       	model: BucketModel, // Generally best practise to bring down a Model/Schema for your collection

        url: '/bucket',

        // On init model
        initialize : function() {},

    });

    return BucketCollection;

});
