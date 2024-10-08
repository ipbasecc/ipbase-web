export default function useProject(_Object) {
    let thumbnail
    let overview
    if(_Object.default_version && _Object.overviews?.length > 0){
        overview = _Object.overviews.find(overview => overview.id === _Object.default_version)
        if(overview){
            thumbnail = overview.media?.url
        } else {
            thumbnail = _Object.overviews[0].media?.url
        }
    } else if(!_Object.default_version && _Object.overviews?.length > 0){
        thumbnail = _Object.overviews[0].media?.url
    }
    console.log('thumbnail', thumbnail)
    thumbnail = thumbnail + process.env.THUMBNAIL_RESIZE    
    console.log('thumbnail 2', thumbnail)
    return {
        overview,
        thumbnail
    }
}