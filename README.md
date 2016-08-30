# mead

<img align="right" width="270" height="270" src="assets/mead.png" alt="Mead">

On-the-fly image transforming service written in Node.js.  
Uses [libvips](https://github.com/jcupitt/libvips) for performant image operations.

## Features

* Supports multiple sources with independent configurations
* Source adapters as plugins
  - [Filesystem](https://github.com/rexxars/mead-plugin-source-fs)
  - [Web folder](https://github.com/rexxars/mead-plugin-source-webfolder)
  - [HTTP proxy](https://github.com/rexxars/mead-plugin-source-proxy)
  - [Google Cloud Storage](https://github.com/rexxars/mead-plugin-source-gcs)
  - [S3](https://github.com/rexxars/mead-plugin-source-s3)
* Signed URLs (optional)

## Installing

```shell
npm install -g mead
mead --config path/to/config.js
```

## Configuration

Mead can be passed the path of a configuration file. It can be either a plain JSON file or a node module that exports a plain object. The passed configuration will be merged with the defaults. Example:

**meadConfig.js**:
```js
module.exports = {
  sources: [{
    name: 'holiday',
    adapter: 'fs',
    config: {
      basePath: '/home/rexxars/photos/holiday',
      secureUrlToken: 'mootools'
    }
  }, {
    name: 'proxy',
    adapter: 'proxy',
    config: {
      secureUrlToken: 'foobar'
    }
  }, {
    name: 'hacknights',
    adapter: 'webfolder',
    config: {
      baseUrl: 'https://espen.codes/photos/hacknights'
    }
  }],

  plugins: [
    require('mead-plugin-something')
  ]
}
```

**Running**:
```
mead --config=meadConfig.js
```

This will expose three channels (`holiday`, `proxy` and `hacknights`), which all use different source adapters. The three adapters mentioned (`fs`, `proxy` and `webfolder`) are plugins which are bundled with mead and enabled by default.

We're also telling mead to load the additional `something`-plugin.

## Advanced configuration

For more fine grained control, you can point to a module which exports a function, which will receive the default configuration as it's only argument and should return a new configuration. Example:

**meadConfig.js**:

```js
module.exports = baseConfig => {
  /**
   * By default, mead will merge configurations using `lodash.merge`, which
   * concatenates arrays and merges objects. If we instead want to override
   * an array (for instance the plugins array), we can do that by manually
   * building the wanted configuration, as seen here.
   * 
   * Be sure to check `src/config/baseConfig` to see which defaults you are
   * overriding to make sure you don't disable any wanted functionality.
   */
  return Object.assign({}, baseConfig, {
    // Lets only load the S3 storage plugin, and use an alternative URL signing method 
    plugins: [
      require('mead-plugin-source-s3'),
      require('mead-plugin-signature-sha256')
    ]
  })
}
```

## License

MIT-licensed. See LICENSE.
