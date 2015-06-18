

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

            var self = this;
            var contributors = [];
            var users = [];
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

                _forEach(tasks.files, function(file){
                    if (!file.accepted) {
                        files++;
                    }
                });

                _.forEach(task.contributors, function(contributor) {

                    exist = _.find(contributors, function(value) {
                        return value.email === contributor.email;
                    });

                    if (exist === undefined) {
                        data = {};
                        data.email = contributor.email;
                        users.push(data);
                        data.name = contributor.name || 'User';
                        data.tasks = [];
                        taskToAdd = {
                            id : task.id,
                            file : _.filter(task.files, function(file) { file.sizeFormated = self.fileSizeSI(file.size); return ( file.users === contributor.id && file.tasks === task.id ); })
                        };
                        data.tasks.push(taskToAdd);
                        contributors.push(data);
                    } else {
                        index = contributors.indexOf(exist);
                        taskToAdd = {
                            id : task.id,
                            file : _.filter(task.files, function(file) { file.sizeFormated = self.fileSizeSI(file.size); return ( file.users === contributor.id && file.tasks === task.id ); })
                        };
                        exist.tasks.push(taskToAdd);
                        contributors[index] = exist;
                    }
                });
            });


            if (typeof response.tasks !== 'undefined' && response.tasks.length > 0) {
                percent = (accomplished / response.tasks.length) * 100;
            }

            response.contributors = contributors;
            response.users = users;
            response.percent = percent;
            response.accomplished = accomplished;
            response.files = files;

            return response;
        },


        /**
         *  Convert size to readable
         */

        fileSizeSI:function(a,b,c,d,e){
             return (b=Math,c=b.log,d=1e3,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2)+' '+(e?'kMGTPEZY'[--e]+'B':'Bytes');
        },


    });

    return BucketModel;

});
