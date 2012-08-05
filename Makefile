BASEDIR = .
JSLINT = $(BASEDIR)/node_modules/jslint/bin/jslint.js --indent 2 --browser true
UGLIFYJS = $(BASEDIR)/node_modules/uglify-js/bin/uglifyjs

all: copy-demo-files uglify zip-demo

copy-demo-files:
	cp $(BASEDIR)/css/hohoacc.css $(BASEDIR)/demo/css/
	cp $(BASEDIR)/js/hohoacc.js $(BASEDIR)/demo/js/libs/

uglify:
	node $(UGLIFYJS) -o $(BASEDIR)/demo/js/libs/hohoacc.min.js $(BASEDIR)/demo/js/libs/hohoacc.js

zip-demo:
	rm -f $(BASEDIR)/demo/demo.zip
	zip -r $(BASEDIR)/demo.zip $(BASEDIR)/demo
	mv $(BASEDIR)/demo.zip $(BASEDIR)/demo/

jslint:
	node $(JSLINT) $(BASEDIR)/js/hohoacc.js