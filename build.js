const { wrapper, compile } = require('./dist/ejs')

const babel = require('@babel/core')
const { Transform } = require('readable-stream')
const File = require('vinyl')
const crypto = require('crypto')

const presetEnv = '@babel/preset-env'

const presetMinify = [
    'minify',
    {
        mangle: false,
        builtIns: false,
        deadcode: false,
    },
]

const babelTransform = (content) => {
    return new Promise((resolve, reject) => {
        babel.transform(
            content,
            {
                sourceType: 'script',
                presets: [presetEnv, presetMinify],
            },
            (error, result) => {
                if (error) reject(error)
                if (result) resolve(result)
            }
        )
    })
}

const transformCache = {
    secret: 'memoryCache',
    store: {},
    key(file) {
        return file.relative
    },
    hash(content) {
        return crypto.createHash('sha256').update(content).digest('base64')
    },
    exist(key, hash) {
        if (this.store[key]) {
            return this.store[key].hash === hash
        }
        return null
    },
    get(key, hash) {
        if (this.exist(key, hash)) {
            return this.store[key].data
        }
        return null
    },
    save(key, data, hash) {
        this.store[key] = {
            hash,
            data,
        }
        return this
    },
}

const compileTemplates = ({ namespace, filename }) => {
    const concat = []
    return new Transform({
        objectMode: true,
        transform(file, enc, callback) {
            if (file !== null) {
                if (file.isStream()) {
                    this.emit(
                        'error',
                        new Error('compileTemplates: Streaming not supported')
                    )
                    callback()
                } else if (file.isBuffer()) {
                    const relative = file.relative
                    const contents = file.contents.toString()
                    const modified = transformCache.hash(contents)
                    const fromCache = transformCache.get(relative, modified)
                    if (fromCache) {
                        concat.push(fromCache)
                        return callback()
                    }
                    babelTransform(compile(contents, relative).source)
                        .then((result) => {
                            const data = {
                                name: file.relative,
                                content: Buffer.from(result.code),
                            }
                            transformCache.save(relative, data, modified)
                            concat.push(data)
                            callback()
                        })
                        .catch((error) => {
                            this.emit('error', new Error(error))
                            callback()
                        })
                }
            }
        },
        flush(callback) {
            const content = wrapper(namespace, concat)
            const file = new File({
                path: filename,
                contents: Buffer.from(content),
            })
            this.push(file)
            callback()
        },
    })
}

exports.compileTemplates = compileTemplates
