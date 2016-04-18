module.exports = function(grunt){
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    karma: {
      options: {
        frameworks: ['mocha', 'chai'],
        files: ['js/**/*.js', 'test/**/*.js'],
        preprocessors: {
          'js/**/*.js': ['coverage']
        },
        reporters: ['spec', 'coverage'],
        coverageReporter: {
          reporters: [
            {
              type: 'text-summary' //Line coverage report output to the console
            },
            {
              type : 'html',
              dir: 'coverage/' //HTML code coverage report will be produced in the coverage directory
            }
          ]
        },
        plugins: [
          'karma-coverage',
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
        //Firefox will open
        browsers: ['Firefox'],
        client: {
          mocha: {
            //clicking Debug will show the HTML report with clickable specs
            //the corresponding url like http://localhost:9890/debug.html can be open in any browser
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
