/**
 * Created by park on 15. 4. 23..
 */

module.exports = function (grunt) {

    grunt.file.defaultEncoding = "utf8";
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            build: {
                src: 'dist/js.js',
                dest: 'dist/js.min.js'
            }
        },
        //concat 설정
        concat: {
            client: {
                src: [
                    'client/**/*.pjs'
                ],
                dest: 'dist/js.js'
            },
            server: {
                src: [
                    'server/**/*.pjs',
                    'server/**/*.model',
                    'server/**/*.route'
                ],
                dest: 'app.js'
            }
        },

        less: {
            src: {
                expand: true,
                cwd: "client",
                dest: 'dist/css',
                src: "**/*.less",
                ext: ".css"
            }
        },

        concat_css: {
            all: {
                src: [
                    "dist/css/**/*.css"
                ],
                dest: "dist/style.css"
            }
        },

        cssmin: {
            target: {
                files: [{
                    expand: true,
                    src: "dist/style.css",
                    ext: '.min.css'
                }]
            }
        },

        copy: {
            main: {
                files: [
                    {expand: true, cwd: 'client/', src: ['**/*.html'], dest: 'dist'}
                ]
            }
        },

        clean: ['dist/css'],

        watch: {
            scripts: {
                files: [
                    '**/*.pjs',
                    '**/*.route',
                    '**/*.model',
                    '**/*.less'
                ],
                tasks: ['concat', 'uglify', 'less', 'concat_css', 'cssmin', 'copy', 'clean'],
                options: {
                    interrupt: true
                }
            }
        }
    });

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

};