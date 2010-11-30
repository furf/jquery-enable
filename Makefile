PREFIX = .
SRC_DIR = src
BUILD_DIR = build
DIST_DIR = ${PREFIX}/dist
DOCS_DIR = ${PREFIX}/docs

# Used to lint scripts
RHINO ?= java -jar ${BUILD_DIR}/js.jar

# Compression
YUI_COMPRESSOR = ${BUILD_DIR}/yuicompressor.jar
COMPRESS ?= java -jar ${YUI_COMPRESSOR} --preserve-semi

# Documentation
JSDOC = ${BUILD_DIR}/jsdoc-toolkit
DOCJAR ?= java -jar ${JSDOC}/jsrun.jar ${JSDOC}/app/run.js -a -d=${DOCS_DIR} -t=${JSDOC}/templates/jsdoc

# Version
ENABLE_VER = $(shell cat version.txt)
VER = sed s/@VERSION/${ENABLE_VER}/

# Packages
ENABLE = jquery.enable
ENABLE_JS = ${DIST_DIR}/${ENABLE}.js
ENABLE_MIN = ${DIST_DIR}/${ENABLE}.min.js
ENABLE_MODULES = ${SRC_DIR}/intro.js\
	${SRC_DIR}/util.js\
	${SRC_DIR}/bindable.js\
	${SRC_DIR}/loadable.js\
	${SRC_DIR}/renderable.js\
	${SRC_DIR}/pollable.js\
	${SRC_DIR}/cacheable.js\
	${SRC_DIR}/observable.js\
	${SRC_DIR}/outro.js\

BINDABLE = jquery.bindable
BINDABLE_JS = ${DIST_DIR}/${BINDABLE}.js
BINDABLE_MIN = ${DIST_DIR}/${BINDABLE}.min.js
BINDABLE_MODULES = ${SRC_DIR}/intro.js\
	${SRC_DIR}/util.js\
	${SRC_DIR}/bindable.js\
	${SRC_DIR}/outro.js\


all: init build lint min doc
	@@echo "Build complete."

init:
	@@echo "Making distribution directory:" ${DIST_DIR}
	@@mkdir -p ${DIST_DIR}

build:
	@@echo "Building:" ${ENABLE_JS}
	@@cat ${ENABLE_MODULES} | \
		sed s/@SCRIPT/${ENABLE}/ | \
		${VER} > ${ENABLE_JS};
	@@echo "Building:" ${BINDABLE_JS}
	@@cat ${BINDABLE_MODULES} | \
		sed s/@SCRIPT/${BINDABLE}/ | \
		${VER} > ${BINDABLE_JS};

lint:
	@@echo "Checking with JSLint..."
	@@${RHINO} ${BUILD_DIR}/jslint-check.js

min:
	@@echo "Minimizing:" ${ENABLE_MIN}
	@@${COMPRESS} -o ${ENABLE_MIN} ${ENABLE_JS}
	@@echo "Minimizing:" ${BINDABLE_MIN}
	@@${COMPRESS} -o ${BINDABLE_MIN} ${BINDABLE_JS}

doc:
	@@echo "Making documentation directory:" ${DOCS_DIR}
	@@mkdir -p ${DOCS_DIR}
	@@echo "Generating documentation"
	@@${DOCJAR} ${ENABLE_JS}

.PHONY: all init build lint min doc
