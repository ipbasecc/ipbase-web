
import { projectMeetAuth } from 'src/api/strapi/project.js'
import { ref } from 'vue'

const jitsi_token = ref()
export default async function useMeet(project_id) {
    if(jitsi_token.value){
        return {
            jitsi_token: jitsi_token.value
        }
    }

    const { data, error } = await projectMeetAuth({
        data: {
            project_id: project_id
        }
    })
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