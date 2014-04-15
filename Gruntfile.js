module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    buster: {
      options: {
        config: 'specs/conf/buster.js'
      }
    },
    jshint: {
      files: ['lib/**/*.js']
    }

  });

  grunt.loadNpmTasks('grunt-buster');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', ['jshint', 'buster']);
};
