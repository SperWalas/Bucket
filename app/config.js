require.config({


  paths: {
    'text' : '../vendors/requirejs-text/text', // RequireJS plugin
    "underscore": "../vendors/lodash/dist/lodash.underscore",
    "lodash": "../vendors/lodash/dist/lodash",
    "template": "../vendors/lodash-template-loader/loader",
    "jquery": "../vendors/jquery/dist/jquery",
    "backbone": "../vendors/backbone/backbone",
    "jqueryTag": "../vendors/jquery.tagsinput/src/jquery.tagsinput"
  },


  shim: {
    'jquery' : { 
    	exports: '$' 
    },
    'lodash' : { 
    	exports: '_' 
    },
    'backbone': {
        deps: ['jquery', 'lodash'],
        exports: 'Backbone'
    },
    'gsap' : {
    	exports: 'TweenMax'
    }
  },


  deps: ["main"]
});
