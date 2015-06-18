

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
            name: '',
            authors: [],
            tasks: [],
            users: []
        },
        
        urlRoot: '/bucket',

        // On init model
        initialize : function() {},

        parse: function(response) {

            var contributors = [];
            var accomplished = 0;
            var percent = 0;
            var files = 0;
            var data;
            var exist;
            var index;

            _.forEach(response.tasks, function(task) {

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


            if (typeof response.tasks !== 'undefined' && response.tasks.length > 0) {
                percent = (accomplished / response.tasks.length) * 100;
            }

            response.contributors = contributors;
            response.users = contributors;
            response.percent = percent;
            response.accomplished = accomplished;
            response.files = files;

            return response;
        }


    });

    return BucketModel;

});
