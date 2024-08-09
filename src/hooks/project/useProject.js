export default function useProject(project) {
    let thumbnail
    if(project.default_version && project.overviews?.length > 0){
        const overview = project.overviews.find(overview => overview.id === project.default_version)
        if(overview){
            thumbnail = overview.media?.url
        } else {
            thumbnail = project.overviews[0].media?.url
        }
    }

    return {
        thumbnail
    }
}