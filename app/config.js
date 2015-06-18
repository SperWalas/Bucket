require.config({


  paths: {
    'text' : '../vendors/requirejs-text/text', // RequireJS plugin
    "underscore": "../vendors/underscore/underscore",
    "lodash": "../vendors/lodash/lodash",
    "template": "../vendors/lodash-template-loader/loader",
    "jquery": "../vendors/jquery/dist/jquery",
    "backbone": "../vendors/backbone/backbone",
    "jqueryTag": "../vendors/jquery.tagsinput/src/jquery.tagsinput",
    'cookies': '../vendors/cookies-js/dist/cookies.min',
    'pdfJs': '../vendors/pdfjs-dist/build/pdf',
    'pdfViewerCompatibility': '../vendors/pdfjs-dist/web/compatibility',
    'pdfViewer': '../vendors/pdfjs-dist/web/pdf_viewer',

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
    },
    'pdfViewer' : {
        deps : ['pdfViewerCompatibility', 'pdfJs'],
        exports: 'PDFJS'
    }
  },


  deps: ["main"]
});
