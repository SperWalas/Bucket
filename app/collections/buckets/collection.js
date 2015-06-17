



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

        parse: function(response) {
            var contributors;
            var accomplished;
            var percent;
            var files;
            var data;
            var exist;
            var index;

            _.forEach(response, function(bucket) {
                contributors = [];
                accomplished = 0;
                percent = 0;
                files = 0;

                _.forEach(bucket.tasks, function(task){
                    
                    if (task.accomplish) {
                        accomplished++;
                    }

                    files += _.size(task.files);

                    _.forEach(task.contributors, function(contributor) {

                        exist = _.find(contributors, function(value) {
                            return value.email === contributor.email;
                        });

                        if (exist === undefined) {
                            data = {};
                            data.name = contributor.name || 'User';
                            data.email = contributor.email;
                            data.tasks = [];
                            data.tasks.push(task.id);
                            contributors.push(data);
                        } else {
                            index = contributors.indexOf(exist);
                            exist.tasks.push(task.id);
                            contributors[index] = exist;
                        }
                    });
                });

                if( bucket.tasks.length) {
                    percent = (accomplished / bucket.tasks.length) * 100;
                } else {
                    percent = 0;
                }

                index = response.indexOf(bucket);

                bucket.contributors = contributors;
                bucket.percent = percent;
                bucket.accomplished = accomplished;
                bucket.files = files;

                response[index] = bucket;
            });

            return response;
        }


    });

    return BucketCollection;

});
