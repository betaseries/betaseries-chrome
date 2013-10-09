// npm install grunt
// npm install grunt-contrib-jasmine

module.exports = function(grunt) {
  // Example configuration
  grunt.initConfig({
    jasmine: {
      pivotal: {
        src: ['app/js/store.js', 'test/unit/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('test', ['jasmine']);
}