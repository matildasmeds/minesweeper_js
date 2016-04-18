module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    karma: {
      options: {
        frameworks: ['mocha', 'chai'],
        files: ['js/**/*.js', 'test/**/*.js'],
        reporters: ['spec'],
        plugins: [
          'karma-phantomjs-launcher',
          'karma-firefox-launcher',
          'karma-chai',
          'karma-mocha',
          'karma-spec-reporter'
        ]
      },
      unit: {
        browsers: ['PhantomJS'],
        singleRun: true
      },
      debug_unit: {
        browsers: ['Firefox'],
        client: {
          mocha: {
            reporter: 'html'
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('test', ['karma:unit']);
  grunt.registerTask('debug_test', ['karma:debug_unit']);
  grunt.registerTask('default', 'test');
};
