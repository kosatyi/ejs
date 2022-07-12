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
                if (result) resolve(result.code)
            }
        )
    })
}

const cache = {
    store: {},
    key(content) {
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

const gulpCompile = ({ compile, wrapper, filename }) => {
    const concat = []
    return new Transform({
        objectMode: true,
        transform(file, enc, callback) {
            if (file === null) return
            if (file.isStream()) {
                this.emit(
                    'error',
                    new Error('compileTemplates: Streaming not supported')
                )
                callback()
            } else if (file.isBuffer()) {
                const relative = file.relative
                const contents = file.contents.toString()
                const modified = cache.key(contents)
                let data = cache.get(relative, modified)
                if (data) {
                    concat.push(data)
                    return callback()
                }
                const source = compile(contents, relative).source
                babelTransform(source)
                    .then((result) => {
                        const data = {
                            name: relative,
                            content: Buffer.from(String(result)),
                        }
                        cache.save(relative, data, modified)
                        concat.push(data)
                    })
                    .catch((error) => {
                        this.emit('error', new Error(error))
                    })
                    .finally(callback)
            }
        },
        flush(callback) {
            const content = wrapper(concat)
            const file = new File({
                path: filename,
                contents: Buffer.from(content),
            })
            this.push(file)
            callback()
        },
    })
}

exports.gulpCompile = gulpCompile
