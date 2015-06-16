module.exports = function(grunt) {
    "use strict";

    //Load module Rewrite URL
    var modRewrite = require('connect-modrewrite');

    grunt.initConfig({



        /**
         *  Wipe out previous builds and test reporting.
         */
        clean: ["dist/"],



        /**
         *  Run your source code through JSHint's defaults.
         */
        jshint: {
            all : ["app/**/*.js"],
            options: {
                smarttabs: true
            }
        },



        /**
         *  R.js AMD builder to take all
         *  modules and concatenate them into a single file.
         */
        requirejs: {
            release: {
                options: {
                    mainConfigFile: "app/config.js",
                    generateSourceMaps: true,

                    out: "dist/source.min.js",
                    optimize: "uglify2",

                    // Since we bootstrap with nested `require` calls this option allows
                    // R.js to find them.
                    findNestedDependencies: true,

                    // Include a minimal AMD implementation shim.
                    name: "almond",

                    // Setting the base url to the distribution directory allows the
                    // Uglify minification process to correctly map paths for Source
                    // Maps.
                    baseUrl: "dist/app",

                    // Wrap everything in an IIFE.
                    wrap: true,

                    // Do not preserve any license comments when working with source
                    // maps.  These options are incompatible.
                    preserveLicenseComments: false
                }
            }
        },




        /**
         *  Minfiy the distribution CSS.
         */
        cssmin: {
            release: {
                files: {
                    "dist/styles.min.css": ["dist/styles.css"]
                }
            }
        },




        /**
         *  Task to compile the SCSS
         */
        sass: {                              // Task
            dist: {                            // Target
                options: {                       // Target options
                    style: 'expanded',
                    sourcemap: 'none'
                },
                files: {                         // Dictionary of files
                    'app/styles/styles.css': 'app/styles/scss/styles.scss',       // 'destination': 'source'
                }
            }
        },



        /**
         *  Task to compile the SCSS
         */
        processhtml: {
            release: {
                files: {
                    "dist/index.html": ["index.html"]
                }
            }
        },




        /**
         *  Task to copy sources file to dist
         */
        copy: {
            release: {
                files: [
                    {
                        src: ["app/**"],
                        dest: "dist/"
                    },
                    {
                        src: "vendors/**",
                        dest: "dist/"
                    },
                    {
                        src:"*.png",
                        dest:"dist/"
                    },
                    {
                        src: ["app/styles/styles.css"],
                        dest: "dist/",
                        flatten: true,
                        expand: true
                    }
                ]
            }
        },




        /**
         *  Watch if CSS/JS/HTML files is modified then
         *  Compile scss to css + check JS ans browser is refresh
         */
        watch: {
            scripts: {
                files: ['app/**/*.js', 'app/styles/**/*.scss', 'app/**/*.html', 'index.html'],
                tasks: ['sass', 'jshint'],
                options: {
                    livereload: true
                }
            }
        },



        /**
         *  Lunch server on localhost:9000
         */
        connect: {
            server: {
                options: {
                    port: 9000,
                    hostname: '*',
                    open: true,
                    // Fix route #
                    middleware: function(connect, options) {
                        var middlewares;
                        middlewares = [];
                        middlewares.push(modRewrite(['^[^\\.]*$ /index.html [L]']));
                        options.base.forEach(function(base) {
                            return middlewares.push(connect["static"](base));
                        });
                        return middlewares;
                    }
                }
            }
        }
    });




    /**
     *  Grunt contribution tasks.
     */
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks("grunt-bbb-requirejs");




    /**
     *  Create a build to prod from sources 
     *  @use: grunt
     */
    grunt.registerTask("default", [
        "clean",
        "jshint",
        "processhtml",
        "copy",
        "requirejs",
        "cssmin"
      ]);




    /**
     *  Start server and lunch watch task to livereload and compile SCSS 
     *  @use: grunt server
     */
    grunt.registerTask("server", [
        "connect",
        "watch"
    ]);

};


