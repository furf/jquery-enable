SRC_DIR = src
TEST_DIR = test
BUILD_DIR = build

PREFIX = .
DIST_DIR = ${PREFIX}/dist

RHINO ?= java -jar ${BUILD_DIR}/js.jar

YUI_COMPRESSOR = ${BUILD_DIR}/yuicompressor.jar

MINJAR ?= java -jar ${YUI_COMPRESSOR} --preserve-semi

DOCS_DIR = ${PREFIX}/docs

JSDOC = ${BUILD_DIR}/jsdoc-toolkit

DOCJAR ?= java -jar ${JSDOC}/jsrun.jar ${JSDOC}/app/run.js -a -d=${DOCS_DIR} -t=${JSDOC}/templates/jsdoc

BASE_FILES = ${SRC_DIR}/util.js\
	${SRC_DIR}/bindable.js\
	${SRC_DIR}/loadable.js\
	${SRC_DIR}/renderable.js\
	${SRC_DIR}/pollable.js\
	${SRC_DIR}/cacheable.js\
	${SRC_DIR}/observable.js\

MODULES = ${SRC_DIR}/intro.js\
	${BASE_FILES}\
	${SRC_DIR}/outro.js

JQUERY_ENABLE = ${DIST_DIR}/jquery.enable.js
JQUERY_ENABLE_MIN = ${DIST_DIR}/jquery.enable.min.js

JQUERY_ENABLE_VER = $(shell cat version.txt)
VER = sed s/@VERSION/${JQUERY_ENABLE_VER}/

all: clean build lint min doc
	@@echo "jQuery.enable build complete."

clean:
	@@echo "Removing documentation directory:" ${DOCS_DIR}
	@@rm -rf ${DOCS_DIR}

	@@echo "Removing distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}

${DIST_DIR}:
	@@echo "Making distribution directory:" ${DIST_DIR}
	@@mkdir -p ${DIST_DIR}

build: ${MODULES} ${DIST_DIR}
	@@echo "Building" ${JQUERY_ENABLE}

	@@cat ${MODULES} | \
		sed 's/.function..jQuery.enable...{//' | \
		sed 's/}...jQuery.enable..;//' | \
		${VER} > ${JQUERY_ENABLE};

lint:
	@@echo "Checking jQuery.enable against JSLint..."
	@@${RHINO} build/jslint-check.js

min: ${JQUERY_ENABLE}
	@@echo "Building" ${JQUERY_ENABLE_MIN}

	@@${MINJAR} -o ${JQUERY_ENABLE_MIN}.tmp ${JQUERY_ENABLE}
	@@cat ${JQUERY_ENABLE_MIN}.tmp >> ${JQUERY_ENABLE_MIN}
	@@rm -f ${JQUERY_ENABLE_MIN}.tmp

${DOCS_DIR}:
	@@echo "Making documentation directory:" ${DIST_DIR}
	@@mkdir -p ${DOCS_DIR}

doc: ${DOCS_DIR}
	@@echo "Generating documentation"
	@@${DOCJAR} ${JQUERY_ENABLE}

.PHONY: all build lint min init clean
