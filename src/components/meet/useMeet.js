
import { projectMeetAuth } from 'src/api/strapi/project.js'
import { ref } from 'vue'

const jitsi_token = ref()
export default async function useMeet(_params) {
    if(jitsi_token.value){
        return {
            jitsi_token: jitsi_token.value
        }
    }

    const { data, error } = await projectMeetAuth(_params)
    console.log('jitsi_token', data)
    if(data?.token){
        jitsi_token.value = data.token
    } else {
        jitsi_token.value = null
    }
    return {
        jitsi_token: jitsi_token.value
    }
}