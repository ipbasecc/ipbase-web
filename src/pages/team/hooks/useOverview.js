import { computed } from "vue";
import { sortByField } from 'src/hooks/utilits.js'
import { i18n } from 'src/boot/i18n.js';
const $t = i18n.global.t;

export default function useOverview(version) {
    const playlist = computed(() => {
        if(version?.mps_info) {
          let media = version.mps_info.mediaList.media[0];
          // console.log('media', media);
          
          const _playlist = media.playList?.play
          // console.log('_playlist', _playlist);
          if(_playlist?.map(i => i.width)?.includes(media.width)){
            return _playlist
          } else {
            return [media, ..._playlist];
          }
        } else {
          return [{file: {
            id: version?.media?.id,
            URL: version?.media?.url,
            ext: version?.media?.name
          }}];
        }
      });
    const quality = computed(() => {
    if(playlist.value?.length > 0){
        let list = sortByField(playlist.value, 'width', 'desc');
        return list.map((item,index) => {
        return {
            default: index === list.length - 1,
            html: item.width ? $t(`quality_${item.width}`) : $t(`quality_source`),
            url: item.file.URL
        };
        });
    } else {
        return []
    }
    })
    const miniURL = computed(() => {
        return quality[playlist.value.length - 1]?.file?.url
    })
    return { quality, miniURL }
}