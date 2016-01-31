'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    project: {
      lib: 'lib',
      test: 'test',
      dist: 'dist',
      doc: 'doc',
      apidoc: '<%= project.doc %>/api',
      name: '<%= pkg.name %>',
      files:  [
       'Gruntfile.js',
       '<%= project.lib %>/**/*.js'
      ]
    },
    uglify: {
      dist: {
        files: [
          {
            dest: '<%= project.dist %>/<%= project.name %>.min.js',
            src: ['<%= project.dist %>/<%= project.name %>.js']
          }
        ]
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: {
        src: ['<%= project.files %>']
      }
    },
    jscs: {
      lint: {
        options: {
          config: '.jscsrc',
          esnext: true
        },
        src: ['<%= project.files %>']
      },
      fix: {
        options: {
          config: '.jscsrc',
          esnext: true,
          fix: true
        },
        src: ['<%= project.files %>']
      }
    },
    browserify: {
      dist: {
        options: {
          transform: ['babelify']
        },
        files: {
          '<%= project.dist %>/<%= project.name %>.js': ['<%= project.lib %>/<%= project.name %>.js']
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('compile', 'Compile from ES6 to ES5', ['browserify', 'uglify']);
  grunt.registerTask('linters', 'Check code for lint', ['jshint:all', 'jscs:lint']);
};
