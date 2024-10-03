import { computed, watch } from "vue";
import { teamStore } from "src/hooks/global/useStore.js";
import { mergeObjects } from 'src/hooks/utilits.js'
import { useRouter } from "vue-router";
import { fetchProject } from "src/hooks/project/useProcess.js";

export default function useWatcher() {
  const router = useRouter();
  const val = computed(() => teamStore.income);
  watch(val, async(newVal, oldVal) => {
    if(!newVal || newVal === oldVal) return;
    const { team_id, project_id, board_id, data } = val.value.data;
    if(teamStore.team?.id === Number(team_id)){
      if(val.value.event === 'team:update'){
        teamStore.team = data;
      }
      if(val.value.event === 'team:delete'){
        teamStore.$reset();
      }
      if(val.value.event === 'team:join'){
        teamStore.team.members.push(data);
      }
      if(val.value.event === 'team:member_updated'){
        const noAuth = ['unconfirmed', 'blocked'].includes(teamStore.team?.status);
        if(noAuth){
          await toggleTeam(teamStore.team)
        }
        const index = teamStore.team.members.findIndex(item => item.id === data.id);
        if(index > -1){
          teamStore.team.members.splice(index, 1, data);
        }
      }
      if(val.value.event === 'team:member_leaved'){     
        const curUserMember = teamStore.team.members.find(item => item.by_user.id === teamStore.init?.id);
        if(curUserMember.id === Number(data.leaved_member_id)){
          teamStore.$reset();
        } else {
          teamStore.team.members = teamStore.team.members.filter(item => item.id !== Number(data.leaved_member_id));
        }
      }
      if(val.value.event === 'team:leave'){
        if(Number(data.removed_member_id) === teamStore.init?.id){
          teamStore.$reset();
        } else {
          teamStore.team.members = teamStore.team.members.filter(item => item.id !== Number(data.removed_member_id));
        }
      }
      if(val.value.event === 'board:deleted'){
        if(teamStore.project?.id === Number(project_id)){
          teamStore.project.boards = teamStore.project.boards.filter(item => item.id !== Number(data.removed_board));
        }
        if(teamStore.board?.id === Number(data.removed_board)){
          teamStore.board = void 0;
        }
      }
      if(val.value.event === 'board:created'){
        if(teamStore.project?.id === Number(project_id)){
          teamStore.project.boards.push(data);
        }
      }
      if(val.value.event === 'board:updated'){
        if(teamStore.project?.id === Number(project_id)){
          const index = teamStore.project.boards.findIndex(item => item.id === Number(data.id));
          teamStore.project.boards[index] = data;
        }
        if(teamStore.board?.id === Number(data.id)){
          teamStore.board = data;
        }
      }
      if(val.value.event === 'group:created'){
        if(teamStore.board?.id === Number(board_id)){
          teamStore.board.groups.push(data);
          const index = teamStore.project.boards.findIndex(item => item.id === Number(board_id));
          if(index > -1){
            teamStore.project.boards[index] = teamStore.board;
          }
        }
      }
      if(val.value.event === 'group:updated'){
        const groupIndex = teamStore.board?.groups?.findIndex(item => item.id === Number(data.id));
        if(groupIndex > -1){
          teamStore.board.groups[groupIndex] = data;
        }
        const index = teamStore.project.boards?.findIndex(item => item.id === Number(board_id));
        if(index > -1){
          teamStore.project.boards[index] = teamStore.board;
        }
      }
      if(val.value.event === 'group:deleted'){
        if(teamStore.kanban){
          const index = teamStore.board?.groups?.findIndex(item => item.id === Number(data.removed_group));
          if(index > -1){
            teamStore.kanban = void 0;
            router.push(`/team/${teamStore.team?.id}/board/${teamStore.board?.id}`);
          }
        } else {
          teamStore.board.groups = teamStore.board.groups.filter(item => item.id !== Number(data.removed_group));
        }
      }
      if(val.value.event === 'group:order' && teamStore.board?.id === Number(board_id)){
        teamStore.board.groups = data.order.map(item => {
          teamStore.board.groups.find(i => i.id === Number(item));
        });
      }

      if(val.value.event === 'channel:channel_created'){
        if(teamStore.team?.team_channels?.length > 0){
          teamStore.team.team_channels.push(data);
        } else {
          teamStore.team.team_channels = [data];
        }
      }
      if(val.value.event === 'channel:channel_deleted'){
        if(teamStore.team?.team_channels?.length > 0){
          teamStore.team.team_channels = teamStore.team?.team_channels?.filter(i => i.id !== Number(data.channel_id));
        }
      }
      if(val.value.event === 'channel:channel_updated'){      
        const index = teamStore.team.team_channels.findIndex(i => i.id === Number(data.id));
        if(index > -1){
          teamStore.team.team_channels[index] = data;
        }
      }
      if(val.value.event === 'channel:member_leaved'){
        const index = teamStore.team.team_channels.findIndex(i => i.id === Number(data.channel_id));
        if(index > -1){
          teamStore.team.team_channels[index].members = teamStore.team.team_channels[index].members.filter(i => i.id !== Number(data.leaved_member_id));
          if(teamStore?.mm_channel?.id === teamStore.team.team_channels[index].mm_channel?.id){
            teamStore.mm_channel = void 0;
            router.push('/teams');
          }
        }
        const curUserMember = teamStore.team?.members?.find(i => i.by_user.id === teamStore.init?.id);
        if(curUserMember?.id === Number(data.leaved_member_id)){
          teamStore.team.team_channels = teamStore.team.team_channels.filter(i => i.id !== Number(data.channel_id));
        }
      }
      if(val.value.event === 'channel:member_updated'){
        const index = teamStore.team.team_channels.findIndex(i => i.id === Number(data.id));
        if(index > -1){
          teamStore.team.team_channels[index] = data;
          teamStore.channel = data;
        } else {
          console.log('!!!!_inChannel', data);
          teamStore.team.team_channels.push(data);
        }
      }
      if(val.value.event === 'channel:member_join'){    
        const index = teamStore.team.team_channels.findIndex(i => i.id === Number(data.channel_id));
        if(index > -1){
          teamStore.team.team_channels[index].members.push(data.joined_member);
        }
  
        const _teamMemberIndex = teamStore.team?.members?.findIndex(i => i.id === Number(data.joined_member?.id));
        if(_teamMemberIndex > -1){
          teamStore.team.members[_teamMemberIndex] = data.joined_member;
        } else {
          teamStore.team.members.push(data.joined_member);
        }
      }
      if(val.value.event === 'project:project_created'){
        let _project = data.project
        const isCreator = data.project.project_members.find(i => i.by_user.id === teamStore.init?.id);
        if(!isCreator){
          _project = {
            id: _project.id,
            name: _project.name,
            overviews: _project.overviews,
            auth: {
                read: false
            }
          }
        }
        if(teamStore.team.projects?.length > 0){
          teamStore.team.projects.push(_project);
        } else {
          teamStore.team.projects = [_project];
        }
      }
      if(val.value.event === 'project:project_modify'){
        teamStore.project = mergeObjects(teamStore.project, data.project);        
        const index = teamStore.team.projects.findIndex(i => i.id === Number(project_id));
        if(index > -1){
          teamStore.team.projects[index] = mergeObjects(teamStore.team.projects[index], data.project);
        }
      }

      if(val.value.event === 'project:project_deleted'){
        
        teamStore.team.projects = teamStore.team.projects.filter(i => i.id !== Number(data.project_id));
        if(teamStore.project?.id === Number(data.project_id)){
          teamStore.$reset_project();
          router.push("/teams");
        }
      }
      if(val.value.event === 'project:project_achived'){
        teamStore.team.projects = teamStore.team.projects.filter(i => i.id !== Number(data.project_id));
        if(teamStore.project?.id === Number(data.project_id)){
          teamStore.$reset_project();
          router.push("/teams");
        }
      }
      if(val.value.event === 'project:join'){        
        teamStore.project.project_members = teamStore.project?.project_members || [];
        const index = teamStore.team.projects.findIndex(i => i.id === Number(project_id));
        if(teamStore.project.id === Number(project_id)){
          teamStore.project.project_members.push(data.member);
          teamStore.team.projects[index].project_members = teamStore.project.project_members;
        } else {
          teamStore.team.projects[index].project_members.push(data.member);
        }

        const _teamMemberIndex = teamStore.team?.members?.findIndex(i => i.id === Number(data.member?.id));
        if(_teamMemberIndex > -1){
          teamStore.team.members[_teamMemberIndex] = data.member;
        } else {
          teamStore.team.members.push(data.member);
        }
      }
      if(val.value.event === 'project:leave'){
        const curUserMember = teamStore.team.members.find(i => i.by_user.id === teamStore.init?.id);
        console.log('curUserMember', curUserMember);
        const index = teamStore.team.projects.findIndex(i => i.id === Number(project_id));
        teamStore.team.projects[index].project_members = teamStore.team.projects[index].project_members.filter(i => i.id !== Number(data.removeMember_id));
        const membersIDs_by_leave = teamStore.team.projects[index].project_members.map(i => i.id);
        console.log(membersIDs_by_leave, curUserMember.id, typeof membersIDs_by_leave, typeof curUserMember.id);
        if(!membersIDs_by_leave.includes(curUserMember.id)){
          let _i = teamStore.team.projects[index]
          teamStore.team.projects[index] = {
            id: _i.id,
            name: _i.name,
            overviews: _i.overviews,
            auth: {
              read: false
            }
          }
          if(teamStore.project.id === Number(project_id)){
            teamStore.$reset_project();
            router.push("/teams");
          }
        } else if(teamStore.project.id === Number(project_id)) {
          teamStore.project.project_members = teamStore.team.projects[index].project_members
        }

        const _teamMemberIndex = teamStore.team?.members?.findIndex(i => i.id === Number(data.member?.id));
        if(_teamMemberIndex > -1){
          teamStore.team.members[_teamMemberIndex] = data.member;
        }
      }
      if(val.value.event === 'project:member_updated'){
        const pindex = teamStore.team.projects.findIndex(i => i.id === Number(project_id));
        if(!teamStore.team.projects[pindex].auth?.read){          
          const fetch = await fetchProject(project_id);
          if (fetch) {
            teamStore.team.projects[pindex] = fetch;
          }
        } else {
          const mindex = teamStore.team.projects[pindex].project_members.findIndex(i => i.id === Number(data.member?.id));
          if(mindex > -1){
            teamStore.team.projects[pindex].project_members[mindex] = data.member;
            if(teamStore.project?.id === Number(project_id)){
              teamStore.project.project_members[mindex] = data.member;
            }
          } else {
            teamStore.team.projects[pindex].project_members.push(data.member);
            teamStore.project.project_members = teamStore.team.projects[pindex].project_members;
          }
        }

        const _teamMemberIndex = teamStore.team?.members?.findIndex(i => i.id === Number(data.member?.id));
        if(_teamMemberIndex > -1){
          teamStore.team.members[_teamMemberIndex] = data.member;
        }
      }
    }
  },{ immediate: true, deep: true });
}
