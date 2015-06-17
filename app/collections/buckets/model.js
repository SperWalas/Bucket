

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
        
        urlRoot: '/bucket',

        // On init model
        initialize : function() {},

        parse: function(response) {
            var contributors = [];
            var accomplished = 0;
            var percent = 0;
            var data;
            var exist;
            var index;

            _.forEach(response.tasks, function(task) {

                if (task.accomplish) {
                    accomplished++;
                }

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

            percent = (accomplished / response.tasks.length) * 100;

            response.contributors = contributors;
            response.percent = percent;
            response.accomplished = accomplished;

            return response;
        }


    });

    return BucketModel;

});
