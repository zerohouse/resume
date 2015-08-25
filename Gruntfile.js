/**
 * Created by park on 15. 4. 23..
 */

module.exports = function (grunt) {

    grunt.file.defaultEncoding = "utf8";

    var config = {pkg: grunt.file.readJSON('package.json')};
    config.concat = {};
    config.watch = {};

    // Client JS File Concat And Uglify
    config.concat.client = {
        src: [
            'client/**/*.js'
        ],
        dest: 'dist/js.js'
    };
    config.uglify = {
        build: {
            src: 'dist/js.js',
            dest: 'dist/js.min.js'
        }
    };
    config.watch.client = {
        files: [
            'client/**/*.js'
        ],
        tasks: ['concat:client', 'uglify'],
        options: {
            interrupt: true
        }
    };

    // LESS Comfile And Concat
    config.less = {
        src: {
            expand: true,
            cwd: "client",
            dest: 'dist/css',
            src: "**/*.less",
            ext: ".css"
        }
    };
    config.concat_css = {
        all: {
            src: [
                "dist/css/**/*.css"
            ],
            dest: "dist/style.css"
        }
    };
    config.cssmin = {
        target: {
            files: [{
                expand: true,
                src: "dist/style.css",
                ext: '.min.css'
            }]
        }
    };
    config.clean = ['dist/css'];
    config.watch.css = {
        files: [
            'client/**/*.less'
        ],
        tasks: ['less', 'concat_css', 'cssmin', 'clean'],
        options: {
            interrupt: true
        }
    };

    // Copy Htmls
    config.copy = {
        main: {
            files: [
                {expand: true, cwd: 'client/', src: ['**/*.html'], dest: 'dist'}
            ]
        }
    };

    config.watch.html = {
        files: [
            'client/**/*.html'
        ],
        tasks: ['copy'],
        options: {
            interrupt: true
        }
    };


    config.concat.route = {
        src: [
            'server/route/pre',
            'server/route/**/*.js',
            'server/route/post'
        ],
        dest: 'server/route.js'
    };

    config.watch.route = {
        files: [
            'server/route/**/*.js'
        ],
        tasks: ['concat:route'],
        options: {
            interrupt: true
        }
    };

    config.concat.db = {
        src: [
            'server/db/pre',
            'server/db/**/*.js',
            'server/db/post'
        ],
        dest: 'server/db.js'
    };

    config.watch.db = {
        files: [
            'server/db/**/*.js'
        ],
        tasks: ['concat:db'],
        options: {
            interrupt: true
        }
    };

    config.nodemon = {
        dev: {
            script: 'server.dev.js',
            ignore: ['node_modules/**', 'client/**', 'dist/**'],
        }
    };

    config.concurrent = {
        dev: ["nodemon", "watch"],
        options: {
            logConcurrentOutput: true
        }
    };


    grunt.initConfig(config);
    grunt.loadNpmTasks("grunt-concurrent");
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');


    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify', 'less', 'concat_css', 'cssmin', 'copy', 'clean']);
    grunt.registerTask('run', ['concurrent:dev']);
};