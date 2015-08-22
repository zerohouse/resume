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
                    'client/**/*.cjs'
                ],
                dest: 'dist/js.js'
            },
            server: {
                src: [
                    'server/**/*.sjs',
                    'server/**/*.model',
                    'server/**/*.route'
                ],
                dest: 'server.js'
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

        watch: {
            scripts: {
                files: [
                    '**/*.sjs',
                    '**/*.cjs',
                    '**/*.route',
                    '**/*.model',
                    '**/*.less'
                ],
                tasks: ['concat', 'uglify', 'less', 'concat_css', 'cssmin'],
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

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify', 'less', 'concat_css', 'cssmin']);

};