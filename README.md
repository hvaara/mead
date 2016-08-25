# mead

Image thing

## Notes

### Sources

- Define one or many image sources
- Make source lookup adapter dynamic. Default can be just a config, but can be told to fetch from other source
- Source name passed as either path prefix (`/<source>`) or subdomain (`<source>.api`). Global setting.
- Storage adapters can be added, probably want to support S3/GCS, proxy, file system

## Pluggability

- All adapters should be event emitters, implementing some baseline events
  - onBeforeFetch

### Performance

- Configurable cache settings for images
- Use sharp as default adapter for scaling images
- Prescale options ("variants")
- Caching

### Security

- Optional signing of URLs. Probably want to make it mandatory for proxy source adapter.
- Signature should be simple to implement. Configurable? Default: md5(sourceToken + path + query)
- Uses query parameter `s`

### URLs

- **File system source**
- `http://source.mead.api/folder/image-name.jpg?w=1400`
- `http://source.mead.api/folder/image-name.jpg?w=1400&h=700&fit=crop`
- **Proxy source**
- `http://source.mead.api/<urlencoded-image-url.jpg>?w=1400`

### Metadata

- Some kind of basic metadata API?

### Additional features

- Error image URL
- Missing image URL

## License

MIT-licensed. See LICENSE.
