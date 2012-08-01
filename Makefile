BASEDIR = .

all: copy-demo-files zip-demo

copy-demo-files:
	cp $(BASEDIR)/css/hohoacc.css $(BASEDIR)/demo/css/
	cp $(BASEDIR)/js/hohoacc.js $(BASEDIR)/demo/js/libs/

zip-demo:
	rm -f $(BASEDIR)/demo/demo.zip
	zip -r $(BASEDIR)/demo.zip $(BASEDIR)/demo
	mv $(BASEDIR)/demo.zip $(BASEDIR)/demo/

