SRC_DIR = src
TEST_DIR = test
BUILD_DIR = build

PREFIX = .
DIST_DIR = ${PREFIX}/dist

RHINO ?= java -jar ${BUILD_DIR}/js.jar

YUI_COMPRESSOR = ${BUILD_DIR}/yuicompressor.jar

MINJAR ?= java -jar ${YUI_COMPRESSOR} --preserve-semi

MODULES = ${SRC_DIR}/intro.js\
	${SRC_DIR}/bindable.js\
	${SRC_DIR}/loadable.js\
	${SRC_DIR}/renderable.js\
	${SRC_DIR}/pollable.js\
	${SRC_DIR}/cacheable.js\
	${SRC_DIR}/observable.js\
	${SRC_DIR}/outro.js

JQUERY_ENABLE = ${DIST_DIR}/jquery.enable.js
JQUERY_ENABLE_MIN = ${DIST_DIR}/jquery.enable.min.js

JQUERY_ENABLE_VER = $(shell cat version.txt)
VER = sed s/@VERSION/${JQUERY_ENABLE_VER}/

all: enable lint min lintmin
	@@echo "jQuery.enable build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

enable: ${JQUERY_ENABLE}
en: ${JQUERY_ENABLE}

${JQUERY_ENABLE}: ${MODULES} ${DIST_DIR}
	@@echo "Building" ${JQUERY_ENABLE}

	@@cat ${MODULES} | \
		sed 's/.function..jQuery.enable...{//' | \
		sed 's/}...jQuery.enable..;//' | \
		${VER} > ${JQUERY_ENABLE};

lint: ${JQUERY_ENABLE}
	@@echo "Checking jQuery.enable against JSLint..."
	@@${RHINO} build/jslint-check.js

min: ${JQUERY_ENABLE_MIN}

lintmin: ${JQUERY_ENABLE}
	@@echo "Checking jQuery.enable against JSLint..."
	@@${RHINO} build/jslint-check-min.js

${JQUERY_ENABLE_MIN}: ${JQUERY_ENABLE}
	@@echo "Building" ${JQUERY_ENABLE_MIN}

	@@${MINJAR} -o ${JQUERY_ENABLE_MIN}.tmp ${JQUERY_ENABLE}
	@@cat ${JQUERY_ENABLE_MIN}.tmp >> ${JQUERY_ENABLE_MIN}
	@@rm -f ${JQUERY_ENABLE_MIN}.tmp

clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}

.PHONY: all enable lint min lintmin init en clean
