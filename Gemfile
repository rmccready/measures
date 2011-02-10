source :gemcutter

gem 'quality-measure-engine', :git => 'http://github.com/pophealth/quality-measure-engine.git', :branch => 'develop'
gem 'bson_ext', :platforms => :mri

group :test do
  gem 'rspec'
  gem 'jsonschema'
  gem 'cover_me', '>= 1.0.0.rc5', :platforms => :ruby_19
  gem 'awesome_print', :require => 'ap'
  gem 'metric_fu'
  gem 'sinatra'
end

group :build do
  gem 'yard'
  gem 'kramdown' # needed by yard
end
